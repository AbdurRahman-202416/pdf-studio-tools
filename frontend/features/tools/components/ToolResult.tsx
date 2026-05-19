"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ShareButtons } from "@/components/share/ShareButtons";
import { ResultPreview } from "@/features/tools/components/ResultPreview";
import { formatBytes } from "@/lib/utils";
import { trackEvent } from "@/lib/track";

interface ToolResultProps {
  filename: string;
  size_bytes: number;
  description?: React.ReactNode;
  downloadHref: string;
  output_id?: string;
  onDismiss?: () => void;
  testId?: string;
  tool?: string;
}

export function ToolResult({
  filename,
  size_bytes,
  description,
  downloadHref,
  output_id,
  onDismiss,
  testId,
  tool,
}: ToolResultProps) {
  useEffect(() => {
    if (tool) {
      trackEvent("tool_completed", { tool, size_bytes });
    }
  }, [tool, size_bytes]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
      >
        <Card
          data-testid={testId ?? "tool-result"}
          className="overflow-hidden border-success/40 bg-success/[0.06]"
        >
          <CardContent className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-success/15 text-success shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate text-sm sm:text-base">
                  {filename}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  {formatBytes(size_bytes)}
                  {description && <> · {description}</>}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <a
                  href={downloadHref}
                  download={filename}
                  data-testid={`${testId ?? "tool-result"}-link`}
                >
                  <Button variant="success" className="whitespace-nowrap">
                    <Download className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Download</span>
                  </Button>
                </a>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Dismiss"
                    onClick={onDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {output_id && (
              <ResultPreview output_id={output_id} filename={filename} />
            )}
            <div className="pt-3 border-t border-border/60">
              <ShareButtons text="Just used PDF Studio for a quick PDF task, works great:" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
