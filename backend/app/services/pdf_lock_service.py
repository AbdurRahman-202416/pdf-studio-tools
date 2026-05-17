from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.errors import FileNotDecryptedError, PdfReadError

from app.utils.storage import new_file_id, output_path


class PDFLockError(Exception):
    """Raised for password-protection failures (lock/unlock)."""


def lock_pdf(src: Path, password: str) -> tuple[str, Path]:
    if not password:
        raise PDFLockError("Password is required")
    try:
        reader = PdfReader(str(src))
        if reader.is_encrypted:
            raise PDFLockError("PDF is already encrypted, unlock it first.")
        writer = PdfWriter(clone_from=reader)
        writer.encrypt(
            user_password=password,
            owner_password=password,
            algorithm="AES-256",
        )
        output_id = new_file_id()
        out = output_path(output_id)
        with open(out, "wb") as f:
            writer.write(f)
        return output_id, out
    except PDFLockError:
        raise
    except (PdfReadError, FileNotDecryptedError) as exc:
        raise PDFLockError(f"Could not read PDF: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        raise PDFLockError(f"Lock failed: {exc}") from exc


def unlock_pdf(src: Path, password: str) -> tuple[str, Path]:
    if not password:
        raise PDFLockError("Password is required")
    try:
        reader = PdfReader(str(src))
        if not reader.is_encrypted:
            raise PDFLockError("PDF is not password-protected.")
        if reader.decrypt(password) == 0:
            raise PDFLockError("Incorrect password.")
        writer = PdfWriter(clone_from=reader)
        output_id = new_file_id()
        out = output_path(output_id)
        with open(out, "wb") as f:
            writer.write(f)
        return output_id, out
    except PDFLockError:
        raise
    except (PdfReadError, FileNotDecryptedError) as exc:
        raise PDFLockError(f"Could not read PDF: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        raise PDFLockError(f"Unlock failed: {exc}") from exc
