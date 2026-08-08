from __future__ import annotations

import fitz
import pytest

from app.core.config import settings
from app.services import pdf_edit_service as svc


def _pdf(pages: int = 3, text: str = "Confidential salary 92000") -> bytes:
    doc = fitz.open()
    for i in range(pages):
        page = doc.new_page()
        page.insert_text((72, 120), f"Page {i + 1}", fontsize=24)
        page.insert_text((72, 200), text, fontsize=14)
    data = doc.tobytes()
    doc.close()
    return data


def _open_output(output_id: str) -> fitz.Document:
    return fitz.open(str(settings.OUTPUT_DIR / f"{output_id}.pdf"))


# --------------------------------- parse_pages ------------------------------ #

@pytest.mark.parametrize(
    "spec,total,expected",
    [
        ("all", 3, [0, 1, 2]),
        ("", 2, [0, 1]),
        ("1,3", 3, [0, 2]),
        ("2-3", 3, [1, 2]),
        ("1,1,2", 3, [0, 1]),          # de-duplicated
        ("1-99", 3, [0, 1, 2]),        # clamped to the document
    ],
)
def test_parse_pages(spec, total, expected):
    assert svc.parse_pages(spec, total) == expected


@pytest.mark.parametrize("spec", ["abc", "3-1", "0-2", "foo,1"])
def test_parse_pages_rejects_nonsense(spec):
    with pytest.raises(svc.PdfEditError):
        svc.parse_pages(spec, 5)


# ---------------------------------- watermark ------------------------------- #

def test_watermark_adds_text_to_every_page():
    out, size = svc.watermark(_pdf(2), "DRAFT", tile=False)
    assert size > 0
    with _open_output(out) as doc:
        assert doc.page_count == 2
        for page in doc:
            assert "DRAFT" in page.get_text()


def test_watermark_can_target_specific_pages():
    out, _ = svc.watermark(_pdf(3), "COPY", tile=False, pages="2")
    with _open_output(out) as doc:
        assert "COPY" not in doc[0].get_text()
        assert "COPY" in doc[1].get_text()
        assert "COPY" not in doc[2].get_text()


def test_watermark_rejects_empty_text():
    with pytest.raises(svc.PdfEditError):
        svc.watermark(_pdf(1), "   ")


# -------------------------------- page numbers ------------------------------ #

def test_page_numbers_are_written():
    out, _ = svc.page_numbers(_pdf(3))
    with _open_output(out) as doc:
        # Page 3's own body says "Page 3"; the footer adds a bare "3".
        assert doc[2].get_text().strip().endswith("3")


def test_page_numbers_respect_start_at_and_format():
    out, _ = svc.page_numbers(_pdf(2), start_at=5, fmt="Page {n} of {total}")
    with _open_output(out) as doc:
        assert "Page 5 of 2" in doc[0].get_text()


def test_page_numbers_can_skip_the_cover():
    out, _ = svc.page_numbers(_pdf(2), fmt="[{n}]", skip_first=True)
    with _open_output(out) as doc:
        assert "[1]" not in doc[0].get_text()
        assert "[2]" in doc[1].get_text()


def test_page_numbers_rejects_a_format_without_the_placeholder():
    with pytest.raises(svc.PdfEditError):
        svc.page_numbers(_pdf(1), fmt="no placeholder")


def test_page_numbers_rejects_unknown_position():
    with pytest.raises(svc.PdfEditError):
        svc.page_numbers(_pdf(1), position="middle-nowhere")


# ------------------------------------ crop ---------------------------------- #

def test_crop_shrinks_the_visible_box():
    src = _pdf(1)
    with fitz.open(stream=src, filetype="pdf") as before:
        original = before[0].rect.height

    out, _ = svc.crop(src, top=10, bottom=10)
    with _open_output(out) as doc:
        assert doc[0].rect.height < original


def test_crop_keeps_text_selectable():
    """CropBox only changes the visible window - nothing is re-rendered."""
    out, _ = svc.crop(_pdf(1), left=5, right=5)
    with _open_output(out) as doc:
        assert "Page 1" in doc[0].get_text()


@pytest.mark.parametrize("kwargs", [{"top": 50}, {"left": -1}, {"bottom": 80}])
def test_crop_rejects_out_of_range_trims(kwargs):
    with pytest.raises(svc.PdfEditError):
        svc.crop(_pdf(1), **kwargs)


# ---------------------------------- organize -------------------------------- #

def test_organize_reorders_pages():
    out, _ = svc.organize(_pdf(3), "3,1,2")
    with _open_output(out) as doc:
        assert doc.page_count == 3
        assert "Page 3" in doc[0].get_text()
        assert "Page 1" in doc[1].get_text()
        assert "Page 2" in doc[2].get_text()


def test_organize_can_subset():
    out, _ = svc.organize(_pdf(4), "2,4")
    with _open_output(out) as doc:
        assert doc.page_count == 2
        assert "Page 2" in doc[0].get_text()
        assert "Page 4" in doc[1].get_text()


