"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, TrendingDown, TrendingUp, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ShareButtons } from "@/components/share/ShareButtons";
import { ResultPreview } from "@/features/tools/components/ResultPreview";
import { downloadUrl } from "@/services/api";
import { usePDFStore } from "@/store/pdfStore";
import { cn, formatBytes } from "@/lib/utils";
import { trackEvent } from "@/lib/track";
import { brand } from "@/brand.config";

export function DownloadSection() {
  const result = usePDFStore((s) => s.result);
  const setResult = usePDFStore((s) => s.setResult);

  useEffect(() => {
    if (result) {
      trackEvent("tool_completed", {
        tool: "workspace",
        page_count: result.page_count,
      });
    }
  }, [result]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key={result.output_id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <Card
            data-testid="download-section"
            className="overflow-hidden border-success/40 bg-success/[0.06]"
          >
            <CardContent className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-success/15 text-success shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{result.filename}</h3>
                <p className="text-xs text-muted-foreground">
                  {result.page_count} pages · {formatBytes(result.size_bytes)}
                </p>
                {typeof result.original_size_bytes === "number" &&
                  typeof result.reduction_percent === "number" && (
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        result.reduction_percent > 0
                          ? "bg-success/15 text-success"
                          : result.reduction_percent < 0
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {result.reduction_percent > 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : result.reduction_percent < 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : null}
                      {result.reduction_percent > 0
                        ? `−${result.reduction_percent.toFixed(0)}% smaller`
                        : result.reduction_percent < 0
                          ? `+${Math.abs(result.reduction_percent).toFixed(0)}% larger`
                          : "Same size"}
                      <span className="opacity-70">
                        · from {formatBytes(result.original_size_bytes)}
                      </span>
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={downloadUrl(result.output_id, result.filename)}
                  download={result.filename}
                  data-testid="download-link"
                >
                  <Button variant="success">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Dismiss result"
                  onClick={() => setResult(null)}
                  data-testid="dismiss-result"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              </div>
              <ResultPreview
                output_id={result.output_id}
                filename={result.filename}
              />
              <div className="pt-3 border-t border-border/60">
                <ShareButtons text={`I just used ${brand.name} to process my PDF, works great:`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
