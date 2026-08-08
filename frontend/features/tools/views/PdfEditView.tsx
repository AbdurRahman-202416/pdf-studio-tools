"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { getToolIcon } from "@/lib/seo/tool-icons";
import { API_BASE } from "@/services/api";
import { toolDownloadUrl } from "@/services/tools-api";

const ACCEPT = { "application/pdf": [".pdf"] };

type FieldKind = "text" | "number" | "select" | "toggle" | "textarea";

interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  default: string;
  help?: string;
  min?: number;
  max?: number;
  step?: number;
  choices?: { value: string; label: string }[];
  placeholder?: string;
}

interface Config {
  title: string;
  subtitle: string;
  iconName: string;
  endpoint: string;
  action: string;
  fields: Field[];
  note?: string;
}

const CONFIG: Record<string, Config> = {
  "watermark-pdf": {
    title: "Watermark PDF",
    subtitle: "Stamp text across every page. Tiled and angled by default, because that is harder to crop out.",
    iconName: "Stamp",
    endpoint: "/tools/pdf/watermark",
    action: "Add watermark",
    fields: [
      { key: "text", label: "Watermark text", kind: "text", default: "CONFIDENTIAL", placeholder: "DRAFT" },
      { key: "opacity", label: "Opacity", kind: "number", default: "0.25", min: 0.05, max: 1, step: 0.05 },
      { key: "rotation", label: "Angle (degrees)", kind: "number", default: "45", min: 0, max: 359 },
      { key: "font_size", label: "Font size", kind: "number", default: "42", min: 8, max: 120 },
      { key: "tile", label: "Tile across the page", kind: "toggle", default: "true" },
      { key: "pages", label: "Pages", kind: "text", default: "all", help: "all, or a selection like 1,3-5" },
    ],
  },
  "add-page-numbers": {
    title: "Add Page Numbers",
    subtitle: "Real selectable text in the margin, with your own format and starting number.",
    iconName: "ListOrdered",
    endpoint: "/tools/pdf/page-numbers",
    action: "Add numbers",
    fields: [
      {
        key: "position", label: "Position", kind: "select", default: "bottom-center",
        choices: [
          { value: "bottom-center", label: "Bottom centre" },
          { value: "bottom-right", label: "Bottom right" },
          { value: "bottom-left", label: "Bottom left" },
          { value: "top-center", label: "Top centre" },
          { value: "top-right", label: "Top right" },
          { value: "top-left", label: "Top left" },
        ],
      },
      { key: "fmt", label: "Format", kind: "text", default: "{n}", help: "Use {n} for the page and {total} for the count" },
      { key: "start_at", label: "Start at", kind: "number", default: "1", min: 0, max: 9999 },
      { key: "font_size", label: "Font size", kind: "number", default: "11", min: 6, max: 32 },
      { key: "skip_first", label: "Skip the first page", kind: "toggle", default: "false" },
    ],
  },
  "crop-pdf": {
    title: "Crop PDF",
    subtitle: "Trim margins by percentage. Nothing is re-rendered, so text stays selectable.",
    iconName: "Crop",
    endpoint: "/tools/pdf/crop",
    action: "Crop PDF",
    fields: [
      { key: "top", label: "Trim top (%)", kind: "number", default: "0", min: 0, max: 49 },
      { key: "bottom", label: "Trim bottom (%)", kind: "number", default: "0", min: 0, max: 49 },
      { key: "left", label: "Trim left (%)", kind: "number", default: "0", min: 0, max: 49 },
      { key: "right", label: "Trim right (%)", kind: "number", default: "0", min: 0, max: 49 },
      { key: "pages", label: "Pages", kind: "text", default: "all", help: "all, or a selection like 1,3-5" },
    ],
    note: "Cropped content is hidden rather than deleted. To remove information permanently, use Redact PDF.",
  },
  "flatten-pdf": {
    title: "Flatten PDF",
    subtitle: "Bake filled forms and annotations into the page so every reader shows the same thing.",
    iconName: "Layers",
    endpoint: "/tools/pdf/flatten",
    action: "Flatten PDF",
    fields: [],
    note: "The result can no longer be edited, so keep your original if the answers might change.",
  },
  "organize-pdf": {
    title: "Organize PDF",
    subtitle: "Reorder, subset, duplicate or reverse pages by describing the order you want.",
    iconName: "ArrowUpDown",
    endpoint: "/tools/pdf/organize",
    action: "Rebuild PDF",
    fields: [
      {
        key: "order", label: "Page order", kind: "text", default: "", placeholder: "3,1,2",
        help: "3,1,2 reorders · 2,4 subsets · 10-1 reverses · 1,2,1 repeats",
      },
    ],
  },
  "redact-pdf": {
    title: "Redact PDF",
    subtitle: "Permanently deletes the matching characters. A black box would leave them selectable underneath.",
    iconName: "EyeOff",
    endpoint: "/tools/pdf/redact",
    action: "Redact PDF",
    fields: [
      {
        key: "terms", label: "Words or phrases to remove", kind: "textarea", default: "",
        placeholder: "salary\nAcme Corp\n555-0100",
        help: "One per line. Every match on every page is removed.",
      },
      { key: "case_sensitive", label: "Match case exactly", kind: "toggle", default: "false" },
    ],
    note: "Only real text can be redacted. A scanned page has none until you run OCR - and always verify the result by trying to select the term.",
  },
  "repair-pdf": {
    title: "Repair PDF",
    subtitle: "Rebuilds a broken cross-reference table to recover a file that won't open.",
    iconName: "Wrench",
    endpoint: "/tools/pdf/repair",
    action: "Repair PDF",
    fields: [],
    note: "A truncated download cannot be fully recovered - the missing bytes do not exist. Pages that did arrive can often still be saved.",
  },
};

