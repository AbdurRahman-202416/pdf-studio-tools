from __future__ import annotations

import io

import pytest
from PIL import Image

from app.services import heic_service


def _make_heic(width: int = 120, height: int = 90, mode: str = "RGB") -> bytes:
    """Encode a real HEIC in memory - pillow_heif can write as well as read."""
    img = Image.new(mode, (width, height))
    for x in range(width):
        for y in range(height):
            px = (x * 2 % 256, y * 2 % 256, (x + y) % 256)
            img.putpixel((x, y), px + (255,) if mode == "RGBA" else px)
    buf = io.BytesIO()
    img.save(buf, format="HEIF")
    return buf.getvalue()


def test_looks_like_heif_accepts_real_heic():
    assert heic_service.looks_like_heif(_make_heic()) is True


@pytest.mark.parametrize(
    "data",
    [
        b"",
        b"not an image at all",
        b"%PDF-1.7\n%\xe2\xe3\xcf\xd3",
        b"\x89PNG\r\n\x1a\n" + b"\x00" * 32,
        b"\xff\xd8\xff\xe0" + b"\x00" * 32,
    ],
)
def test_looks_like_heif_rejects_other_formats(data: bytes):
    """Magic-byte gate, mirroring the %PDF check the PDF endpoints perform."""
    assert heic_service.looks_like_heif(data) is False


def test_convert_produces_a_readable_jpeg():
    output_id, filename, size = heic_service.convert_to_jpeg(_make_heic())

    assert filename.endswith(".jpg")
    assert size > 0

    from app.core.config import settings

    with Image.open(settings.OUTPUT_DIR / f"{output_id}.jpg") as im:
        assert im.format == "JPEG"
        assert im.size == (120, 90)


def test_convert_preserves_resolution():
    output_id, _, _ = heic_service.convert_to_jpeg(_make_heic(320, 200))

    from app.core.config import settings

    with Image.open(settings.OUTPUT_DIR / f"{output_id}.jpg") as im:
        assert im.size == (320, 200)


def test_convert_flattens_alpha_onto_white_not_black():
    """JPEG has no alpha; a naive convert leaves transparent areas black."""
    img = Image.new("RGBA", (40, 40), (0, 0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="HEIF")

    output_id, _, _ = heic_service.convert_to_jpeg(buf.getvalue())

    from app.core.config import settings

    with Image.open(settings.OUTPUT_DIR / f"{output_id}.jpg") as im:
        r, g, b = im.convert("RGB").getpixel((20, 20))
        assert (r, g, b) == (255, 255, 255)


def test_convert_rejects_non_heic():
    with pytest.raises(heic_service.HeicError):
        heic_service.convert_to_jpeg(b"\x89PNG\r\n\x1a\n" + b"\x00" * 64)


def test_quality_affects_output_size():
    data = _make_heic(240, 180)
    _, _, small = heic_service.convert_to_jpeg(data, quality=45)
    _, _, large = heic_service.convert_to_jpeg(data, quality=95)
    assert small < large
