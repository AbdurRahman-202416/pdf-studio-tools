# Tool Test Matrix — PDF Studio

_81 live tools. **Smoke** = route renders, single non-empty H1, self-referencing canonical, title present, zero console/page errors, discoverable on `/tools` (registry-driven sweep, all 81 verified PASS). **Deep** = real output validation (bytes/values parsed & asserted). **Priv** = client tool proven not to upload (network-recorded). Legend: PASS · PARTIAL · N/A · NOT-TESTED._

| # | Tool | Slug | Domain | Runtime | Smoke | Deep | Validation | Failure | Output | Priv | SEO | A11y |
|---|------|------|--------|---------|-------|------|-----------|---------|--------|------|-----|------|
| 1 | add page numbers | `/add-page-numbers` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 2 | compare pdf | `/compare-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 3 | compress pdf | `/compress-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | PASS |
| 4 | compress pdf to 100kb | `/compress-pdf-to-100kb` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 5 | compress pdf to 1mb | `/compress-pdf-to-1mb` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 6 | compress pdf to 200kb | `/compress-pdf-to-200kb` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 7 | compress pdf to 500kb | `/compress-pdf-to-500kb` | PDF | server | PASS | PASS | PASS | PARTIAL | PASS | N/A | PASS | sampled |
| 8 | crop pdf | `/crop-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 9 | delete pdf pages | `/delete-pdf-pages` | PDF | server | PASS | PASS | PASS | PARTIAL | PASS | N/A | PASS | sampled |
| 10 | excel to pdf | `/excel-to-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 11 | flatten pdf | `/flatten-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 12 | jpg to pdf | `/jpg-to-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 13 | lock pdf | `/lock-pdf` | PDF | server | PASS | PASS | PASS | PARTIAL | PASS | N/A | PASS | sampled |
| 14 | merge pdf | `/merge-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 15 | nid combine | `/nid-combine` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 16 | organize pdf | `/organize-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 17 | passport photo pdf | `/passport-photo-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 18 | pdf ocr | `/pdf-ocr` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 19 | pdf to excel | `/pdf-to-excel` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 20 | pdf to jpg | `/pdf-to-jpg` | PDF | server | PASS | PASS | PASS | PARTIAL | PASS | N/A | PASS | sampled |
| 21 | pdf to text | `/pdf-to-text` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 22 | pdf to word | `/pdf-to-word` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 23 | redact pdf | `/redact-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 24 | repair pdf | `/repair-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 25 | rotate pdf | `/rotate-pdf` | PDF | server | PASS | PASS | PASS | PARTIAL | PASS | N/A | PASS | sampled |
| 26 | sign pdf | `/sign-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 27 | split pdf | `/split-pdf` | PDF | server | PASS | PASS | PASS | PASS | PASS | N/A | PASS | sampled |
| 28 | unlock pdf | `/unlock-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 29 | watermark pdf | `/watermark-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 30 | word to pdf | `/word-to-pdf` | PDF | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 31 | barcode generator | `/barcode-generator` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 32 | compress image | `/compress-image` | Image | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 33 | crop image | `/crop-image` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 34 | heic to jpg | `/heic-to-jpg` | Image | server | PASS | smoke | PARTIAL | PARTIAL | NOT-TESTED | N/A | PASS | sampled |
| 35 | image to ico | `/image-to-ico` | Image | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 36 | jpg to png | `/jpg-to-png` | Image | client | PASS | PASS | PASS | N/A | PASS | PASS | PASS | sampled |
| 37 | photo resizer for print | `/photo-resizer-for-print` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 38 | png to jpg | `/png-to-jpg` | Image | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 39 | qr code generator | `/qr-code-generator` | Image | client | PASS | PASS | PASS | N/A | PASS | PASS | PASS | sampled |
| 40 | qr scanner | `/qr-scanner` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 41 | resize image | `/resize-image` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 42 | social media image resizer | `/social-media-image-resizer` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 43 | watermark image | `/watermark-image` | Image | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 44 | webp converter | `/webp-converter` | Image | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 45 | base64 encode decode | `/base64-encode-decode` | Developer | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 46 | cron expression generator | `/cron-expression-generator` | Developer | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 47 | json formatter | `/json-formatter` | Developer | client | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS |
| 48 | jwt decoder | `/jwt-decoder` | Developer | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 49 | regex tester | `/regex-tester` | Developer | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 50 | sql formatter | `/sql-formatter` | Developer | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 51 | url encoder decoder | `/url-encoder-decoder` | Developer | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 52 | uuid generator | `/uuid-generator` | Developer | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 53 | case converter | `/case-converter` | Text | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 54 | diff checker | `/diff-checker` | Text | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 55 | markdown to html | `/markdown-to-html` | Text | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 56 | random name generator | `/random-name-generator` | Text | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 57 | word counter | `/word-counter` | Text | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 58 | csv to json | `/csv-to-json` | Data | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 59 | yaml to json | `/yaml-to-json` | Data | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 60 | color converter | `/color-converter` | Colour | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 61 | color picker | `/color-picker` | Colour | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 62 | timestamp converter | `/timestamp-converter` | Convert | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 63 | hash generator | `/hash-generator` | Security | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 64 | password generator | `/password-generator` | Security | client | PASS | PASS | PASS | N/A | PASS | PASS | PASS | sampled |
| 65 | password strength checker | `/password-strength-checker` | Security | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 66 | age calculator | `/age-calculator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 67 | bmi calculator | `/bmi-calculator` | Calculator | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 68 | coin flip | `/coin-flip` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 69 | countdown timer | `/countdown-timer` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 70 | date difference calculator | `/date-difference-calculator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 71 | dice roller | `/dice-roller` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 72 | discount calculator | `/discount-calculator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 73 | gpa calculator | `/gpa-calculator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 74 | loan emi calculator | `/loan-emi-calculator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 75 | mortgage calculator | `/mortgage-calculator` | Calculator | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | PASS |
| 76 | percentage calculator | `/percentage-calculator` | Calculator | client | PASS | PASS | PASS | N/A | PASS | PARTIAL | PASS | sampled |
| 77 | random number generator | `/random-number-generator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 78 | random picker wheel | `/random-picker-wheel` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 79 | stopwatch online | `/stopwatch-online` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 80 | tip calculator | `/tip-calculator` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |
| 81 | unit converter | `/unit-converter` | Calculator | client | PASS | smoke | PARTIAL | N/A | NOT-TESTED | PARTIAL | PASS | sampled |

