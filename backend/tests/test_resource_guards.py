"""Resource-exhaustion guards: page-count enforcement, image-dimension guard,
concurrency cap, and temp-input cleanup. These reproduce the audit's P1 findings
(600-page PDFs processed unguarded; 49 MP signature bypassing the Pillow guard;
no concurrency cap; inputs never deleted) and prove the fixes.
"""
from __future__ import annotations

import io

import fitz
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.core.config import settings
from app.main import create_app
from app.utils.guards import GuardError, assert_image_dimensions, assert_pdf_page_limit


def _pdf_bytes(pages: int) -> bytes:
    doc = fitz.open()
    for i in range(pages):
        p = doc.new_page(width=200, height=200)
        p.insert_text((20, 20), f"p{i}", fontsize=8)
    data = doc.tobytes()
    doc.close()
    return data


def _png_bytes(w: int, h: int) -> bytes:
    bio = io.BytesIO()
    Image.new("RGB", (w, h), (10, 20, 30)).save(bio, format="PNG")
    return bio.getvalue()


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


# --- unit: guards ---------------------------------------------------------

def test_assert_pdf_page_limit_accepts_normal(tmp_path):
    p = tmp_path / "ok.pdf"
    p.write_bytes(_pdf_bytes(3))
    assert assert_pdf_page_limit(p) == 3


def test_assert_pdf_page_limit_rejects_oversized(tmp_path):
    p = tmp_path / "big.pdf"
    p.write_bytes(_pdf_bytes(settings.MAX_PDF_PAGES + 1))
    with pytest.raises(GuardError):
        assert_pdf_page_limit(p)


def test_assert_pdf_page_limit_boundary_exactly_max(tmp_path):
    p = tmp_path / "max.pdf"
    p.write_bytes(_pdf_bytes(settings.MAX_PDF_PAGES))
    # Exactly at the limit is allowed; only strictly greater is rejected.
    assert assert_pdf_page_limit(p) == settings.MAX_PDF_PAGES


def test_assert_pdf_page_limit_rejects_corrupt(tmp_path):
    p = tmp_path / "bad.pdf"
    p.write_bytes(b"%PDF-1.7\ngarbage\n")
    with pytest.raises(GuardError):
        assert_pdf_page_limit(p)


def test_assert_image_dimensions_accepts_normal():
    w, h = assert_image_dimensions(_png_bytes(200, 100))
    assert (w, h) == (200, 100)


def test_assert_image_dimensions_rejects_oversized_pixels():
    # 8000x8000 = 64 MP > MAX_RENDER_PIXELS (40 MP). Solid color => tiny file,
    # so this exercises the header-only guard without allocating the bitmap.
    with pytest.raises(GuardError):
        assert_image_dimensions(_png_bytes(8000, 8000))


def test_assert_image_dimensions_rejects_excessive_side():
    with pytest.raises(GuardError):
        assert_image_dimensions(_png_bytes(settings.MAX_IMAGE_DIMENSION + 1, 10))


# --- route-level: page limit enforced consistently ------------------------

@pytest.mark.parametrize(
    "path,data",
    [
        ("/api/tools/pdf/split", {"pages": "1-600", "mode": "extract"}),
        ("/api/tools/pdf/delete-pages", {"pages": "1"}),
        ("/api/tools/pdf/rotate", {"angle": "90", "pages": "all"}),
        ("/api/tools/pdf-to-word", {}),
        ("/api/tools/pdf-table/to-excel", {}),
        ("/api/tools/compress/target-size", {"target": "500kb"}),
    ],
)
def test_oversized_pdf_rejected_413(client, path, data):
    files = {"file": ("big.pdf", _pdf_bytes(settings.MAX_PDF_PAGES + 100), "application/pdf")}
    r = client.post(path, files=files, data=data)
    assert r.status_code == 413, f"{path} should reject oversized PDF, got {r.status_code}"
    assert "pages" in r.json()["detail"].lower()


def test_normal_pdf_still_processed(client):
    files = {"file": ("ok.pdf", _pdf_bytes(2), "application/pdf")}
    r = client.post("/api/tools/pdf/split", files=files, data={"pages": "1", "mode": "extract"})
    assert r.status_code == 200
    assert r.json()["pages"] == 1


# --- route-level: sign-pdf image dimension guard --------------------------

