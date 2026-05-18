"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Table, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { convertBankStatement, toolDownloadUrl, type BankResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("pdf-to-excel-converter")!;

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BankResult | null>(null);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Upload a PDF file");
      return;
    }
    setBusy(true);
    try {
      const r = await convertBankStatement(file);
      setResult(r);
      toast.success(`Extracted ${r.rows} rows × ${r.columns} columns`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title={tool.primaryKeyword}
      subtitle={`Extract tables from PDF files into editable Excel spreadsheets. ${tool.relatedKeywords[0]}.`}
      icon={Table}
      gradient="from-amber-500 via-orange-500 to-rose-500"
      sideCard={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Best results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ PDFs with selectable text (most digital PDFs)</p>
              <p>✓ Standard tabular layouts</p>
              <p>✗ Pure image-only scans, run OCR first</p>
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
                {result.rows} rows · {result.columns} columns
              </span>
            }
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            testId="bank-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
