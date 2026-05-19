import pytest
from pathlib import Path


def test_forms_service_module_deleted():
    target = Path(__file__).resolve().parent.parent / "app/services/forms_service.py"
    assert not target.exists(), "forms_service.py must be deleted"


def test_forms_service_not_importable():
    import importlib
    with pytest.raises(ModuleNotFoundError):
        importlib.import_module("app.services.forms_service")


def test_forms_routes_removed_from_router():
    from app.api.tools_routes import router
    paths = [r.path for r in router.routes]
    forbidden = ["/tools/forms", "/tools/forms/{form_id}", "/tools/forms/render"]
    for p in forbidden:
        assert p not in paths, f"residual forms route: {p}"
