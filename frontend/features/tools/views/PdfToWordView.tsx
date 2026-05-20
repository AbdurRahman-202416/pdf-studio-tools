"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  pdfToWord,
  toolDownloadUrl,
  type PdfToWordResult,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { trackEvent } from "@/lib/track";

export function PdfToWordView() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PdfToWordResult | null>(null);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Upload a PDF first");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "pdf-to-word" });
    try {
      const r = await pdfToWord(file);
      setResult(r);
      toast.success(`Converted ${r.pages} page${r.pages === 1 ? "" : "s"} to Word`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "pdf-to-word" });
      toast.error(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="PDF to Word"
      subtitle="Convert PDF to an editable Word document (.docx). Preserves paragraphs, basic tables, and inline images."
      icon={FileText}
      sideCard={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Best results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ Digital PDFs (most resumes, reports)</p>
              <p>✓ Single-column text-heavy layouts</p>
              <p>✗ Scanned PDFs - run OCR first</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/40 border-primary/30">
            <CardContent className="text-sm">
              Scanned PDF? Run <strong>PDF OCR</strong> first, then come back here.
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop your PDF"
          hint="Works best on text-based PDFs. Output opens in Word, Google Docs, or LibreOffice."
          accept={{ "application/pdf": [".pdf"] }}
          file={file}
          onChange={setFile}
          className="max-w-xl"
        />

        <Button
          size="lg"
          onClick={handleConvert}
          isLoading={busy}
          disabled={!file}
          data-testid="pdf-to-word-button"
        >
          <Wand2 className="h-4 w-4" /> Convert to Word
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={`${result.pages} pages · ${result.characters.toLocaleString()} chars · ${result.images} images`}
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="pdf-to-word"
            testId="pdf-to-word-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
