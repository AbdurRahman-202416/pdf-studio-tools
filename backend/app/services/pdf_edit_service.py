from __future__ import annotations

import io
import math
import re

import fitz  # PyMuPDF

from app.core.config import settings
from app.utils.guards import GuardError, assert_page_count
from app.utils.storage import new_file_id, output_path


class PdfEditError(Exception):
    """Raised for watermark / page-number / crop / redact / repair failures."""


# Text drawn onto pages (watermarks, page numbers) stays within sane bounds.
# A font_size of 0 made the tile loop's step 0 - an infinite loop burning a
# worker thread until restart, remotely triggerable with one form field.
MIN_FONT_SIZE = 6
MAX_FONT_SIZE = 144


def _open(data: bytes) -> fitz.Document:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise PdfEditError(f"Could not open that PDF: {exc}") from exc
    if doc.is_encrypted and not doc.authenticate(""):
        doc.close()
        raise PdfEditError("That PDF is password protected. Unlock it first.")
    try:
        assert_page_count(doc.page_count)
    except GuardError:
        doc.close()
        raise
    return doc


def _save(doc: fitz.Document) -> tuple[str, int]:
    """Save with garbage collection so edits do not bloat the file."""
    output_id = new_file_id()
    dest = output_path(output_id)
    doc.save(str(dest), garbage=4, deflate=True, clean=True)
    doc.close()
    return output_id, dest.stat().st_size


def parse_pages(spec: str, total: int) -> list[int]:
    """Parse a 1-based selector ('all', '1,3-5') into 0-based page indexes."""
    if not spec or spec.strip().lower() == "all":
        return list(range(total))
    out: list[int] = []
    for raw in spec.split(","):
        part = raw.strip()
        if not part:
            continue
        m = re.fullmatch(r"(\d+)\s*-\s*(\d+)", part)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            if a < 1 or b < a:
                raise PdfEditError(f"Invalid page range: {part}")
            out.extend(i for i in range(a - 1, min(b, total)))
        elif part.isdigit():
            i = int(part) - 1
            if 0 <= i < total:
                out.append(i)
        else:
            raise PdfEditError(f"Could not read '{part}' as a page or range.")
    if not out:
        raise PdfEditError("That page selection matched no pages.")
    return sorted(set(out))


# --------------------------------- watermark -------------------------------- #

def _draw_rotated(
    page: fitz.Page,
    point: fitz.Point,
    text: str,
    font_size: int,
    rotation: int,
    colour: tuple[float, float, float],
    opacity: float,
) -> None:
    """Draw text at an arbitrary angle.

    `insert_text(rotate=...)` only accepts multiples of 90, so anything else -
    the classic 45-degree diagonal watermark - has to go through a morph
    matrix pivoted on the insertion point.
    """
    page.insert_text(
        point,
        text,
        fontsize=font_size,
        color=colour,
        fill_opacity=opacity,
        morph=(point, fitz.Matrix(rotation)),
        overlay=True,
    )



def watermark(
    data: bytes,
    text: str,
    *,
    opacity: float = 0.25,
    rotation: int = 45,
    font_size: int = 42,
    colour: tuple[float, float, float] = (0.5, 0.5, 0.5),
    tile: bool = True,
    pages: str = "all",
) -> tuple[str, int]:
    if not text.strip():
        raise PdfEditError("The watermark text is empty.")
    if len(text) > 200:
        raise PdfEditError("The watermark text is too long (max 200 characters).")
    opacity = max(0.05, min(1.0, opacity))
    font_size = max(MIN_FONT_SIZE, min(MAX_FONT_SIZE, font_size))

    doc = _open(data)
    targets = parse_pages(pages, doc.page_count)

    for i in targets:
        page = doc[i]
        rect = page.rect
        # Draw into an overlay so the watermark composites over existing content.
        if tile:
            step_x = font_size * len(text) * 0.62
            step_y = font_size * 3.2
            # Rotation moves the drawn area, so over-draw beyond the page bounds.
            reach = math.hypot(rect.width, rect.height)
            # Bound the work directly: a short text at a small (even legal)
            # font size yields tens of thousands of insert_text calls per
            # page, which is minutes of CPU. ~600 tiles is visually solid
            # coverage; widen the steps to stay under it.
            cols = (2 * reach) / step_x
            rows = (2 * reach) / step_y
            if cols * rows > 600:
                scale = math.sqrt(cols * rows / 600)
                step_x *= scale
                step_y *= scale
            y = -reach
            while y < reach:
                x = -reach
                while x < reach:
                    _draw_rotated(page, fitz.Point(x, y), text, font_size, rotation, colour, opacity)
                    x += step_x
                y += step_y
        else:
            _draw_rotated(
                page,
                fitz.Point(rect.width / 2 - (font_size * len(text) * 0.28), rect.height / 2),
                text, font_size, rotation, colour, opacity,
            )

    return _save(doc)