def test_organize_reverses_with_a_descending_range():
    out, _ = svc.organize(_pdf(3), "3-1")
    with _open_output(out) as doc:
        assert "Page 3" in doc[0].get_text()
        assert "Page 1" in doc[2].get_text()


def test_organize_rejects_a_page_that_does_not_exist():
    with pytest.raises(svc.PdfEditError):
        svc.organize(_pdf(2), "1,9")


# ----------------------------------- redact --------------------------------- #

def test_redact_removes_the_text_entirely():
    """A black rectangle would leave the text selectable; redaction must not."""
    out, _, hits = svc.redact(_pdf(2), ["92000"])
    assert hits == 2
    with _open_output(out) as doc:
        for page in doc:
            assert "92000" not in page.get_text()


def test_redact_is_case_insensitive_by_default():
    out, _, hits = svc.redact(_pdf(1, text="Secret Project Zeta"), ["secret"])
    assert hits == 1
    with _open_output(out) as doc:
        assert "Secret" not in doc[0].get_text()


def test_redact_reports_when_nothing_matched():
    with pytest.raises(svc.PdfEditError) as e:
        svc.redact(_pdf(1), ["nothing-here-at-all"])
    assert "OCR" in str(e.value)


def test_redact_requires_a_term():
    with pytest.raises(svc.PdfEditError):
        svc.redact(_pdf(1), ["", "   "])


# ----------------------------------- repair --------------------------------- #

def test_repair_round_trips_a_healthy_pdf():
    out, size, note = svc.repair(_pdf(2))
    assert size > 0
    assert "2 pages" in note
    with _open_output(out) as doc:
        assert doc.page_count == 2


def test_repair_recovers_a_damaged_xref():
    """Corrupt the trailer so the xref must be rebuilt."""
    data = bytearray(_pdf(2))
    idx = data.rfind(b"startxref")
    assert idx != -1
    data[idx : idx + 9] = b"startxrEF"  # break the keyword

    out, _, note = svc.repair(bytes(data))
    with _open_output(out) as doc:
        assert doc.page_count == 2
    assert note


def test_repair_rejects_something_that_is_not_a_pdf():
    with pytest.raises(svc.PdfEditError):
        svc.repair(b"this is definitely not a pdf" * 20)


# ---------------------------------- flatten --------------------------------- #

def test_flatten_keeps_pages_and_text():
    out, size = svc.flatten(_pdf(2))
    assert size > 0
    with _open_output(out) as doc:
        assert doc.page_count == 2
        assert "Page 1" in doc[0].get_text()


# --------------------------------- encryption ------------------------------- #

def test_edits_refuse_a_password_protected_pdf():
    doc = fitz.open()
    doc.new_page().insert_text((72, 72), "locked")
    protected = doc.tobytes(encryption=fitz.PDF_ENCRYPT_AES_256, owner_pw="o", user_pw="u")
    doc.close()

    with pytest.raises(svc.PdfEditError) as e:
        svc.watermark(protected, "X")
    assert "password" in str(e.value).lower()


# --------------------------------- extract ---------------------------------- #

def test_extract_text_reads_the_text_layer():
    text, pages, chars = svc.extract_text(_pdf(2, text="Quarterly revenue 4200"))
    assert pages == 2
    assert chars > 0
    assert "Quarterly revenue 4200" in text


def test_extract_text_returns_nothing_for_a_scan():
    """An image-only page has no text layer - the route turns this into advice."""
    doc = fitz.open()
    page = doc.new_page()
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 50, 50))
    pix.set_rect(pix.irect, (200, 30, 30))
    page.insert_image(fitz.Rect(0, 0, 200, 200), pixmap=pix)
    data = doc.tobytes()
    doc.close()

    text, pages, chars = svc.extract_text(data)
    assert pages == 1
    assert chars == 0
    assert text == ""


# --------------------------------- compare ---------------------------------- #

def test_compare_detects_no_change():
    a = _pdf(2)
    result = svc.compare(a, a)
    assert result["identical"] is True
    assert result["added"] == 0 and result["removed"] == 0


def test_compare_detects_an_edit():
    a = _pdf(1, text="Salary is 90000")
    b = _pdf(1, text="Salary is 95000")
    result = svc.compare(a, b)
    assert result["identical"] is False
    assert result["added"] >= 1
    assert result["removed"] >= 1
    assert any("95000" in r["text"] for r in result["rows"] if r["op"] == "add")


def test_compare_reports_page_counts():
    result = svc.compare(_pdf(2), _pdf(5))
    assert result["pages_a"] == 2
    assert result["pages_b"] == 5


def test_compare_rejects_two_scans():
    doc = fitz.open()
    doc.new_page()
    blank = doc.tobytes()
    doc.close()
    with pytest.raises(svc.PdfEditError) as e:
        svc.compare(blank, blank)
    assert "OCR" in str(e.value)
