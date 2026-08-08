"use client";

import { useCallback, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { API_BASE, ApiError } from "@/services/api";
import { toolDownloadUrl, type ToolDownloadable } from "@/services/tools-api";

// Browsers do not report a MIME type for HEIC consistently, so accept by
// extension as well - Safari says image/heic, Chrome on Windows says nothing.
const ACCEPT = {
  "image/heic": [".heic", ".HEIC"],
  "image/heif": [".heif", ".HEIF"],
  "application/octet-stream": [".heic", ".heif"],
};

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}

export function HeicToJpgView() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(92);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ToolDownloadable | null>(null);

  const onPick = useCallback((f: File | null) => {
    setFile(f);
    setResult(null);
  }, []);

  async function run() {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("quality", String(quality));
      const res = await fetch(`${API_BASE}/tools/heic-to-jpg`, { method: "POST", body: fd });
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d?.detail)
          .catch(() => null);
        throw new ApiError(detail || "Conversion failed", res.status);
      }
      setResult(await res.json());
      toast.success("Converted to JPG");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell
      title="HEIC to JPG"
      subtitle="Turn iPhone photos into JPGs that open anywhere. Full resolution kept, EXIF carried through."
      icon={Camera}
      badge="Server-side"
    >
      <div className="space-y-6">
        <FileDrop
          label="HEIC to JPG"
          accept={ACCEPT}
          file={file}
          onChange={onPick}
          testId="heic-input"
          hint="Straight from an iPhone or iPad. Max 100 MB, deleted an hour after processing."
        />

        {file && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                JPG quality <span className="tabular text-foreground">{quality}</span>
              </span>
              <input
                type="range"
                min={60}
                max={100}
                value={quality}
                onChange={(e) => setQuality(+e.target.value)}
                aria-label="JPG quality"
                className="w-full accent-[rgb(var(--primary))]"
              />
            </label>
            <Button onClick={run} disabled={busy} data-testid="heic-run" className="w-full sm:w-auto">
              {busy ? "Converting…" : "Convert to JPG"}
            </Button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is the only image tool here that uses our server - no browser outside Safari can
              decode HEIC, and the JavaScript decoder is about a megabyte.
            </p>
          </div>
        )}

        {result && (
          <div
            className="rounded-2xl border border-border bg-card p-5 space-y-3"
            data-testid="heic-result"
            aria-live="polite"
          >
            <p className="tabular text-sm">
              {file ? `${fmtBytes(file.size)} → ` : ""}
              {fmtBytes(result.size_bytes)}
            </p>
            <a
              href={toolDownloadUrl(result.output_id, result.filename)}
              data-testid="heic-download"
            >
              <Button className="w-full sm:w-auto">Download {result.filename}</Button>
            </a>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