# ------------------------------- page numbers ------------------------------- #

_POSITIONS = {
    "bottom-center", "bottom-right", "bottom-left",
    "top-center", "top-right", "top-left",
}


def page_numbers(
    data: bytes,
    *,
    position: str = "bottom-center",
    start_at: int = 1,
    fmt: str = "{n}",
    font_size: int = 11,
    margin: float = 36.0,
    skip_first: bool = False,
) -> tuple[str, int]:
    if position not in _POSITIONS:
        raise PdfEditError(f"Unknown position '{position}'.")
    if "{n}" not in fmt:
        raise PdfEditError("The format needs to contain {n} for the page number.")
    if len(fmt) > 50:
        raise PdfEditError("The number format is too long (max 50 characters).")
    font_size = max(MIN_FONT_SIZE, min(MAX_FONT_SIZE, font_size))
    start_at = max(0, min(1_000_000, start_at))
    margin = max(0.0, min(200.0, margin))

    doc = _open(data)
    total = doc.page_count

    for i, page in enumerate(doc):
        if skip_first and i == 0:
            continue
        label = fmt.replace("{n}", str(i + start_at)).replace("{total}", str(total))
        rect = page.rect
        width = fitz.get_text_length(label, fontname="helv", fontsize=font_size)

        if position.endswith("left"):
            x = margin
        elif position.endswith("right"):
            x = rect.width - margin - width
        else:
            x = (rect.width - width) / 2

        y = margin if position.startswith("top") else rect.height - margin

        page.insert_text(
            fitz.Point(x, y), label, fontsize=font_size, fontname="helv", color=(0, 0, 0)
        )

    return _save(doc)


# ----------------------------------- crop ----------------------------------- #

def crop(
    data: bytes,
    *,
    top: float = 0,
    right: float = 0,
    bottom: float = 0,
    left: float = 0,
    pages: str = "all",
) -> tuple[str, int]:
    """Crop by trimming a percentage from each edge.

    Sets the CropBox rather than rewriting content: nothing is re-rendered, so
    text stays selectable and image quality is untouched.
    """
    for name, v in (("top", top), ("right", right), ("bottom", bottom), ("left", left)):
        if v < 0 or v >= 50:
            raise PdfEditError(f"The {name} trim must be between 0 and 50 percent.")

    doc = _open(data)
    for i in parse_pages(pages, doc.page_count):
        page = doc[i]
        r = page.rect
        box = fitz.Rect(
            r.x0 + r.width * (left / 100),
            r.y0 + r.height * (top / 100),
            r.x1 - r.width * (right / 100),
            r.y1 - r.height * (bottom / 100),
        )
        if box.is_empty or box.width < 1 or box.height < 1:
            raise PdfEditError("Those trim values would leave nothing on the page.")
        # page.rect is the ROTATED rect but set_cropbox expects unrotated
        # coordinates inside the mediabox - on any /Rotate 90 page (scans,
        # landscape) the un-derotated box fell outside it and raised.
        box = fitz.Rect(box) * page.derotation_matrix
        box.normalize()
        box = box & page.mediabox
        try:
            page.set_cropbox(box)
        except ValueError as exc:
            doc.close()
            raise PdfEditError(f"Could not crop page {i + 1}: {exc}") from exc

    return _save(doc)


# ---------------------------------- flatten --------------------------------- #