interface Result {
  output_id: string;
  filename: string;
  size_bytes: number;
  removed?: number;
  note?: string;
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}

export function PdfEditView({ slug }: { slug: string }) {
  const cfg = CONFIG[slug];
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((CONFIG[slug]?.fields ?? []).map((f) => [f.key, f.default])),
  );

  const onPick = useCallback((f: File | null) => {
    setFile(f);
    setResult(null);
  }, []);

  if (!cfg) return null;
  const Icon = getToolIcon(cfg.iconName) ?? getToolIcon("FileText")!;

  const missingRequired = cfg.fields.some(
    (f) => (f.key === "order" || f.key === "terms" || f.key === "text") && !values[f.key]?.trim(),
  );

  async function run() {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      for (const f of cfg.fields) fd.append(f.key, values[f.key] ?? f.default);

      const res = await fetch(`${API_BASE}${cfg.endpoint}`, { method: "POST", body: fd });
      if (!res.ok) {
        const detail = await res.json().then((d) => d?.detail).catch(() => null);
        throw new Error(detail || "That didn't work.");
      }
      setResult(await res.json());
      toast.success(`${cfg.title} complete`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title={cfg.title} subtitle={cfg.subtitle} icon={Icon} badge="Server-side">
      <div className="space-y-6">
        <FileDrop
          label={cfg.title}
          accept={ACCEPT}
          file={file}
          onChange={onPick}
          testId={`${slug}-input`}
          hint="Up to 100 MB. Both the upload and the result are deleted an hour later."
        />

        {file && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            {cfg.fields.length > 0 && <p className="text-sm font-semibold">Options</p>}

            <div className={cfg.fields.length > 2 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
              {cfg.fields.map((f) => (
                <label key={f.key} className="block space-y-1.5">
                  {f.kind !== "toggle" && (
                    <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                  )}
                  {f.kind === "select" ? (
                    <select
                      value={values[f.key] ?? f.default}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      aria-label={f.label}
                      data-testid={`field-${f.key}`}
                      className={inp}
                    >
                      {f.choices!.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  ) : f.kind === "toggle" ? (
                    <span className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={(values[f.key] ?? f.default) === "true"}
                        onChange={(e) =>
                          setValues({ ...values, [f.key]: String(e.target.checked) })
                        }
                        data-testid={`field-${f.key}`}
                        className="h-4 w-4 accent-[rgb(var(--primary))]"
                      />
                      {f.label}
                    </span>
                  ) : f.kind === "textarea" ? (
                    <textarea
                      rows={5}
                      value={values[f.key] ?? f.default}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      aria-label={f.label}
                      data-testid={`field-${f.key}`}
                      className={`tabular ${inp}`}
                    />
                  ) : (
                    <input
                      type={f.kind === "number" ? "number" : "text"}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={values[f.key] ?? f.default}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      aria-label={f.label}
                      data-testid={`field-${f.key}`}
                      className={inp}
                    />
                  )}
                  {f.help && (
                    <span className="block text-xs text-muted-foreground">{f.help}</span>
                  )}
                </label>
              ))}
            </div>

            <Button
              onClick={run}
              disabled={busy || missingRequired}
              data-testid={`${slug}-run`}
              className="w-full sm:w-auto"
            >
              {busy ? "Working…" : cfg.action}
            </Button>

            {cfg.note && (
              <p className="rounded-xl border border-border bg-background p-3.5 text-xs text-muted-foreground leading-relaxed">
                {cfg.note}
              </p>
            )}
          </div>
        )}

        {result && (
          <div
            className="rounded-2xl border border-border bg-card p-5 space-y-3"
            data-testid={`${slug}-result`}
            aria-live="polite"
          >
            <p className="tabular text-sm">
              {file ? `${fmtBytes(file.size)} → ` : ""}
              {fmtBytes(result.size_bytes)}
              {result.removed !== undefined && ` · ${result.removed} occurrence${result.removed === 1 ? "" : "s"} removed`}
            </p>
            {result.note && <p className="text-sm text-muted-foreground">{result.note}</p>}
            <a
              href={toolDownloadUrl(result.output_id, result.filename)}
              data-testid={`${slug}-download`}
            >
              <Button className="w-full sm:w-auto">Download {result.filename}</Button>
            </a>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
