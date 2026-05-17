import type {
  CompressionLevel,
  PDFMetadata,
  PageSelectorItem,
  ProcessedFile,
} from "@/types/pdf";

export const API_BASE: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.detail || res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

export function thumbnailUrl(file_id: string, page_index: number, width = 220): string {
  return `${API_BASE}/files/${file_id}/thumbnail/${page_index}?w=${width}`;
}

export function downloadUrl(output_id: string, name: string): string {
  return `${API_BASE}/download/${output_id}?name=${encodeURIComponent(name)}`;
}

export interface UploadOptions {
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

export function uploadPDF(file: File, opts: UploadOptions = {}): Promise<PDFMetadata> {
  return new Promise<PDFMetadata>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onerror = () => reject(new ApiError("Network error", 0));
    xhr.onabort = () => reject(new ApiError("Upload cancelled", 0));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = xhr.response as { file: PDFMetadata };
        resolve(data.file);
      } else {
        const detail = (xhr.response && xhr.response.detail) || xhr.statusText;
        reject(new ApiError(detail || "Upload failed", xhr.status));
      }
    };

    if (opts.signal) {
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

export async function deleteFile(file_id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/${file_id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
}

export async function mergePDFs(items: PageSelectorItem[], filename = "merged.pdf"): Promise<ProcessedFile> {
  const res = await fetch(`${API_BASE}/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, filename }),
  });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export async function compressPDF(
  file_id: string,
  level: CompressionLevel,
  filename?: string,
): Promise<ProcessedFile> {
  const res = await fetch(`${API_BASE}/compress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id, level, filename }),
  });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

