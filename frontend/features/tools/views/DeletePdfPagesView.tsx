"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { deletePdfPages, toolDownloadUrl, type PdfDeletePagesResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";

export function DeletePdfPagesView() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PdfDeletePagesResult | null>(null);

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF first.");
      return;
    }
    if (!pages.trim()) {
      toast.error("Enter the pages to delete, e.g. 2 or 2,4-6.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await deletePdfPages(file, pages);
      setResult(r);
      toast.success(`Removed ${r.removed} page${r.removed === 1 ? "" : "s"} - ${r.remaining} left`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Delete PDF Pages"
      subtitle="Remove unwanted pages from a PDF - blank scans, wrong pages, extra copies. Free, no signup, no watermark."
      badge="NEW"
      icon={Trash2}
      gradient="from-rose-500 via-red-500 to-orange-500"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Choose your PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDrop
              label="Upload PDF"
              accept={{ "application/pdf": [".pdf"] }}
              file={file}
              onChange={setFile}
              hint="Max 100 MB. Files stay private and auto-delete after 1 hour."
              testId="delete-pages-drop"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Pages to delete</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              id="delete-pages-input"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 2,4-6"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-xs text-muted-foreground mt-1">
              1-based page numbers. Examples: <code>2</code>, <code>1,3</code>, <code>4-6,9</code>. At
              least one page must remain.
            </p>
          </CardContent>
        </Card>

        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          isLoading={busy}
          disabled={!file || busy}
          data-testid="delete-pages-submit"
        >
          <Wand2 className="h-4 w-4" /> Delete pages
        </Button>

        {result && (
          <ToolResult
            filename="pages-removed.pdf"
            size_bytes={result.size_bytes}
            description={`${result.removed} page${result.removed === 1 ? "" : "s"} removed, ${result.remaining} remaining`}
            downloadHref={toolDownloadUrl(result.output_id, "pages-removed.pdf")}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            testId="delete-pages-result"
            tool="delete-pdf-pages"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload your PDF (up to 100 MB).</p>
            <p>2. Type the page numbers to remove - single pages or ranges.</p>
            <p>3. Download the cleaned PDF. The original file is never modified.</p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
