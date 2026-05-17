"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  ImageOff,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { API_BASE } from "@/services/api";

interface ResultPreviewProps {
  output_id: string;
  filename: string;
}

type Preview =
  | { kind: "image"; url: string; pageCount: number }
  | { kind: "table"; columns: string[]; rows: string[][]; totalRows: number };

export function ResultPreview({ output_id, filename }: ResultPreviewProps) {
  const [page, setPage] = useState(0);
  const requestedKey = `${output_id}:${page}`;
  const [fetchedKey, setFetchedKey] = useState(requestedKey);
  const [data, setData] = useState<Preview | null>(null);
  const [error, setError] = useState(false);

  // Reset state during render when the request changes (React 19 pattern).
  if (fetchedKey !== requestedKey) {
    setFetchedKey(requestedKey);
    setData(null);
    setError(false);
  }

  const loading = data === null && !error;

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    fetch(`${API_BASE}/tools/preview/${output_id}?page=${page}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("preview unavailable");
        const ct = res.headers.get("content-type") || "";

        if (ct.startsWith("image/")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          createdUrl = url;
          const pages =
            parseInt(res.headers.get("x-page-count") || "1", 10) || 1;
          if (!cancelled) setData({ kind: "image", url, pageCount: pages });
        } else if (ct.includes("json")) {
          const j = (await res.json()) as {
            columns?: string[];
            rows?: string[][];
            total_rows?: number;
          };
          if (!cancelled) {
            setData({
              kind: "table",
              columns: j.columns ?? [],
              rows: j.rows ?? [],
              totalRows: j.total_rows ?? (j.rows?.length ?? 0),
            });
          }
        } else {
          throw new Error(`unsupported content-type: ${ct}`);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [output_id, page]);

  if (loading) {
    return (
      <div
        className="flex min-h-[240px] w-full min-w-0 items-center justify-center rounded-2xl border border-border bg-card/40"
        aria-label="Loading preview"
      >
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[120px] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/30 px-4 py-6 text-center">
        <ImageOff className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Preview unavailable for{" "}
          <span className="font-medium">{filename}</span>. You can still
          download it below.
        </p>
      </div>
    );
  }

  if (data.kind === "image") {
    return (
      <div className="w-full min-w-0 space-y-3">
        <div className="preview-scroll w-full min-w-0 overflow-auto rounded-2xl border border-border bg-muted/30 p-2 sm:p-4 max-h-[55vh] sm:max-h-[60vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.url}
            alt={`Preview of ${filename}`}
            className="mx-auto block h-auto w-auto max-w-full rounded-md shadow-sm"
          />
        </div>
        {data.pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="tabular-nums text-muted-foreground">
              Page {page + 1} / {data.pageCount}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(data.pageCount - 1, p + 1))
              }
              disabled={page >= data.pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border bg-muted/40 px-3 py-2 text-[11px] sm:text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
        <span>
          First {data.rows.length} of {data.totalRows} rows
        </span>
        <span className="opacity-60">·</span>
        <span>{data.columns.length} columns</span>
        <span className="ml-auto hidden sm:inline opacity-70">scroll →</span>
      </div>
      <div className="preview-scroll w-full min-w-0 max-h-[45vh] sm:max-h-[55vh] overflow-auto">
        <table className="w-max min-w-full border-collapse text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
            <tr>
              {data.columns.map((c, i) => (
                <th
                  key={i}
                  className="border-b border-border px-2.5 py-1.5 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                >
                  {c || `Col ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 ? "bg-muted/10" : ""}>
                {data.columns.map((_, ci) => {
                  const value = row[ci] ?? "";
                  return (
                    <td
                      key={ci}
                      className="max-w-[180px] sm:max-w-[220px] truncate whitespace-nowrap px-2.5 py-1.5 align-middle leading-tight"
                      title={value}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
