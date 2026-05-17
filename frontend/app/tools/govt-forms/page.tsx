"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileSignature, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { ApiError } from "@/services/api";
import {
  getForm,
  listForms,
  renderForm,
  toolDownloadUrl,
  type FormDetail,
  type FormSummary,
  type ToolDownloadable,
} from "@/services/tools-api";
import { cn } from "@/lib/utils";

export default function GovtFormsPage() {
  const [forms, setForms] = useState<FormSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FormDetail | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ToolDownloadable | null>(null);

  useEffect(() => {
    listForms()
      .then(setForms)
      .catch(() => {
        toast.error("Failed to load forms");
        setForms([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    getForm(selectedId)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setValues({});
      })
      .catch(() => !cancelled && toast.error("Form not found"));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleBack = () => {
    setSelectedId(null);
    setDetail(null);
    setValues({});
    setResult(null);
  };

  const handleField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!detail) return;
    const missing = detail.fields.filter((f) => f.required && !(values[f.key] || "").trim());
    if (missing.length) {
      toast.error(`Please fill: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    setBusy(true);
    try {
      const r = await renderForm(detail.id, values);
      setResult(r);
      toast.success("Form generated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to generate form");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Government Forms"
      subtitle="Fill in your details, get a clean printable PDF, no Word, no formatting hassle."
      badge="🇧🇩"
      icon={FileSignature}
      gradient="from-rose-500 via-pink-500 to-purple-500"
    >
      {!detail ? (
        <div className="space-y-4">
          {forms === null && <p className="text-sm text-muted-foreground">Loading forms…</p>}
          {forms !== null && forms.length === 0 && (
            <p className="text-sm text-destructive">No forms available.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {forms?.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedId(f.id)}
                data-testid={`form-${f.id}`}
                className="text-left rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.title_bn}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                    {f.field_count} fields
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            type="button"
            onClick={handleBack}
            data-testid="form-back"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to forms
          </button>

          <Card>
            <CardHeader>
              <CardTitle>
                {detail.title}{" "}
                <span className="font-normal text-sm text-muted-foreground">
                  · {detail.title_bn}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-12">
                {detail.fields.map((field) => (
                  <div
                    key={field.key}
                    className={cn(
                      "flex flex-col gap-1.5",
                      field.width >= 12 ? "sm:col-span-12" : `sm:col-span-${field.width}`,
                    )}
                    style={{ gridColumn: `span ${field.width} / span ${field.width}` }}
                  >
                    <label htmlFor={field.key} className="text-xs uppercase tracking-wider text-muted-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.key}
                        data-testid={`field-${field.key}`}
                        value={values[field.key] || ""}
                        onChange={(e) => handleField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary"
                      />
                    ) : (
                      <input
                        id={field.key}
                        data-testid={`field-${field.key}`}
                        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                        value={values[field.key] || ""}
                        onChange={(e) => handleField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            onClick={handleGenerate}
            isLoading={busy}
            data-testid="form-generate"
          >
            <Wand2 className="h-4 w-4" /> Generate PDF
          </Button>

          {result && (
            <ToolResult
              filename={result.filename}
              size_bytes={result.size_bytes}
              description={detail.title}
              downloadHref={toolDownloadUrl(result.output_id, result.filename)}
              output_id={result.output_id}
              onDismiss={() => setResult(null)}
              testId="form-result"
            />
          )}
        </div>
      )}
    </ToolShell>
  );
}
