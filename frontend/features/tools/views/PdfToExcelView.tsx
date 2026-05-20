"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Table, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { pdfTableToExcel, toolDownloadUrl, type PdfTableResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { trackEvent } from "@/lib/track";

export function PdfToExcelView() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PdfTableResult | null>(null);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Upload a PDF file");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "pdf-to-excel" });
    try {
      const r = await pdfTableToExcel(file);
      setResult(r);
      const sheetLabel = r.sheets > 1 ? `${r.sheets} tabs` : `${r.tables} table${r.tables === 1 ? "" : "s"}`;
      toast.success(`Extracted ${r.rows} rows across ${sheetLabel}`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "pdf-to-excel" });
      toast.error(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="PDF to Excel"
      subtitle="Extract tables from PDF files into editable Excel spreadsheets (.xlsx)."
      icon={Table}
      sideCard={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Best results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ PDFs with selectable text (most digital PDFs)</p>
              <p>✓ Standard tabular layouts</p>
              <p>✗ Pure image-only scans - run OCR first</p>
            </CardContent>
          </Card>
          <Card className="border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy:</strong> Your file is processed in
              memory and auto-deleted within an hour. We never log content.
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop your PDF with tables"
          hint="Most digital PDFs work great. Image-only scans may need OCR first."
          accept={{ "application/pdf": [".pdf"] }}
          file={file}
          onChange={setFile}
          testId="bank-file"
          className="max-w-xl"
        />

        <Button
          size="lg"
          onClick={handleConvert}
          isLoading={busy}
          disabled={!file}
          data-testid="bank-convert-button"
        >
          <Wand2 className="h-4 w-4" /> Convert to Excel
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={
              <span className="inline-flex items-center gap-1">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {result.rows} rows · {result.columns} columns ·{" "}
                {result.sheets > 1
                  ? `${result.sheets} tabs (1 per page)`
                  : `${result.tables} table${result.tables === 1 ? "" : "s"}`}
              </span>
            }
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="pdf-to-excel"
            testId="bank-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
