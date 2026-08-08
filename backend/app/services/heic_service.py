from __future__ import annotations

import io

from PIL import Image

from app.core.config import settings
from app.utils.storage import new_file_id

# Registering the HEIF opener teaches Pillow to read HEIC/HEIF. This is the one
# image tool that cannot run in the browser: no engine outside Safari decodes
# HEIC, and the JavaScript decoder is roughly a megabyte.
import pillow_heif  # noqa: E402

pillow_heif.register_heif_opener()


class HeicError(Exception):
    """Raised when a HEIC/HEIF file cannot be decoded or converted."""


# HEIC files are ISO-BMFF: bytes 4..8 are 'ftyp', followed by a brand code.
_HEIF_BRANDS = {
    b"heic", b"heix", b"hevc", b"hevx", b"heim", b"heis", b"hevm", b"hevs",
    b"mif1", b"msf1", b"avif", b"avis",
}


def looks_like_heif(data: bytes) -> bool:
    """Magic-byte check, mirroring the %PDF check the PDF endpoints do."""
    if len(data) < 12 or data[4:8] != b"ftyp":
        return False
    return data[8:12].lower() in _HEIF_BRANDS


def convert_to_jpeg(data: bytes, quality: int = 92) -> tuple[str, str, int]:
    """Decode HEIC/HEIF bytes and write a JPEG. Returns (output_id, filename, size)."""
    if not looks_like_heif(data):
        raise HeicError("That file is not a HEIC or HEIF image.")

    try:
        with Image.open(io.BytesIO(data)) as im:
            # Guard against decompression-bomb style dimensions before allocating.
            pixels = (im.width or 0) * (im.height or 0)
            if pixels > settings.MAX_RENDER_PIXELS:
                raise HeicError(
                    "That image is too large to convert safely. "
                    f"Maximum is {settings.MAX_RENDER_PIXELS // 1_000_000} megapixels."
                )

            # JPEG has no alpha channel, so flatten onto white rather than
            # letting Pillow fail or produce a black background.
            if im.mode in ("RGBA", "LA", "P"):
                rgba = im.convert("RGBA")
                flat = Image.new("RGB", rgba.size, (255, 255, 255))
                flat.paste(rgba, mask=rgba.split()[-1])
                out_img = flat
            else:
                out_img = im.convert("RGB")

            output_id = new_file_id()
            # storage.output_path() hardcodes a .pdf suffix; the download route
            # picks the content type from the extension, so a JPEG written there
            # would be served as application/pdf.
            dest = settings.OUTPUT_DIR / f"{output_id}.jpg"

            # Carry EXIF through so orientation and capture data survive - but
            # only when there is some. Pillow's JPEG encoder raises on a None or
            # empty exif value rather than ignoring it.
            save_kwargs: dict[str, object] = {
                "format": "JPEG",
                "quality": quality,
                "optimize": True,
            }
            exif = im.info.get("exif")
            if exif:
                save_kwargs["exif"] = exif

            out_img.save(dest, **save_kwargs)  # type: ignore[arg-type]
    except HeicError:
        raise
    except Exception as exc:  # Pillow raises a wide variety here
        raise HeicError(f"Could not decode that HEIC image: {exc}") from exc

    return output_id, "converted.jpg", dest.stat().st_size
