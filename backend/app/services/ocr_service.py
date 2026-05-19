from __future__ import annotations

import io
import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageFilter, ImageOps

# Any Tesseract language code accepted (e.g. "eng", "spa", "ben+eng", "hin+eng").
# Validation happens against the actually-installed packs in list_languages().


class OCRError(Exception):
    pass


def is_available() -> bool:
    return shutil.which("tesseract") is not None


def list_languages() -> list[str]:
    try:
        import pytesseract  # type: ignore

        return list(pytesseract.get_languages(config=""))
    except Exception:
        return []


def _has_meaningful_text(text: str) -> bool:
    """Heuristic: PDF page is text-based if it has real words, not just stray symbols."""
    if not text:
        return False
    stripped = text.strip()
    if len(stripped) < 20:
        return False
    # count letter-like characters (latin + bangla unicode range)
    letters = sum(
        1
        for ch in stripped
        if ch.isalpha() or "ঀ" <= ch <= "৿"  # Bangla block
    )
    return letters >= 15


def _preprocess_for_ocr(img: Image.Image) -> Image.Image:
    """Improve OCR accuracy: grayscale, contrast boost, mild denoise."""
    img = ImageOps.exif_transpose(img)
    if img.mode != "L":
        img = img.convert("L")
    img = ImageOps.autocontrast(img, cutoff=2)
    # Mild sharpening helps with low-DPI scans
    img = img.filter(ImageFilter.SHARPEN)
    return img


def _ocr_image(img: Image.Image, lang: str) -> str:
    import pytesseract  # type: ignore

    # PSM 3 = automatic page segmentation (best general-purpose); OEM 3 = default LSTM
    config = "--psm 3 --oem 3"
    try:
        return pytesseract.image_to_string(img, lang=lang, config=config)
    except pytesseract.TesseractError as exc:  # type: ignore
        msg = str(exc).lower()
        if "not loaded" in msg or "failed loading" in msg:
            raise OCRError(
                f"Tesseract language pack missing for '{lang}'. "
                "Install with: brew install tesseract-lang"
            ) from exc
        raise OCRError(str(exc)) from exc


def extract_text(
    file_path: Path,
    lang: str = "eng",
    dpi: int = 320,
    max_pages: int = 30,
    force_ocr: bool = False,
) -> dict:
    """
    Smart extraction:
      1. Try PyMuPDF text layer first (instant, lossless).
      2. For pages without meaningful text, fall back to Tesseract OCR with
         grayscale preprocessing at higher DPI.
    """
    if not is_available():
        raise OCRError(
            "Tesseract not installed on the server. Install with: brew install tesseract tesseract-lang"
        )
    import pytesseract  # type: ignore

    pages_out: list[dict] = []
    full_text_parts: list[str] = []
    methods: dict[str, int] = {"text": 0, "ocr": 0}

    try:
        with fitz.open(file_path) as doc:
            total = min(doc.page_count, max_pages)
            for i in range(total):
                page = doc.load_page(i)

                page_text = ""
                method = "ocr"

                if not force_ocr:
                    try:
                        page_text = page.get_text("text") or ""
                    except Exception:
                        page_text = ""
                    if _has_meaningful_text(page_text):
                        method = "text"

                if method != "text":
                    zoom = dpi / 72
                    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
                    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                    img = _preprocess_for_ocr(img)
                    page_text = _ocr_image(img, lang)

                methods[method] = methods.get(method, 0) + 1
                pages_out.append({"index": i, "text": page_text, "method": method})
                full_text_parts.append(page_text)
    except OCRError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise OCRError(f"Extraction failed: {exc}") from exc

    return {
        "pages": pages_out,
        "text": "\n\n".join(p.strip() for p in full_text_parts if p.strip()),
        "language": lang,
        "page_count": len(pages_out),
        "method_summary": methods,
    }


def extract_text_from_image(img_bytes: bytes, lang: str = "eng") -> str:
    if not is_available():
        raise OCRError("Tesseract not installed on the server")
    try:
        img = Image.open(io.BytesIO(img_bytes))
        img = _preprocess_for_ocr(img)
        return _ocr_image(img, lang)
    except OCRError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise OCRError(f"OCR failed: {exc}") from exc
