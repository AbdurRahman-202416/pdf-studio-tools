from __future__ import annotations

import zipfile

import fitz
import pytest

from app.services import pdf_pages_service
from app.services.pdf_pages_service import PDFPagesError


@pytest.fixture()
def five_page_pdf(tmp_path):
    doc = fitz.open()
    for i in range(5):
        page = doc.new_page()
        page.insert_text((72, 72), f"Page {i + 1}")
    path = tmp_path / "five.pdf"
    doc.save(path)
    doc.close()
    return path


def test_split_extract_range(five_page_pdf):
    _, out, count = pdf_pages_service.split_pdf(five_page_pdf, "1-2,5", "extract")
    assert count == 3
    with fitz.open(out) as doc:
        assert doc.page_count == 3


def test_split_each_produces_zip(five_page_pdf):
    _, out, count = pdf_pages_service.split_pdf(five_page_pdf, "1,3", "each")
    assert count == 2
    assert out.suffix == ".zip"
    with zipfile.ZipFile(out) as zf:
        assert sorted(zf.namelist()) == ["page-001.pdf", "page-003.pdf"]


def test_split_invalid_mode(five_page_pdf):
    with pytest.raises(PDFPagesError):
        pdf_pages_service.split_pdf(five_page_pdf, "all", "banana")


def test_rotate_sets_rotation(five_page_pdf):
    _, out, rotated = pdf_pages_service.rotate_pdf(five_page_pdf, 90, "1-2")
    assert rotated == 2
    with fitz.open(out) as doc:
        assert doc.load_page(0).rotation == 90
        assert doc.load_page(2).rotation == 0


def test_rotate_invalid_angle(five_page_pdf):
    with pytest.raises(PDFPagesError):
        pdf_pages_service.rotate_pdf(five_page_pdf, 45, "all")


def test_delete_pages(five_page_pdf):
    _, out, removed, remaining = pdf_pages_service.delete_pages(five_page_pdf, "2,4")
    assert (removed, remaining) == (2, 3)
    with fitz.open(out) as doc:
        assert doc.page_count == 3
        # Pages 1, 3, 5 remain
        assert "Page 1" in doc.load_page(0).get_text()
        assert "Page 3" in doc.load_page(1).get_text()
        assert "Page 5" in doc.load_page(2).get_text()


def test_delete_all_pages_rejected(five_page_pdf):
    with pytest.raises(PDFPagesError):
        pdf_pages_service.delete_pages(five_page_pdf, "all")
    with pytest.raises(PDFPagesError):
        pdf_pages_service.delete_pages(five_page_pdf, "1-5")


def test_invalid_range_token(five_page_pdf):
    with pytest.raises(PDFPagesError):
        pdf_pages_service.split_pdf(five_page_pdf, "abc", "extract")
