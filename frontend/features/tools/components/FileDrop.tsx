"use client";

import { useCallback } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Image as ImageIcon, UploadCloud, X } from "lucide-react";

import { cn, formatBytes } from "@/lib/utils";
import { MAX_UPLOAD_BYTES, rejectionMessage } from "@/lib/upload-limits";

interface FileDropProps {
  label: string;
  accept?: Accept;
  file: File | null;
  onChange: (file: File | null) => void;
  preview?: string | null;
  hint?: string;
  testId?: string;
  className?: string;
  /** Max file size in bytes. Defaults to the shared 100 MB cap. */
  maxSize?: number;
}

export function FileDrop({
  label,
  accept,
  file,
  onChange,
  preview,
  hint,
  testId,
  className,
  maxSize = MAX_UPLOAD_BYTES,
}: FileDropProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (!f) return;
      // react-dropzone doesn't flag empty files; a 0-byte upload just fails
      // server-side with a confusing error, so reject it here with a clear one.
      if (f.size === 0) {
        toast.error("That file is empty.");
        return;
      }
      onChange(f);
    },
    [onChange],
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      // Surface the first, most relevant reason. Without this the UI silently
      // swallowed wrong-type / oversize drops and looked broken.
      const code = rejections[0]?.errors[0]?.code;
      toast.error(rejectionMessage(code, { accept, maxSize }));
    },
    [accept, maxSize],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    multiple: false,
    noClick: true,
    maxSize,
    onDrop,
    onDropRejected,
  });

  return (
    <div
      {...getRootProps({
        className: cn(
          "group relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
          "border-border bg-card hover:border-primary/40",
          isDragActive && "border-primary bg-primary/5",
          className,
        ),
      })}
      data-testid={testId}
      onClick={open}
    >
      <input
        {...getInputProps({ "aria-label": label })}
        data-testid={`${testId}-input`}
      />
      <div className="relative aspect-[4/3] flex items-center justify-center text-center p-6">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="absolute inset-0 h-full w-full object-contain bg-muted/40"
          />
        ) : (
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ scale: isDragActive ? 1.05 : 1 }}
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              {accept?.["image/*"] ? <ImageIcon className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
            </div>
            <p className="font-semibold text-sm">{label}</p>
            {hint && <p className="text-xs text-muted-foreground max-w-xs">{hint}</p>}
          </motion.div>
        )}

        {file && (
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-card/95 text-foreground shadow border border-border hover:bg-destructive hover:text-destructive-foreground transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {file && (
        <div className="border-t border-border px-3 py-2 text-xs flex items-center justify-between gap-2 bg-muted/40">
          <span className="truncate font-medium">{file.name}</span>
          <span className="text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
        </div>
      )}
    </div>
  );
}
