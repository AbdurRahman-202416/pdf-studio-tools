"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckSquare, FileText, MoreHorizontal, Square, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageThumbnail } from "./PageThumbnail";
import { deleteFile } from "@/services/api";
import { usePDFStore } from "@/store/pdfStore";
import { formatBytes } from "@/lib/utils";
import type { PDFMetadata } from "@/types/pdf";

interface FileCardProps {
  file: PDFMetadata;
}

export function FileCard({ file }: FileCardProps) {
  const removeFile = usePDFStore((s) => s.removeFile);
  const toggleSelect = usePDFStore((s) => s.toggleSelect);
  const selectAllOf = usePDFStore((s) => s.selectAllOf);
  const deselectAllOf = usePDFStore((s) => s.deselectAllOf);
  const selected = usePDFStore((s) => s.selected);

  const selectedSet = new Set(
    selected.filter((s) => s.file_id === file.file_id).map((s) => s.page_index),
  );
  const allSelected = selectedSet.size === file.page_count;

  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await deleteFile(file.file_id);
    } catch {
      // ignore network failure, still remove client-side
    } finally {
      removeFile(file.file_id);
      setRemoving(false);
      setConfirming(false);
      toast.success(`Removed ${file.filename}`);
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card data-testid="file-card" data-file-id={file.file_id}>
        <CardHeader className="flex items-start justify-between gap-3 flex-row">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="truncate font-semibold" title={file.filename}>
                {file.filename}
              </h4>
              <p className="text-xs text-muted-foreground">
                {file.page_count} pages · {formatBytes(file.size_bytes)} · {selectedSet.size} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => (allSelected ? deselectAllOf(file.file_id) : selectAllOf(file.file_id))}
              data-testid="toggle-select-all"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="h-4 w-4" /> Deselect
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" /> Select all
                </>
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${file.filename}`}
              data-testid="remove-file"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(120px,1fr))]"
            data-testid="page-grid"
          >
            {file.pages.map((p) => (
              <PageThumbnail
                key={`${file.file_id}:${p.index}`}
                id={`${file.file_id}:${p.index}`}
                file_id={file.file_id}
                page_index={p.index}
                selected={selectedSet.has(p.index)}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Remove this file?"
        description={`"${file.filename}" will be removed from this workspace and the server. This cannot be undone.`}
        testId="confirm-remove"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={removing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={removing}
              onClick={handleRemove}
              data-testid="confirm-remove-button"
            >
              <MoreHorizontal className="h-4 w-4" /> Yes, remove
            </Button>
          </>
        }
      />
    </motion.div>
  );
}
