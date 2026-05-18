from pathlib import Path


def test_dockerfile_has_global_language_packs():
    df = Path(__file__).resolve().parent.parent / "Dockerfile"
    contents = df.read_text()
    required = [
        "tesseract-ocr-eng", "tesseract-ocr-ben",
        "tesseract-ocr-spa", "tesseract-ocr-fra", "tesseract-ocr-deu",
        "tesseract-ocr-hin", "tesseract-ocr-ara",
        "tesseract-ocr-chi-sim", "tesseract-ocr-chi-tra",
        "tesseract-ocr-jpn", "tesseract-ocr-kor",
        "tesseract-ocr-por", "tesseract-ocr-rus",
        "tesseract-ocr-ita", "tesseract-ocr-nld", "tesseract-ocr-tur",
    ]
    for pkg in required:
        assert pkg in contents, f"missing language pack: {pkg}"
