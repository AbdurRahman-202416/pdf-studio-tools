"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { UploadZone } from "./UploadZone";
import { FileCard } from "./FileCard";
import { SelectedPagesPanel } from "./SelectedPagesPanel";
import { CompressionPanel } from "./CompressionPanel";
import { DownloadSection } from "./DownloadSection";
import { usePDFStore } from "@/store/pdfStore";

export function WorkspaceShell() {
  const files = usePDFStore((s) => s.files);
  const clearFiles = usePDFStore((s) => s.clearFiles);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="gradient-text">Workspace</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDFs, pick pages, reorder, then merge or compress.
          </p>
        </div>
        {files.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setResetOpen(true)} data-testid="reset-project">
            <RotateCcw className="h-4 w-4" /> Reset workspace
          </Button>
        )}
      </div>

      <UploadZone />

      <DownloadSection />

      {files.length > 0 ? (
        <>
          <SelectedPagesPanel />
          <CompressionPanel />
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {files.map((f) => (
              <FileCard key={f.file_id} file={f} />
            ))}
          </motion.div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center" data-testid="empty-state">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-lg font-semibold">No files yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Drop a PDF above to start. Selected pages will appear in a sortable strip
            and you can compress any uploaded file independently.
          </p>
        </div>
      )}

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset workspace?"
        description="All uploaded files and selections will be cleared from this session."
        testId="confirm-reset-workspace"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-testid="confirm-reset-workspace-button"
              onClick={() => {
                clearFiles();
                setResetOpen(false);
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </div>
  );
}
