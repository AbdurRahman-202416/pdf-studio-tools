from __future__ import annotations

import io
import zipfile

import pytest

from app.core.config import settings
from app.utils.guards import (
    GuardError,
    assert_page_count,
    assert_zip_safe,
    is_image,
    safe_zoom,
)


def test_safe_zoom_passes_normal_page_through():
    # A4 at 150 DPI is well under the pixel ceiling → unclamped.
    z = safe_zoom(595, 842, 150)
    assert z == pytest.approx(150 / 72, rel=1e-6)


def test_safe_zoom_clamps_giant_page():
    # A0-ish page at 300 DPI would blow past MAX_RENDER_PIXELS → clamped down.
    z = safe_zoom(2384, 3370, 300)
    px = (2384 * z) * (3370 * z)
    assert px <= settings.MAX_RENDER_PIXELS * 1.0001


def test_assert_page_count():
    assert_page_count(settings.MAX_PDF_PAGES)  # boundary ok
    with pytest.raises(GuardError):
        assert_page_count(settings.MAX_PDF_PAGES + 1)


def test_is_image_detects_common_formats():
    assert is_image(b"\xff\xd8\xff\xe0jfif")           # jpeg
    assert is_image(b"\x89PNG\r\n\x1a\n....")            # png
    assert is_image(b"RIFF\x00\x00\x00\x00WEBPVP8 ")    # webp
    assert not is_image(b"%PDF-1.7")
    assert not is_image(b"not an image at all")


def test_assert_zip_safe_accepts_normal_docx_like_zip():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("word/document.xml", "<xml>" + "a" * 1000 + "</xml>")
    assert_zip_safe(buf.getvalue())  # should not raise


def test_assert_zip_safe_rejects_zip_bomb():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # 50 MB of zeros compresses to a few KB → ratio far over the limit.
        zf.writestr("bomb.xml", b"\x00" * (50 * 1024 * 1024))
    with pytest.raises(GuardError):
        assert_zip_safe(buf.getvalue())


def test_assert_zip_safe_rejects_non_zip():
    with pytest.raises(GuardError):
        assert_zip_safe(b"definitely not a zip")
