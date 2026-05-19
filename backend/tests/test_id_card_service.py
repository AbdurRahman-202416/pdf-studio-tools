import pytest


def test_module_importable_under_new_name():
    from app.services import id_card_service
    assert hasattr(id_card_service, "combine_id_card")
    assert hasattr(id_card_service, "IDCardError")


def test_layout_enum_includes_global_templates():
    from app.services import id_card_service
    valid = id_card_service.VALID_LAYOUTS
    assert "a4_portrait" in valid
    assert "a4_horizontal" in valid
    assert "compact" in valid


def test_old_module_name_gone():
    import importlib
    with pytest.raises(ModuleNotFoundError):
        importlib.import_module("app.services.nid_service")
