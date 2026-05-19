"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IdCard, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { idCardCombine, toolDownloadUrl, type ToolDownloadable } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("id-card-to-pdf")!;

const layouts = [
  { value: "a4_portrait", label: "A4 portrait", description: "Most common, vertical sheet" },
  { value: "a4_horizontal", label: "A4 horizontal", description: "Wider, side-by-side" },
  { value: "compact", label: "Compact", description: "Smaller cards, more whitespace" },
] as const;

export default function IdCardToPdfPage() {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [layout, setLayout] = useState<(typeof layouts)[number]["value"]>("a4_portrait");
  const [labels, setLabels] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ToolDownloadable | null>(null);

  const frontPreview = useMemo(() => (front ? URL.createObjectURL(front) : null), [front]);
  const backPreview = useMemo(() => (back ? URL.createObjectURL(back) : null), [back]);

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
    };
  }, [frontPreview]);
  useEffect(() => {
    return () => {
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [backPreview]);

  const handleSubmit = async () => {
    if (!front || !back) {
      toast.error("Upload both front and back of the ID card");
      return;
    }
    setBusy(true);
    try {
      const res = await idCardCombine(front, back, { layout, add_labels: labels });
      setResult(res);
      toast.success("ID card combined successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to combine");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title={tool.displayName}
      subtitle={`Combine two-sided ID cards onto a single print-ready A4 PDF. ${tool.relatedKeywords[0]}.`}
      icon={IdCard}
      gradient="from-indigo-500 via-violet-500 to-fuchsia-500"
      sideCard={
        <>
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Upload the front side image (or PDF).</p>
              <p>2. Upload the back side.</p>
              <p>3. Choose layout, click <strong className="text-foreground">Combine ID card</strong>.</p>
              <p>4. Download the print-ready A4 PDF.</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/40 border-primary/30">
            <CardContent className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Pro tip</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Take photos in good lighting against a plain background for the cleanest result.
              </p>
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FileDrop
            label="Front side"
            hint="Upload front of ID card (image or PDF)"
            accept={{ "image/*": [], "application/pdf": [".pdf"] }}
            file={front}
            preview={frontPreview}
            onChange={setFront}
            testId="nid-front"
          />
          <FileDrop
            label="Back side"
            hint="Upload back of ID card (image or PDF)"
            accept={{ "image/*": [], "application/pdf": [".pdf"] }}
            file={back}
            preview={backPreview}
            onChange={setBack}
            testId="nid-back"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Layout options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {layouts.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLayout(l.value)}
                  aria-pressed={layout === l.value}
                  data-testid={`layout-${l.value}`}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    layout === l.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-muted/60",
                  )}
                >
                  <p className="font-semibold">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.description}</p>
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={labels}
                onChange={(e) => setLabels(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                data-testid="add-labels"
              />
              <span className="text-sm">Show &ldquo;Front&rdquo; / &ldquo;Back&rdquo; labels above each card</span>
            </label>
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={handleSubmit}
          isLoading={busy}
          disabled={!front || !back}
          data-testid="nid-combine-button"
          className="w-full sm:w-auto"
        >
          <Wand2 className="h-4 w-4" /> Combine ID card
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description="A4 page, print-ready"
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            testId="nid-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
