"use client";

import dynamic from "next/dynamic";

import { WorkspaceShell } from "@/features/pdf/components/WorkspaceShell";
import type { ComponentType } from "react";

/**
 * Slug -> interactive view.
 *
 * These MUST be dynamic imports. All tools share one `/[slug]` route, so
 * a static import map would bundle every view into every tool page. With
 * `next/dynamic` each view is its own chunk and a visitor to /compress-pdf
 * never downloads the signature canvas or the OCR client.
 *
 * A slug with no entry falls back to the shared WorkspaceShell (merge-pdf).
 */
/** Views take heterogeneous props; the registry supplies them per slug. */
type AnyViewProps = Record<string, unknown>;

/**
 * Server-rendered on purpose (no `ssr: false`).
 *
 * Each view renders its own <h1> via ToolShell, so deferring them to the client
 * strips the H1 out of the prerendered HTML on 20 of 21 tool pages - a real SEO
 * regression. Verified: with plain `dynamic()` the H1 is present and views still
 * split per chunk (a visitor to /compress-pdf does not download the OCR, photo,
 * NID or Excel views).
 */
const lazy = <T,>(load: () => Promise<T>, pick: (m: T) => unknown) =>
  dynamic(() =>
    load().then((m) => ({ default: pick(m) as ComponentType<AnyViewProps> })),
  );

