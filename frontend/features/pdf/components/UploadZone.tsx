"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CloudUpload, FileWarning, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { ApiError, uploadPDF } from "@/services/api";
import { usePDFStore } from "@/store/pdfStore";
import { cn, formatBytes } from "@/lib/utils";
import type { UploadingFile } from "@/types/pdf";

const MAX_BYTES = 100 * 1024 * 1024;

export function UploadZone() {
  const addFile = usePDFStore((s) => s.addFile);
  const [items, setItems] = useState<UploadingFile[]>([]);

  const updateItem = useCallback((id: string, patch: Partial<UploadingFile>) => {
    setItems((prev) => prev.map((it) => (it.localId === id ? { ...it, ...patch } : it)));
  }, []);

  const handleFiles = useCallback(
    async (accepted: File[]) => {
      const valid = accepted.filter((f) => {
        if (f.type && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
          toast.error(`${f.name}: only PDF files are allowed`);
          return false;
        }
        if (f.size > MAX_BYTES) {
          toast.error(`${f.name}: file exceeds ${formatBytes(MAX_BYTES)}`);
          return false;
        }
        return true;
      });

      const created: UploadingFile[] = valid.map((f) => ({
        localId: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        progress: 0,
        status: "uploading",
      }));
      setItems((prev) => [...created, ...prev]);

      await Promise.all(
        valid.map((file, i) => {
          const id = created[i].localId;
          return uploadPDF(file, {
            onProgress: (pct) => updateItem(id, { progress: pct }),
          })
            .then((meta) => {
              updateItem(id, { progress: 100, status: "done", file_id: meta.file_id });
              addFile(meta);
              toast.success(`Uploaded ${meta.filename}`);
            })
            .catch((err: ApiError) => {
              updateItem(id, { status: "error", error: err.message });
              toast.error(`Upload failed: ${err.message}`);
            });
        }),
      );
    },
    [addFile, updateItem],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: handleFiles,
    onDropRejected: (rejected) => {
      for (const r of rejected) {
        toast.error(`${r.file.name}: only PDF files are allowed`);
      }
    },
  });

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.localId !== id));

  return (
    <div className="space-y-4">
      <div
        {...getRootProps({
          className: cn(
            "group relative flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed transition-all duration-300 px-6 py-14 cursor-pointer",
            "border-border bg-gradient-to-br from-card to-muted/40",
            isDragActive && "border-primary bg-primary/5 scale-[1.01]",
          ),
        })}
        data-testid="upload-zone"
        role="button"
        tabIndex={0}
        aria-label="Drag & drop PDFs or click to browse"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
      >
        <input
          {...getInputProps({ "aria-label": "Upload PDF files" })}
          data-testid="upload-input"
        />
        <motion.div
          animate={{ y: isDragActive ? -4 : 0, scale: isDragActive ? 1.05 : 1 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <CloudUpload className="h-8 w-8" />
        </motion.div>
        <h2 className="mt-4 text-lg font-semibold">
          {isDragActive ? "Drop the PDFs here" : "Drag & drop PDFs"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          Or click to browse. Multiple files supported · Max {formatBytes(MAX_BYTES)} each.
          We never share or store your files beyond processing.
        </p>
        <Button
          type="button"
          variant="primary"
          className="mt-5"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          data-testid="browse-files"
        >
          Browse files
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {items.length > 0 && (
          <motion.ul
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
            data-testid="upload-list"
          >
            {items.map((it) => (
              <motion.li
                key={it.localId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                  {it.status === "error" ? (
                    <FileWarning className="h-5 w-5 text-destructive" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium" title={it.name}>{it.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(it.size)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={it.progress}
                      indeterminate={it.status === "uploading" && it.progress >= 100}
                      className="flex-1"
                    />
                    <span
                      className={cn(
                        "text-xs w-16 text-right",
                        it.status === "done" && "text-success",
                        it.status === "error" && "text-destructive",
                      )}
                    >
                      {it.status === "done"
                        ? "Done"
                        : it.status === "error"
                          ? "Failed"
                          : `${it.progress}%`}
                    </span>
                  </div>
                  {it.status === "error" && it.error && (
                    <p className="mt-1 text-xs text-destructive">{it.error}</p>
                  )}
                </div>
                <button
                  aria-label={`Dismiss ${it.name}`}
                  onClick={() => removeItem(it.localId)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
