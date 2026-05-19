"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Languages, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { ApiError } from "@/services/api";
import { downloadBlob, cn } from "@/lib/utils";
import { extractOCR, getOcrStatus, type OcrResult, type OcrStatus } from "@/services/tools-api";
import { trackEvent } from "@/lib/track";

const langs: Array<{ value: string; label: string; sub: string }> = [
  { value: "eng+ben", label: "English + Bangla", sub: "Best for mixed BD documents" },
  { value: "eng", label: "English only", sub: "Fastest for English text" },
  { value: "ben", label: "Bangla only", sub: "Bengali script" },
  { value: "hin", label: "Hindi", sub: "Devanagari script" },
  { value: "ara", label: "Arabic", sub: "Right-to-left support" },
  { value: "chi_sim+eng", label: "Chinese + English", sub: "Simplified + English" },
];

export function PdfOcrView() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState<string>("eng+ben");
  const [forceOcr, setForceOcr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [status, setStatus] = useState<OcrStatus | null>(null);

  useEffect(() => {
    getOcrStatus().then(setStatus).catch(() => setStatus({ available: false, languages: [] }));
  }, []);

  const handleExtract = async () => {
    if (!file) {
      toast.error("Upload a PDF first");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "pdf-ocr", lang });
    try {
      const r = await extractOCR(file, lang, forceOcr);
      setResult(r);
      const summary = r.method_summary || {};
      const textPages = summary.text ?? 0;
      const ocrPages = summary.ocr ?? 0;
      const detail =
        textPages > 0 && ocrPages > 0
          ? `${textPages} via text-layer, ${ocrPages} via OCR`
          : textPages > 0
            ? "extracted from text layer"
            : "extracted via OCR";
      toast.success(`${r.page_count} page${r.page_count === 1 ? "" : "s"} processed, ${detail}`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "pdf-ocr" });
      toast.error(err instanceof ApiError ? err.message : "OCR failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    toast.success("Text copied to clipboard");
  };

  const handleDownload = () => {
    if (!result?.text) return;
    downloadBlob(new Blob([result.text], { type: "text/plain;charset=utf-8" }), "extracted-text.txt");
  };

  return (
    <ToolShell
      title="PDF OCR"
      subtitle="Extract text from scanned PDFs — 100+ languages including English, Bangla, Hindi, Arabic, and Chinese."
      icon={Languages}
      sideCard={
        <Card>
          <CardHeader>
            <CardTitle>OCR engine</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {status === null ? (
              <p className="text-muted-foreground">Checking…</p>
            ) : status.available ? (
              <>
                <div className="flex items-center gap-2 text-success">
                  <span className="h-2 w-2 rounded-full bg-success" /> Tesseract ready
                </div>
                <p className="text-xs text-muted-foreground">
                  {status.languages.length} languages available
                </p>
              </>
            ) : (
              <p className="text-destructive">Tesseract not installed on the server.</p>
            )}
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop a PDF to extract text"
          hint="Works best with scanned/photographed pages"
          accept={{ "application/pdf": [".pdf"] }}
          file={file}
          onChange={setFile}
          testId="ocr-file"
          className="max-w-xl"
        />

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {langs.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLang(l.value)}
                  aria-pressed={lang === l.value}
                  data-testid={`lang-${l.value}`}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    lang === l.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-muted/60",
                  )}
                >
                  <p className="font-semibold">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.sub}</p>
                </button>
              ))}
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-border bg-muted/30 p-3">
              <input
                type="checkbox"
                checked={forceOcr}
                onChange={(e) => setForceOcr(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                data-testid="force-ocr"
              />
              <span>
                <span className="block text-sm font-medium">Force OCR (skip text layer)</span>
                <span className="block text-xs text-muted-foreground">
                  By default we read the embedded text layer when available — instant and 100% accurate.
                  Enable this only for fully-scanned PDFs where the text layer is missing or wrong.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={handleExtract}
          isLoading={busy}
          disabled={!file || !status?.available}
          data-testid="ocr-button"
        >
          <Wand2 className="h-4 w-4" /> Extract text
        </Button>

        {result && (
          <Card data-testid="ocr-result">
            <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>Extracted text</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{result.page_count} pages · {result.text.length.toLocaleString()} chars</span>
                  {(result.method_summary?.text ?? 0) > 0 && (
                    <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-medium">
                      {result.method_summary.text} text-layer
                    </span>
                  )}
                  {(result.method_summary?.ocr ?? 0) > 0 && (
                    <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-medium">
                      {result.method_summary.ocr} OCR
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button size="sm" variant="primary" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" /> Download .txt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                readOnly
                data-testid="ocr-text"
                value={result.text}
                className="w-full min-h-[280px] resize-y rounded-xl border border-border bg-muted/40 p-4 text-sm font-mono leading-relaxed focus:bg-background"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolShell>
  );
}
