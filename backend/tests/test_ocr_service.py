from __future__ import annotations

import pytest

from app.services import ocr_service


def test_accepts_arbitrary_language_code():
    """Should not reject codes outside the old Literal whitelist."""
    import typing
    hints = typing.get_type_hints(ocr_service._ocr_image)
    assert hints["lang"] is str


def test_default_language_is_eng_not_ben_eng():
    """Default language should be English-only, not Bengali-prioritized."""
    import inspect
    sig = inspect.signature(ocr_service.extract_text)
    assert sig.parameters["lang"].default == "eng"


def test_ocr_code_regex_accepts_real_tesseract_codes():
    """The route regex must accept every shape Tesseract actually uses."""
    from app.api.tools_routes import _OCR_CODE_RE
    for code in [
        "eng", "ben", "spa", "fra", "deu", "hin", "ara", "jpn", "kor",
        "chi_sim", "chi_tra", "chi_sim_vert", "chi_tra_vert",
        "eng+ben", "fra+deu", "eng+chi_sim", "eng+ben+hin",
    ]:
        assert _OCR_CODE_RE.match(code), f"regex rejected real code: {code}"


def test_ocr_code_regex_rejects_invalid_input():
    """The route regex should reject malformed input."""
    from app.api.tools_routes import _OCR_CODE_RE
    for bad in ["", "a", "ENG", "eng;", "eng spa", "eng-spa", "../etc/passwd", "1234"]:
        assert not _OCR_CODE_RE.match(bad), f"regex accepted invalid input: {bad}"