def test_sign_pdf_rejects_oversized_signature(client):
    files = {
        "file": ("one.pdf", _pdf_bytes(1), "application/pdf"),
        "signature": ("sig.png", _png_bytes(9000, 9000), "image/png"),  # 81 MP
    }
    data = {"page_index": "0", "x_pt": "100", "y_pt": "100", "width_pt": "200", "height_pt": "200"}
    r = client.post("/api/tools/sign-pdf", files=files, data=data)
    assert r.status_code == 400
    assert "pixels" in r.json()["detail"].lower() or "px" in r.json()["detail"].lower()


def test_sign_pdf_accepts_normal_signature(client):
    files = {
        "file": ("one.pdf", _pdf_bytes(1), "application/pdf"),
        "signature": ("sig.png", _png_bytes(300, 120), "image/png"),
    }
    data = {"page_index": "0", "x_pt": "100", "y_pt": "100", "width_pt": "200", "height_pt": "80"}
    r = client.post("/api/tools/sign-pdf", files=files, data=data)
    assert r.status_code == 200


# --- integration: temp input cleanup --------------------------------------

def test_tool_input_deleted_after_processing(client):
    before = len(list(settings.UPLOAD_DIR.glob("*")))
    files = {"file": ("one.pdf", _pdf_bytes(1), "application/pdf")}
    r = client.post("/api/tools/pdf/lock", files=files, data={"password": "Secret123!"})
    assert r.status_code == 200
    after = len(list(settings.UPLOAD_DIR.glob("*")))
    # The saved input must be gone once the request finished (output survives
    # in OUTPUT_DIR, not UPLOAD_DIR).
    assert after == before, "tool input should be cleaned up after processing"


def test_tool_input_deleted_even_on_failure(client):
    before = len(list(settings.UPLOAD_DIR.glob("*")))
    # Wrong password path still saves an input; oversized triggers a guard 413.
    files = {"file": ("big.pdf", _pdf_bytes(settings.MAX_PDF_PAGES + 50), "application/pdf")}
    r = client.post("/api/tools/pdf-to-word", files=files)
    assert r.status_code == 413
    after = len(list(settings.UPLOAD_DIR.glob("*")))
    assert after == before, "input should be cleaned up even when processing fails"


# --- concurrency middleware -----------------------------------------------

import asyncio  # noqa: E402

from starlette.requests import Request  # noqa: E402
from starlette.responses import PlainTextResponse  # noqa: E402

from app.middleware.security import ConcurrencyLimitMiddleware  # noqa: E402


def _req(method: str = "POST", path: str = "/api/tools/pdf/split") -> Request:
    return Request({"type": "http", "method": method, "path": path, "headers": [], "query_string": b""})


def test_concurrency_classifies_only_heavy_posts():
    mw = ConcurrencyLimitMiddleware(app=None, max_inflight=2)
    assert mw._is_heavy(_req("POST", "/api/tools/pdf/split"))
    assert mw._is_heavy(_req("POST", "/api/tools/compress/target-size"))
    assert not mw._is_heavy(_req("GET", "/api/tools/pdf/split"))
    assert not mw._is_heavy(_req("POST", "/api/tools/download/abc"))
    assert not mw._is_heavy(_req("POST", "/api/tools/preview/abc"))
    assert not mw._is_heavy(_req("POST", "/api/health"))
    assert not mw._is_heavy(_req("POST", "/static/x"))


def test_concurrency_returns_503_when_full_then_recovers():
    mw = ConcurrencyLimitMiddleware(app=None, max_inflight=1)

    async def run():
        started = asyncio.Event()
        release = asyncio.Event()

        async def slow_next(_request):
            started.set()
            await release.wait()
            return PlainTextResponse("ok")

        async def fast_next(_request):
            return PlainTextResponse("ok")

        # First heavy request occupies the only slot.
        t1 = asyncio.create_task(mw.dispatch(_req(), slow_next))
        await started.wait()
        # Second heavy request is rejected immediately with 503 + Retry-After.
        r2 = await mw.dispatch(_req(), fast_next)
        assert r2.status_code == 503
        assert r2.headers.get("Retry-After") == "5"
        # A light request is never gated even while heavy work is saturated.
        r_light = await mw.dispatch(_req("GET", "/api/tools/preview/x"), fast_next)
        assert r_light.status_code == 200
        # Release the slot; capacity is restored.
        release.set()
        assert (await t1).status_code == 200
        r3 = await mw.dispatch(_req(), fast_next)
        assert r3.status_code == 200

    asyncio.run(run())
