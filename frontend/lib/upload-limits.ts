import type { Accept } from "react-dropzone";
import { formatBytes } from "@/lib/utils";

/**
 * Single source of truth for the client upload size cap. Mirrors the backend's
 * MAX_UPLOAD_MB (100 MB) so the browser rejects an over-size file before wasting
 * the upload, and the two limits can't silently drift.
 */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/** Human label for the accepted types, derived from a react-dropzone `accept`. */
export function describeAccept(accept?: Accept): string {
  if (!accept) return "this file type";
  const exts = Object.values(accept)
    .flat()
    .map((e) => e.replace(/^\./, "").toUpperCase());
  if (exts.length === 0) return "this file type";
  if (exts.length === 1) return `${exts[0]} files`;
  return `${exts.slice(0, -1).join(", ")} or ${exts[exts.length - 1]} files`;
}

/**
 * Turn a react-dropzone rejection error code into a clear, non-technical
 * message. Kept here so every drop surface phrases rejections the same way.
 */
export function rejectionMessage(
  code: string | undefined,
  opts: { accept?: Accept; maxSize?: number } = {},
): string {
  const maxSize = opts.maxSize ?? MAX_UPLOAD_BYTES;
  switch (code) {
    case "file-too-large":
      return `File is too large. The limit is ${formatBytes(maxSize)}.`;
    case "file-invalid-type":
      return `Unsupported file type — please use ${describeAccept(opts.accept)}.`;
    case "too-many-files":
      return "Please add one file at a time.";
    case "file-too-small":
      return "That file is empty.";
    default:
      return "That file couldn't be added.";
  }
}