const VIEWS: Record<string, ComponentType<AnyViewProps>> = {
  "compress-pdf": lazy(
    () => import("@/features/tools/views/CompressByOutcomeView"),
    (m) => m.CompressByOutcomeView,
  ),
  "compress-pdf-to-100kb": lazy(
    () => import("@/features/tools/views/CompressTo100kbView"),
    (m) => m.CompressTo100kbView,
  ),
  "compress-pdf-to-200kb": lazy(
    () => import("@/features/tools/views/CompressToTargetView"),
    (m) => m.CompressToTargetView,
  ),
  "compress-pdf-to-500kb": lazy(
    () => import("@/features/tools/views/CompressToTargetView"),
    (m) => m.CompressToTargetView,
  ),
  "compress-pdf-to-1mb": lazy(
    () => import("@/features/tools/views/CompressToTargetView"),
    (m) => m.CompressToTargetView,
  ),
  "pdf-to-jpg": lazy(
    () => import("@/features/tools/views/PdfToJpgView"),
    (m) => m.PdfToJpgView,
  ),
  "jpg-to-pdf": lazy(
    () => import("@/features/tools/views/JpgToPdfView"),
    (m) => m.JpgToPdfView,
  ),
  "lock-pdf": lazy(
    () => import("@/features/tools/views/PdfLockView"),
    (m) => m.PdfLockView,
  ),
  "unlock-pdf": lazy(
    () => import("@/features/tools/views/PdfLockView"),
    (m) => m.PdfLockView,
  ),
  "pdf-ocr": lazy(
    () => import("@/features/tools/views/PdfOcrView"),
    (m) => m.PdfOcrView,
  ),
  "nid-combine": lazy(
    () => import("@/features/tools/views/NidCombineView"),
    (m) => m.NidCombineView,
  ),
  "passport-photo-pdf": lazy(
    () => import("@/features/tools/views/PassportPhotoView"),
    (m) => m.PassportPhotoView,
  ),
  "pdf-to-excel": lazy(
    () => import("@/features/tools/views/PdfToExcelView"),
    (m) => m.PdfToExcelView,
  ),
  "excel-to-pdf": lazy(
    () => import("@/features/tools/views/ExcelToPdfView"),
    (m) => m.ExcelToPdfView,
  ),
  "pdf-to-word": lazy(
    () => import("@/features/tools/views/PdfToWordView"),
    (m) => m.PdfToWordView,
  ),
  "word-to-pdf": lazy(
    () => import("@/features/tools/views/WordToPdfView"),
    (m) => m.WordToPdfView,
  ),
  "sign-pdf": lazy(
    () => import("@/features/tools/views/SignPdfView"),
    (m) => m.SignPdfView,
  ),
  "split-pdf": lazy(
    () => import("@/features/tools/views/SplitPdfView"),
    (m) => m.SplitPdfView,
  ),
  "rotate-pdf": lazy(
    () => import("@/features/tools/views/RotatePdfView"),
    (m) => m.RotatePdfView,
  ),
  "delete-pdf-pages": lazy(
    () => import("@/features/tools/views/DeletePdfPagesView"),
    (m) => m.DeletePdfPagesView,
  ),

  // Image tools all share one canvas-backed view, configured by slug.
  "compress-image": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "resize-image": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "jpg-to-png": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "png-to-jpg": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "webp-converter": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "crop-image": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "watermark-image": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "image-to-ico": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),

  // HEIC is the one server-backed image tool; the rest below are pure client tools.
  "heic-to-jpg": lazy(
    () => import("@/features/tools/views/HeicToJpgView"),
    (m) => m.HeicToJpgView,
  ),
  "qr-code-generator": lazy(
    () => import("@/features/tools/views/QrGeneratorView"),
    (m) => m.QrGeneratorView,
  ),
  "barcode-generator": lazy(
    () => import("@/features/tools/views/BarcodeGeneratorView"),
    (m) => m.BarcodeGeneratorView,
  ),
  "qr-scanner": lazy(
    () => import("@/features/tools/views/QrScannerView"),
    (m) => m.QrScannerView,
  ),
  "password-generator": lazy(
    () => import("@/features/tools/views/PasswordGeneratorView"),
    (m) => m.PasswordGeneratorView,
  ),
  "color-picker": lazy(
    () => import("@/features/tools/views/ColorPickerView"),
    (m) => m.ColorPickerView,
  ),
  "color-converter": lazy(
    () => import("@/features/tools/views/ColorConverterView"),
    (m) => m.ColorConverterView,
  ),
  "timestamp-converter": lazy(
    () => import("@/features/tools/views/TimestampConverterView"),
    (m) => m.TimestampConverterView,
  ),

  // Developer / text / data tools: most share the generic transform view.
  "json-formatter": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "base64-encode-decode": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "jwt-decoder": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "hash-generator": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "uuid-generator": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "url-encoder-decoder": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "cron-expression-generator": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "sql-formatter": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "yaml-to-json": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "csv-to-json": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "markdown-to-html": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "word-counter": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "regex-tester": lazy(
    () => import("@/features/tools/views/RegexTesterView"),
    (m) => m.RegexTesterView,
  ),
  "diff-checker": lazy(
    () => import("@/features/tools/views/DiffCheckerView"),
    (m) => m.DiffCheckerView,
  ),

  // PDF gap tools share one schema-driven server view.
  "watermark-pdf": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),
  "add-page-numbers": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),
  "crop-pdf": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),
  "flatten-pdf": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),
  "organize-pdf": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),
  "redact-pdf": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),
  "repair-pdf": lazy(
    () => import("@/features/tools/views/PdfEditView"),
    (m) => m.PdfEditView,
  ),

  // Calculators: most share one schema-driven view.
  "mortgage-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "loan-emi-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "percentage-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "age-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "date-difference-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "bmi-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "discount-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "tip-calculator": lazy(
    () => import("@/features/tools/views/CalculatorView"),
    (m) => m.CalculatorView,
  ),
  "unit-converter": lazy(
    () => import("@/features/tools/views/UnitConverterView"),
    (m) => m.UnitConverterView,
  ),
  "gpa-calculator": lazy(
    () => import("@/features/tools/views/GpaCalculatorView"),
    (m) => m.GpaCalculatorView,
  ),

  // Tier 2 + 3 general-audience tools.
  "case-converter": lazy(
    () => import("@/features/tools/views/TextToolView"),
    (m) => m.TextToolView,
  ),
  "social-media-image-resizer": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "photo-resizer-for-print": lazy(
    () => import("@/features/tools/views/ImageToolView"),
    (m) => m.ImageToolView,
  ),
  "password-strength-checker": lazy(
    () => import("@/features/tools/views/PasswordStrengthView"),
    (m) => m.PasswordStrengthView,
  ),
  "pdf-to-text": lazy(
    () => import("@/features/tools/views/PdfTextView"),
    (m) => m.PdfTextView,
  ),
  "compare-pdf": lazy(
    () => import("@/features/tools/views/PdfTextView"),
    (m) => m.PdfTextView,
  ),
  "coin-flip": lazy(
    () => import("@/features/tools/views/RandomizerView"),
    (m) => m.RandomizerView,
  ),
  "dice-roller": lazy(
    () => import("@/features/tools/views/RandomizerView"),
    (m) => m.RandomizerView,
  ),
  "random-number-generator": lazy(
    () => import("@/features/tools/views/RandomizerView"),
    (m) => m.RandomizerView,
  ),
  "random-picker-wheel": lazy(
    () => import("@/features/tools/views/RandomizerView"),
    (m) => m.RandomizerView,
  ),
  "random-name-generator": lazy(
    () => import("@/features/tools/views/RandomizerView"),
    (m) => m.RandomizerView,
  ),
  "countdown-timer": lazy(
    () => import("@/features/tools/views/TimerView"),
    (m) => m.TimerView,
  ),
  "stopwatch-online": lazy(
    () => import("@/features/tools/views/TimerView"),
    (m) => m.TimerView,
  ),
};

