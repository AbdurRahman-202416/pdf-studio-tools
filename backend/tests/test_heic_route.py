from __future__ import annotations

import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import create_app


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(create_app())


def _heic_bytes(width: int = 80, height: int = 60) -> bytes:
    import pillow_heif

    pillow_heif.register_heif_opener()
    img = Image.new("RGB", (width, height), (200, 40, 30))
    buf = io.BytesIO()
    img.save(buf, format="HEIF")
    return buf.getvalue()


def test_converts_a_real_heic(client: TestClient):
    """Exercises the route, not just the service.

    The service tests passed while the route raised NameError on `settings`,
    which is exactly the gap a route-level test closes.
    """
    resp = client.post(
        "/api/tools/heic-to-jpg",
        files={"file": ("photo.heic", _heic_bytes(), "image/heic")},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["filename"].endswith(".jpg")
    assert body["size_bytes"] > 0
    assert body["output_id"]


def test_converted_output_is_downloadable(client: TestClient):
    created = client.post(
        "/api/tools/heic-to-jpg",
        files={"file": ("photo.heic", _heic_bytes(), "image/heic")},
    ).json()

    got = client.get(f"/api/tools/download/{created['output_id']}?name=photo.jpg")
    assert got.status_code == 200
    assert got.headers["content-type"].startswith("image/jpeg")
    with Image.open(io.BytesIO(got.content)) as im:
        assert im.format == "JPEG"


def test_rejects_a_non_heic_upload(client: TestClient):
    resp = client.post(
        "/api/tools/heic-to-jpg",
        files={"file": ("fake.heic", b"\x89PNG\r\n\x1a\n" + b"\x00" * 40, "image/heic")},
    )
    assert resp.status_code == 400
    assert "HEIC" in resp.json()["detail"]


def test_rejects_an_empty_upload(client: TestClient):
    resp = client.post(
        "/api/tools/heic-to-jpg",
        files={"file": ("empty.heic", b"", "image/heic")},
    )
    assert resp.status_code == 400


def test_quality_is_clamped_not_rejected(client: TestClient):
    """Out-of-range quality should be clamped so a stray value never 500s."""
    resp = client.post(
        "/api/tools/heic-to-jpg",
        files={"file": ("photo.heic", _heic_bytes(), "image/heic")},
        data={"quality": "10000"},
    )
    assert resp.status_code == 200
