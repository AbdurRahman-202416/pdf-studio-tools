"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileType, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  wordToPdf,
  toolDownloadUrl,
  type WordToPdfResult,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { trackEvent } from "@/lib/track";

export function WordToPdfView() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<WordToPdfResult | null>(null);

  const handleConvert = async () => {
    if (!file) {
      toast.error("Upload a .docx file first");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "word-to-pdf" });
    try {
      const r = await wordToPdf(file);
      setResult(r);
      toast.success(`Rendered ${r.blocks} block${r.blocks === 1 ? "" : "s"} to PDF`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "word-to-pdf" });
      toast.error(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Word to PDF"
      subtitle="Convert .docx documents to PDF — preserves headings, lists, tables, and inline images."
      icon={FileType}
      sideCard={
        <Card>
          <CardHeader>
            <CardTitle>Supported</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✓ .docx (Word 2007+)</p>
            <p>✓ Headings, lists, basic tables, images</p>
            <p>✗ Legacy .doc — re-save as .docx first</p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop your .docx file"
          hint="Max 100 MB. Files auto-delete after 1 hour."
          accept={{
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
          }}
          file={file}
          onChange={setFile}
          className="max-w-xl"
        />

        <Button
          size="lg"
          onClick={handleConvert}
          isLoading={busy}
          disabled={!file}
          data-testid="word-to-pdf-button"
        >
          <Wand2 className="h-4 w-4" /> Convert to PDF
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={`${result.blocks} blocks · ${result.images} images`}
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="word-to-pdf"
            testId="word-to-pdf-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