def flatten(data: bytes) -> tuple[str, int]:
    """Bake form fields and annotations into the page content.

    Makes a filled form non-editable and guarantees it looks the same in every
    reader - viewers render form widgets inconsistently.
    """
    doc = _open(data)
    try:
        # Converts widgets/annotations into ordinary page content.
        for page in doc:
            page.apply_redactions  # noqa: B018 - touch to fail fast on old bindings
        doc.bake()
    except AttributeError:
        doc.close()
        raise PdfEditError("This build of PyMuPDF is too old to flatten PDFs.")
    except Exception as exc:
        doc.close()
        raise PdfEditError(f"Could not flatten that PDF: {exc}") from exc
    return _save(doc)


# --------------------------------- organize --------------------------------- #

def organize(data: bytes, order: str) -> tuple[str, int]:
    """Reorder / subset pages using a 1-based order spec such as '3,1,2' or '5-1'."""
    doc = _open(data)
    total = doc.page_count

    sequence: list[int] = []
    for raw in order.split(","):
        part = raw.strip()
        if not part:
            continue
        m = re.fullmatch(r"(\d+)\s*-\s*(\d+)", part)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            # Bounds-check BEFORE materialising: '1-9999999999' on a one-page
            # file used to allocate the full range as a list and OOM the box
            # before the "page doesn't exist" error ever ran.
            for v in (a, b):
                if v < 1 or v > total:
                    doc.close()
                    raise PdfEditError(f"Page {v} doesn't exist - the file has {total}.")
            step = 1 if b >= a else -1
            # A descending range is how you reverse a section.
            sequence.extend(range(a - 1, b - 1 + step, step))
        elif part.isdigit():
            v = int(part)
            if v < 1 or v > total:
                doc.close()
                raise PdfEditError(f"Page {v} doesn't exist - the file has {total}.")
            sequence.append(v - 1)
        else:
            doc.close()
            raise PdfEditError(f"Could not read '{part}' as a page or range.")
        if len(sequence) > settings.MAX_PDF_PAGES:
            doc.close()
            raise PdfEditError(
                f"That order selects more than {settings.MAX_PDF_PAGES} pages."
            )

    if not sequence:
        doc.close()
        raise PdfEditError("No pages selected.")

    out = fitz.open()
    for i in sequence:
        out.insert_pdf(doc, from_page=i, to_page=i)
    doc.close()
    return _save(out)


# ---------------------------------- redact ---------------------------------- #

def redact(
    data: bytes,
    terms: list[str],
    *,
    case_sensitive: bool = False,
    fill: tuple[float, float, float] = (0, 0, 0),
) -> tuple[str, int, int]:
    """Permanently remove matching text, not just cover it.

    Uses PyMuPDF's redaction annotations, which delete the underlying glyphs -
    unlike drawing a black rectangle, which leaves the text selectable beneath.
    Returns (output_id, size, occurrences_removed).
    """
    terms = [t for t in (t.strip() for t in terms) if t]
    if not terms:
        raise PdfEditError("Give at least one word or phrase to redact.")
    if len(terms) > 50:
        raise PdfEditError("Too many terms - redact at most 50 at a time.")
    if any(len(t) > 500 for t in terms):
        raise PdfEditError("A search term is too long (max 500 characters).")

    doc = _open(data)
    hits = 0

    for page in doc:
        for term in terms:
            # PyMuPDF's search_for has no case-sensitive mode - it always
            # matches case-insensitively - so exact case is enforced here by
            # re-reading the matched rectangle.
            for rect in page.search_for(term):
                if case_sensitive and term not in (page.get_textbox(rect) or ""):
                    continue
                page.add_redact_annot(rect, fill=fill)
                hits += 1
        page.apply_redactions()

    if hits == 0:
        doc.close()
        raise PdfEditError(
            "None of those terms were found. Note that this searches real text - "
            "a scanned page has none until you run OCR."
        )

    output_id, size = _save(doc)
    return output_id, size, hits


# ---------------------------------- repair ---------------------------------- #

