import pytest


def test_module_importable_under_new_name():
    from app.services import pdf_table_service
    assert hasattr(pdf_table_service, "convert_pdf_table")
    assert hasattr(pdf_table_service, "PDFTableError")


def test_old_module_name_gone():
    import importlib
    with pytest.raises(ModuleNotFoundError):
        importlib.import_module("app.services.bank_service")


def test_no_bd_bank_patterns_remaining():
    """The new generic table extractor must not contain BD-bank-specific heuristics."""
    from pathlib import Path
    src = (Path(__file__).resolve().parent.parent / "app/services/pdf_table_service.py").read_text().lower()
    for term in ["dbbl", "brac", "ebl", "city bank", "sonali", "rupali", "bdt", "টাকা"]:
        assert term not in src, f"residual BD-bank reference: {term}"
