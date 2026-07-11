"""Resource-exhaustion guards shared across tool services.

A free, anonymous-upload service is an easy DoS target: a small crafted PDF
can declare A0-sized pages that rasterize to multi-GB pixmaps, and a few-KB
"PK" file can expand to gigabytes of office-XML. These helpers cap the blast
radius before any heavy allocation happens.
"""
from __future__ import annotations

import io
import zipfile

from PIL import Image

from app.core.config import settings

# Hard-cap Pillow's decompression-bomb ceiling for the whole process. A small
# crafted image can otherwise declare enormous dimensions and OOM us on decode.
Image.MAX_IMAGE_PIXELS = settings.MAX_RENDER_PIXELS


class GuardError(Exception):
    """Raised when an upload exceeds a safety limit. Callers map this to HTTP 400/413."""


def assert_page_count(page_count: int) -> None:
    """Reject documents with an abusive number of pages."""
    if page_count > settings.MAX_PDF_PAGES:
        raise GuardError(
            f"Document has {page_count} pages; the limit is {settings.MAX_PDF_PAGES}."
        )


def safe_zoom(width_pt: float, height_pt: float, dpi: int) -> float:
    """Return a zoom factor for `dpi` clamped so the rasterized page stays
    under MAX_RENDER_PIXELS. Prevents PDF-bomb pixmap allocation."""
    zoom = dpi / 72.0
    px = max(1.0, (width_pt * zoom) * (height_pt * zoom))
    if px > settings.MAX_RENDER_PIXELS:
        zoom *= (settings.MAX_RENDER_PIXELS / px) ** 0.5
    return zoom


def assert_zip_safe(data: bytes) -> None:
    """Guard against zip bombs in docx/xlsx uploads before python-docx/openpyxl
    decompress arbitrary inner XML. Checks entry count, total uncompressed size,
    and per-entry compression ratio."""
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            infos = zf.infolist()
            if len(infos) > 5000:
                raise GuardError("Archive has too many entries.")
            total = 0
            comp = 0
            for info in infos:
                total += info.file_size
                comp += info.compress_size
            if total > settings.max_zip_uncompressed_bytes:
                raise GuardError("Archive decompresses to an unsafe size.")
            # Overall ratio guard (avoids one tiny entry masking a bomb).
            if comp > 0 and (total / comp) > settings.MAX_ZIP_RATIO:
                raise GuardError("Archive compression ratio looks like a zip bomb.")
    except zipfile.BadZipFile as exc:
        raise GuardError("File is not a valid Office document.") from exc


# Magic-byte prefixes for the image formats the image tools accept.
_IMAGE_MAGIC: tuple[bytes, ...] = (
    b"\xff\xd8\xff",           # JPEG
    b"\x89PNG\r\n\x1a\n",      # PNG
    b"GIF87a",
    b"GIF89a",
    b"BM",                     # BMP
    b"II*\x00",                # TIFF (LE)
    b"MM\x00*",                # TIFF (BE)
)


def is_image(data: bytes) -> bool:
    """True if the bytes start with a known image magic number (incl. WEBP/RIFF)."""
    if any(data.startswith(sig) for sig in _IMAGE_MAGIC):
        return True
    # WEBP: "RIFF"<size>"WEBP"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False
