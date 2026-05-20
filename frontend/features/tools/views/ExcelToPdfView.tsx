"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Sheet, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { excelToPdf, toolDownloadUrl, type ExcelToPdfResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { trackEvent } from "@/lib/track";

export function ExcelToPdfView() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExcelToPdfResult | null>(null);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Upload an Excel file");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "excel-to-pdf" });
    try {
      const r = await excelToPdf(file);
      setResult(r);
      toast.success(
        `Rendered ${r.sheets} sheet${r.sheets === 1 ? "" : "s"} to PDF (${r.orientation})`,
      );
    } catch (err) {
      trackEvent("tool_failed", { tool: "excel-to-pdf" });
      toast.error(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Excel to PDF"
      subtitle="Render every sheet in an .xlsx workbook as a clean PDF table. One sheet per PDF page."
      icon={Sheet}
      sideCard={
        <>
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ Every sheet becomes one PDF page</p>
              <p>✓ First row treated as header (bold + colored band)</p>
              <p>✓ Zebra rows and borders for readability</p>
              <p>✓ Wide sheets auto-flip to landscape</p>
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
          label="Drop your .xlsx file"
          hint="Multi-sheet workbooks fully supported. Formulas are evaluated to their last cached value."
          accept={{
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel.sheet.macroenabled.12": [".xlsm"],
          }}
          file={file}
          onChange={setFile}
          testId="xlsx-file"
          className="max-w-xl"
        />

        <Button
          size="lg"
          onClick={handleConvert}
          isLoading={busy}
          disabled={!file}
          data-testid="xlsx-convert-button"
        >
          <Wand2 className="h-4 w-4" /> Convert to PDF
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {result.sheets} sheet{result.sheets === 1 ? "" : "s"} · {result.rows} data
                row{result.rows === 1 ? "" : "s"} · {result.orientation}
              </span>
            }
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="excel-to-pdf"
            testId="xlsx-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
