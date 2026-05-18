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