/**
 * Props the old per-tool page.tsx files passed by hand. Kept verbatim so every
 * migrated tool renders exactly what it rendered before.
 */
const VIEW_PROPS: Record<string, Record<string, unknown>> = {
  "case-converter": { slug: "case-converter" },
  "social-media-image-resizer": { slug: "social-media-image-resizer" },
  "photo-resizer-for-print": { slug: "photo-resizer-for-print" },
  "pdf-to-text": { slug: "pdf-to-text" },
  "compare-pdf": { slug: "compare-pdf" },
  "coin-flip": { slug: "coin-flip" },
  "dice-roller": { slug: "dice-roller" },
  "random-number-generator": { slug: "random-number-generator" },
  "random-picker-wheel": { slug: "random-picker-wheel" },
  "random-name-generator": { slug: "random-name-generator" },
  "countdown-timer": { slug: "countdown-timer" },
  "stopwatch-online": { slug: "stopwatch-online" },
  "mortgage-calculator": { slug: "mortgage-calculator" },
  "loan-emi-calculator": { slug: "loan-emi-calculator" },
  "percentage-calculator": { slug: "percentage-calculator" },
  "age-calculator": { slug: "age-calculator" },
  "date-difference-calculator": { slug: "date-difference-calculator" },
  "bmi-calculator": { slug: "bmi-calculator" },
  "discount-calculator": { slug: "discount-calculator" },
  "tip-calculator": { slug: "tip-calculator" },
  "watermark-pdf": { slug: "watermark-pdf" },
  "add-page-numbers": { slug: "add-page-numbers" },
  "crop-pdf": { slug: "crop-pdf" },
  "flatten-pdf": { slug: "flatten-pdf" },
  "organize-pdf": { slug: "organize-pdf" },
  "redact-pdf": { slug: "redact-pdf" },
  "repair-pdf": { slug: "repair-pdf" },
  "json-formatter": { slug: "json-formatter" },
  "base64-encode-decode": { slug: "base64-encode-decode" },
  "jwt-decoder": { slug: "jwt-decoder" },
  "hash-generator": { slug: "hash-generator" },
  "uuid-generator": { slug: "uuid-generator" },
  "url-encoder-decoder": { slug: "url-encoder-decoder" },
  "cron-expression-generator": { slug: "cron-expression-generator" },
  "sql-formatter": { slug: "sql-formatter" },
  "yaml-to-json": { slug: "yaml-to-json" },
  "csv-to-json": { slug: "csv-to-json" },
  "markdown-to-html": { slug: "markdown-to-html" },
  "word-counter": { slug: "word-counter" },
  "compress-image": { slug: "compress-image" },
  "resize-image": { slug: "resize-image" },
  "jpg-to-png": { slug: "jpg-to-png" },
  "png-to-jpg": { slug: "png-to-jpg" },
  "webp-converter": { slug: "webp-converter" },
  "crop-image": { slug: "crop-image" },
  "watermark-image": { slug: "watermark-image" },
  "image-to-ico": { slug: "image-to-ico" },
  "lock-pdf": { mode: "lock" },
  "unlock-pdf": { mode: "unlock" },
  "compress-pdf-to-200kb": {
    slug: "compress-pdf-to-200kb",
    defaultTarget: "200kb",
    title: "Compress PDF to 200KB",
    subtitle:
      "Target-size PDF compressor that keeps scanned text legible - sized for visa forms, job portals, and 200KB upload limits.",
  },
  "compress-pdf-to-500kb": {
    slug: "compress-pdf-to-500kb",
    defaultTarget: "500kb",
    title: "Compress PDF to 500KB",
    subtitle:
      "Shrink large or image-heavy PDFs under a 500KB limit while keeping high quality.",
  },
  "compress-pdf-to-1mb": {
    slug: "compress-pdf-to-1mb",
    defaultTarget: "1mb",
    title: "Compress PDF to 1MB",
    subtitle:
      "Reduce large PDFs under a 1MB email or upload limit with near-original quality.",
  },
};

/**
 * A tool's interactive surface. Falls back to the shared PDF workspace for
 * tools with no bespoke view (merge-pdf today).
 *
 * Must be a Component rather than a function the server calls: this is a client
 * module, so its exports are client references on the server side.
 */
export function ToolView({
  slug,
  title,
  subtitle,
}: {
  slug: string;
  title: string;
  subtitle: string;
}) {
  const View = VIEWS[slug];
  if (!View) return <WorkspaceShell title={title} subtitle={subtitle} showBackLink />;
  return <View {...(VIEW_PROPS[slug] ?? {})} />;
}