def repair(data: bytes) -> tuple[str, int, str]:
    """Rebuild a damaged PDF's structure.

    PyMuPDF reconstructs the cross-reference table when it is broken, which
    recovers the majority of 'file is damaged' cases. Returns a short note on
    what was found so the result isn't a silent no-op.
    """
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise PdfEditError(
            f"That file is too damaged to recover, or isn't a PDF at all: {exc}"
        ) from exc

    if doc.is_encrypted and not doc.authenticate(""):
        doc.close()
        raise PdfEditError("That PDF is password protected. Unlock it first.")

    note = "Rebuilt the cross-reference table" if doc.is_repaired else "Structure was already valid"
    pages = doc.page_count
    if pages == 0:
        doc.close()
        raise PdfEditError("No recoverable pages were found in that file.")

    output_id, size = _save(doc)
    return output_id, size, f"{note}; {pages} page{'s' if pages != 1 else ''} recovered."


# ---------------------------------- extract --------------------------------- #

def extract_text(data: bytes, layout: bool = False) -> tuple[str, int, int]:
    """Pull the text layer straight out of a PDF.

    Distinct from OCR: this reads text that is already in the file, so it is
    instant and exact. A scanned page has no text layer and returns nothing -
    that is when OCR is the right tool, and the route says so.

    Returns (text, page_count, character_count).
    """
    doc = _open(data)
    mode = "text" if not layout else "blocks"
    chunks: list[str] = []
    for page in doc:
        if mode == "text":
            chunks.append(page.get_text("text"))
        else:
            blocks = sorted(page.get_text("blocks"), key=lambda b: (round(b[1], 1), b[0]))
            chunks.append("\n".join(b[4] for b in blocks if isinstance(b[4], str)))
    pages = doc.page_count
    doc.close()
    text = "\n\n".join(chunks).strip()
    return text, pages, len(text)


# ---------------------------------- compare --------------------------------- #

def compare(a: bytes, b: bytes) -> dict:
    """Line-level text comparison of two PDFs.

    Text-level rather than visual: a pixel diff on a re-flowed document is
    mostly noise, whereas comparing the extracted text finds the edits people
    actually care about. Uses the same longest-common-subsequence approach git
    does.
    """
    text_a, pages_a, _ = extract_text(a)
    text_b, pages_b, _ = extract_text(b)

    left = [ln.strip() for ln in text_a.splitlines() if ln.strip()]
    right = [ln.strip() for ln in text_b.splitlines() if ln.strip()]

    if not left and not right:
        raise PdfEditError(
            "Neither PDF has a text layer. Both look like scans - run OCR first, "
            "then compare the results."
        )

    n, m = len(left), len(right)
    # Guard the O(n*m) table; very long documents would allocate enormous memory.
    if n * m > 4_000_000:
        raise PdfEditError(
            "Those documents are too long to compare line by line. "
            "Split them into sections first."
        )

    lcs = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            lcs[i][j] = lcs[i + 1][j + 1] + 1 if left[i] == right[j] else max(lcs[i + 1][j], lcs[i][j + 1])

    rows: list[dict] = []
    i = j = 0
    while i < n and j < m:
        if left[i] == right[j]:
            rows.append({"op": "same", "text": left[i]})
            i += 1
            j += 1
        elif lcs[i + 1][j] >= lcs[i][j + 1]:
            rows.append({"op": "remove", "text": left[i]})
            i += 1
        else:
            rows.append({"op": "add", "text": right[j]})
            j += 1
    while i < n:
        rows.append({"op": "remove", "text": left[i]})
        i += 1
    while j < m:
        rows.append({"op": "add", "text": right[j]})
        j += 1

    added = sum(1 for r in rows if r["op"] == "add")
    removed = sum(1 for r in rows if r["op"] == "remove")
    return {
        "pages_a": pages_a,
        "pages_b": pages_b,
        "added": added,
        "removed": removed,
        "identical": added == 0 and removed == 0,
        # Cap the payload; the counts above still describe the whole document.
        "rows": rows[:1500],
        "truncated": len(rows) > 1500,
    }


__all__ = [
    "PdfEditError",
    "compare",
    "crop",
    "extract_text",
    "flatten",
    "organize",
    "page_numbers",
    "parse_pages",
    "redact",
    "repair",
    "watermark",
]