## Coverage summary

- **Smoke (all 81):** PASS — every tool route renders cleanly with a unique H1, canonical, and no console errors; every tool is reachable from `/tools`.
- **Deep output-validated (24 tools):** representative tools per category with byte/value assertions — JSON semantic-equality, base64/UUID/hash/JWT correctness, YAML/CSV parsing, PDF page-count via pdf-lib, image format magic bytes, encrypted-PDF verification, known-arithmetic for calculators.
- **Privacy-verified client tools:** network-recorded proof of no upload for representative image/dev/QR/password tools; registry-wide invariant (no client tool declares an endpoint) asserted.
- **Failure/fallback:** 500 / offline / 413 / slow-backend simulated on a server tool.
- **NOT-TESTED (deep) tools** are covered at smoke level only; extending deep coverage to the remaining server tools (watermark, crop, flatten, organize, redact, repair, pdf-to-word/excel, ocr, sign, compare) and remaining client tools is the top test-debt item.

## Known product findings surfaced by tests (see QA-AUDIT.md)
- FileDrop silent wrong-type rejection (PS-4) — asserted correct behaviour, fails against current build.
- No client size enforcement (PS-3).
- Timestamp-converter SSR/CSR hydration mismatch (`TimestampConverterView.tsx:93`).
- ResultPreview page-index leak (B1).
