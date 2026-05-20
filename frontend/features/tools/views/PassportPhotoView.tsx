"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Camera, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { photoToPdf, toolDownloadUrl, type PhotoResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/track";

const sizes = [
  { value: "passport", label: "Passport", description: "45 × 35 mm (BD/India/EU)" },
  { value: "stamp", label: "Stamp", description: "1 × 1 inch (25.4 × 25.4 mm)" },
  { value: "visa_us", label: "US Visa", description: "2 × 2 inch (50.8 × 50.8 mm)" },
] as const;

const layouts = [
  { value: "single", label: "Single", copies: 1 },
  { value: "grid_4", label: "4 copies (2×2)", copies: 4 },
  { value: "grid_8", label: "8 copies (2×4)", copies: 8 },
] as const;

export function PassportPhotoView() {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState<(typeof sizes)[number]["value"]>("passport");
  const [layout, setLayout] = useState<(typeof layouts)[number]["value"]>("grid_8");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PhotoResult | null>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Upload a photo first");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "passport-photo-pdf", size, layout });
    try {
      const r = await photoToPdf(file, { size, layout });
      setResult(r);
      toast.success(`Created ${r.info.copies} copies on A4`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "passport-photo-pdf" });
      toast.error(err instanceof ApiError ? err.message : "Failed to create PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Passport Photo PDF"
      subtitle="Upload one photo and get a perfectly arranged A4 sheet - built for Bangladesh, India, EU, and US visa requirements."
      badge="Made for BD"
      icon={Camera}
      sideCard={
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use a high-resolution photo (1000px+).</p>
            <p>• Plain background works best (auto-fit centers subject).</p>
            <p>• Bangladesh/India standard passport: 45 × 35 mm.</p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop your photo here"
          hint="JPG, PNG, or HEIC. Subject will be auto-centered."
          accept={{ "image/*": [] }}
          file={file}
          preview={preview}
          onChange={setFile}
          testId="photo-file"
          className="max-w-xl"
        />

        <Card>
          <CardHeader>
            <CardTitle>Photo size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSize(s.value)}
                  aria-pressed={size === s.value}
                  data-testid={`size-${s.value}`}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    size === s.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-muted/60",
                  )}
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Copies per page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
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
                  <p className="text-xs text-muted-foreground">{l.copies} copies</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={handleSubmit}
          isLoading={busy}
          disabled={!file}
          data-testid="photo-button"
        >
          <Wand2 className="h-4 w-4" /> Create PDF
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={`${result.info.copies} copies · ${result.info.width_mm}×${result.info.height_mm} mm`}
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="passport-photo-pdf"
            testId="photo-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
