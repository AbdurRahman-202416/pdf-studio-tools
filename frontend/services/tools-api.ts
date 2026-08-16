import { API_BASE, ApiError } from "@/services/api";

/** Default per-request ceiling so a stalled backend can never spin forever. */
export const DEFAULT_UPLOAD_TIMEOUT_MS = 120_000;

export class TimeoutError extends ApiError {
  constructor() {
    super("The request timed out. Please check your connection and try again.", 408);
  }
}

export class CancelledError extends ApiError {
  constructor() {
    super("Cancelled.", 0);
  }
}

export interface UploadOpts {
  /** 0–100 upload progress. */
  onProgress?: (pct: number) => void;
  /** Abort the request (user cancel). */
  signal?: AbortSignal;
  /** Override the default timeout. */
  timeoutMs?: number;
}

/**
 * Shared uploader for every server tool. Uses XHR (not fetch) so we get real
 * upload progress, native abort, and a hard timeout — the three things bare
 * `fetch` could not provide, which is why a stalled tool used to spin forever
 * with no cancel and no progress. Returns the parsed JSON response.
 */
export function uploadForm<T>(path: string, fd: FormData, opts: UploadOpts = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${path}`);
    xhr.responseType = "json";
    xhr.timeout = opts.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.ontimeout = () => reject(new TimeoutError());
    xhr.onerror = () => reject(new ApiError("Network error — check your connection and try again.", 0));
    xhr.onabort = () => reject(new CancelledError());
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as T);
      } else {
        const detail = (xhr.response && (xhr.response as { detail?: string }).detail) || xhr.statusText;
        reject(new ApiError(detail || "Request failed", xhr.status));
      }
    };

    if (opts.signal) {
      if (opts.signal.aborted) {
        xhr.abort();
        return;
      }
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(fd);
  });
}

export interface ToolDownloadable {
  output_id: string;
  filename: string;
  size_bytes: number;
}

export interface IdCardCombineOptions {
  layout?: "a4_portrait" | "a4_horizontal" | "compact";
  add_labels?: boolean;
}


export interface OcrPage {
  index: number;
  text: string;
  method: "text" | "ocr";
}

export interface OcrResult {
  file_id: string;
  filename: string;
  pages: OcrPage[];
  text: string;
  language: string;
  page_count: number;
  method_summary: { text?: number; ocr?: number };
}

export interface OcrStatus {
  available: boolean;
  languages: string[];
}

export interface BankResult extends ToolDownloadable {
  rows: number;
  columns: number;
}

export interface PhotoInfo {
  width_mm: number;
  height_mm: number;
  copies: number;
  layout: string;
  size: string;
}

export interface PhotoResult extends ToolDownloadable {
  info: PhotoInfo;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.detail || res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

export function toolDownloadUrl(output_id: string, name: string): string {
  return `${API_BASE}/tools/download/${output_id}?name=${encodeURIComponent(name)}`;
}

export async function idCardCombine(
  front: File,
  back: File,
  options: IdCardCombineOptions = {},
 net: UploadOpts = {}): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("front", front);
  fd.append("back", back);
  fd.append("layout", options.layout ?? "a4_portrait");
  fd.append("add_labels", String(options.add_labels ?? true));
  return uploadForm<ToolDownloadable>("/tools/id-card/combine", fd, net);
}


export async function getOcrStatus(): Promise<OcrStatus> {
  const res = await fetch(`${API_BASE}/tools/ocr/status`);
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export async function extractOCR(
  file: File,
  lang: string = "eng+ben",
  forceOcr = false,
 net: UploadOpts = {}): Promise<OcrResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("lang", lang);
  fd.append("force_ocr", String(forceOcr));
  return uploadForm<OcrResult>("/tools/ocr/extract", fd, net);
}

export interface PdfTableResult extends ToolDownloadable {
  rows: number;
  columns: number;
  sheets: number;
  tables: number;
}

export async function pdfTableToExcel(file: File, net: UploadOpts = {}): Promise<PdfTableResult> {
  const fd = new FormData();
  fd.append("file", file);
  return uploadForm<PdfTableResult>("/tools/pdf-table/to-excel", fd, net);
}

export interface ExcelToPdfResult extends ToolDownloadable {
  sheets: number;
  rows: number;
  orientation: "portrait" | "landscape";
}

export async function excelToPdf(file: File, net: UploadOpts = {}): Promise<ExcelToPdfResult> {
  const fd = new FormData();
  fd.append("file", file);
  return uploadForm<ExcelToPdfResult>("/tools/excel/to-pdf", fd, net);
}


export interface PhotoOptions {
  size?: "passport" | "stamp" | "visa_us" | "custom";
  layout?: "single" | "grid_4" | "grid_8";
  background?: string;
  width_mm?: number;
  height_mm?: number;
}

export async function photoToPdf(file: File, opts: PhotoOptions = {}, net: UploadOpts = {}): Promise<PhotoResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("size", opts.size ?? "passport");
  fd.append("layout", opts.layout ?? "grid_8");
  fd.append("background", opts.background ?? "white");
  if (opts.size === "custom") {
    fd.append("width_mm", String(opts.width_mm ?? 45));
    fd.append("height_mm", String(opts.height_mm ?? 35));
  }
  return uploadForm<PhotoResult>("/tools/photo/to-pdf", fd, net);
}


export interface PdfToImagesResult extends ToolDownloadable {
  count: number;
  ext: "zip" | "jpg" | "png";
}

export async function pdfToImages(
  file: File,
  opts: { dpi: number; pages: string; fmt: "jpg" | "png" },
 net: UploadOpts = {}): Promise<PdfToImagesResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("dpi", String(opts.dpi));
  fd.append("pages", opts.pages);
  fd.append("fmt", opts.fmt);
  return uploadForm<PdfToImagesResult>("/tools/pdf-to-jpg", fd, net);
}

export async function lockPdf(file: File, password: string, net: UploadOpts = {}): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password);
  return uploadForm<ToolDownloadable>("/tools/pdf/lock", fd, net);
}

export async function unlockPdf(file: File, password: string, net: UploadOpts = {}): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password);
  return uploadForm<ToolDownloadable>("/tools/pdf/unlock", fd, net);
}

// ---------- Target-size compression (compress to 100KB) ---------- //

export type CompressTargetKey =
  | "50kb"
  | "100kb"
  | "200kb"
  | "500kb"
  | "1mb"
  | "2mb"
  | "5mb"
  | "10mb"
  | "16mb";

export interface CompressTargetResult extends ToolDownloadable {
  original_size_bytes: number;
  target: CompressTargetKey;
  target_bytes: number;
  final_bytes: number;
  dpi: number;
  jpeg_quality: number;
  iterations: number;
  reached_target: boolean;
}

export async function compressPdfToTarget(
  file: File,
  target: CompressTargetKey,
 net: UploadOpts = {}): Promise<CompressTargetResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("target", target);
  return uploadForm<CompressTargetResult>("/tools/compress/target-size", fd, net);
}

export type QuickCompressLevel = "low" | "medium" | "high";

export interface QuickCompressResult extends ToolDownloadable {
  original_size_bytes: number;
  level: QuickCompressLevel;
}

export async function compressPdfQuick(
  file: File,
  level: QuickCompressLevel = "low",
 net: UploadOpts = {}): Promise<QuickCompressResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("level", level);
  return uploadForm<QuickCompressResult>("/tools/compress/quick", fd, net);
}

// ---------- JPG / PNG / WebP → PDF ---------- //

export type ImageToPdfPageSize =
  | "a4_portrait"
  | "a4_landscape"
  | "letter_portrait"
  | "letter_landscape"
  | "fit_image";

export interface ImageToPdfResult extends ToolDownloadable {
  pages: number;
  page_size: ImageToPdfPageSize;
}

export async function imagesToPdf(
  files: File[],
  pageSize: ImageToPdfPageSize = "a4_portrait",
  marginMm = 10,
 net: UploadOpts = {}): Promise<ImageToPdfResult> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("page_size", pageSize);
  fd.append("margin_mm", String(marginMm));
  return uploadForm<ImageToPdfResult>("/tools/jpg-to-pdf", fd, net);
}

// ---------- PDF → Word ---------- //

export interface PdfToWordResult extends ToolDownloadable {
  pages: number;
  characters: number;
  images: number;
}

export async function pdfToWord(file: File, net: UploadOpts = {}): Promise<PdfToWordResult> {
  const fd = new FormData();
  fd.append("file", file);
  return uploadForm<PdfToWordResult>("/tools/pdf-to-word", fd, net);
}

// ---------- Word → PDF ---------- //

export interface WordToPdfResult extends ToolDownloadable {
  blocks: number;
  images: number;
}

export async function wordToPdf(file: File, net: UploadOpts = {}): Promise<WordToPdfResult> {
  const fd = new FormData();
  fd.append("file", file);
  return uploadForm<WordToPdfResult>("/tools/word-to-pdf", fd, net);
}

// ---------- Sign PDF ---------- //

export interface SignPdfArgs {
  file: File;
  signaturePng: Blob;
  pageIndex: number;
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
}

export async function signPdf(args: SignPdfArgs, net: UploadOpts = {}): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("file", args.file);
  fd.append("signature", args.signaturePng, "signature.png");
  fd.append("page_index", String(args.pageIndex));
  fd.append("x_pt", String(args.xPt));
  fd.append("y_pt", String(args.yPt));
  fd.append("width_pt", String(args.widthPt));
  fd.append("height_pt", String(args.heightPt));
  return uploadForm<ToolDownloadable>("/tools/sign-pdf", fd, net);
}

// ---------- Split / Rotate / Delete pages ---------- //

export interface PdfSplitResult extends ToolDownloadable {
  pages: number;
  ext: "pdf" | "zip";
}

export async function splitPdf(
  file: File,
  pages: string,
  mode: "extract" | "each" = "extract",
 net: UploadOpts = {}): Promise<PdfSplitResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("pages", pages);
  fd.append("mode", mode);
  return uploadForm<PdfSplitResult>("/tools/pdf/split", fd, net);
}

export interface PdfRotateResult extends ToolDownloadable {
  rotated: number;
}

export async function rotatePdf(
  file: File,
  angle: 90 | 180 | 270,
  pages: string = "all",
 net: UploadOpts = {}): Promise<PdfRotateResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("angle", String(angle));
  fd.append("pages", pages);
  return uploadForm<PdfRotateResult>("/tools/pdf/rotate", fd, net);
}

export interface PdfDeletePagesResult extends ToolDownloadable {
  removed: number;
  remaining: number;
}

export async function deletePdfPages(file: File, pages: string, net: UploadOpts = {}): Promise<PdfDeletePagesResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("pages", pages);
  return uploadForm<PdfDeletePagesResult>("/tools/pdf/delete-pages", fd, net);
}
