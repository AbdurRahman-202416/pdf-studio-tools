import { API_BASE, ApiError } from "@/services/api";

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
): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("front", front);
  fd.append("back", back);
  fd.append("layout", options.layout ?? "a4_portrait");
  fd.append("add_labels", String(options.add_labels ?? true));
  const res = await fetch(`${API_BASE}/tools/id-card/combine`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
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
): Promise<OcrResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("lang", lang);
  fd.append("force_ocr", String(forceOcr));
  const res = await fetch(`${API_BASE}/tools/ocr/extract`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export interface PdfTableResult extends ToolDownloadable {
  rows: number;
  columns: number;
  sheets: number;
  tables: number;
}

export async function pdfTableToExcel(file: File): Promise<PdfTableResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/tools/pdf-table/to-excel`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export interface ExcelToPdfResult extends ToolDownloadable {
  sheets: number;
  rows: number;
  orientation: "portrait" | "landscape";
}

export async function excelToPdf(file: File): Promise<ExcelToPdfResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/tools/excel/to-pdf`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}


export interface PhotoOptions {
  size?: "passport" | "stamp" | "visa_us" | "custom";
  layout?: "single" | "grid_4" | "grid_8";
  background?: string;
  width_mm?: number;
  height_mm?: number;
}

export async function photoToPdf(file: File, opts: PhotoOptions = {}): Promise<PhotoResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("size", opts.size ?? "passport");
  fd.append("layout", opts.layout ?? "grid_8");
  fd.append("background", opts.background ?? "white");
  if (opts.size === "custom") {
    fd.append("width_mm", String(opts.width_mm ?? 45));
    fd.append("height_mm", String(opts.height_mm ?? 35));
  }
  const res = await fetch(`${API_BASE}/tools/photo/to-pdf`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}


export interface PdfToImagesResult extends ToolDownloadable {
  count: number;
  ext: "zip" | "jpg" | "png";
}

export async function pdfToImages(
  file: File,
  opts: { dpi: number; pages: string; fmt: "jpg" | "png" },
): Promise<PdfToImagesResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("dpi", String(opts.dpi));
  fd.append("pages", opts.pages);
  fd.append("fmt", opts.fmt);
  const res = await fetch(`${API_BASE}/tools/pdf-to-jpg`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export async function lockPdf(file: File, password: string): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password);
  const res = await fetch(`${API_BASE}/tools/pdf/lock`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export async function unlockPdf(file: File, password: string): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password);
  const res = await fetch(`${API_BASE}/tools/pdf/unlock`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
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
): Promise<CompressTargetResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("target", target);
  const res = await fetch(`${API_BASE}/tools/compress/target-size`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

export type QuickCompressLevel = "low" | "medium" | "high";

export interface QuickCompressResult extends ToolDownloadable {
  original_size_bytes: number;
  level: QuickCompressLevel;
}

export async function compressPdfQuick(
  file: File,
  level: QuickCompressLevel = "low",
): Promise<QuickCompressResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("level", level);
  const res = await fetch(`${API_BASE}/tools/compress/quick`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
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
): Promise<ImageToPdfResult> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("page_size", pageSize);
  fd.append("margin_mm", String(marginMm));
  const res = await fetch(`${API_BASE}/tools/jpg-to-pdf`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

// ---------- PDF → Word ---------- //

export interface PdfToWordResult extends ToolDownloadable {
  pages: number;
  characters: number;
  images: number;
}

export async function pdfToWord(file: File): Promise<PdfToWordResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/tools/pdf-to-word`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}

// ---------- Word → PDF ---------- //

export interface WordToPdfResult extends ToolDownloadable {
  blocks: number;
  images: number;
}

export async function wordToPdf(file: File): Promise<WordToPdfResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/tools/word-to-pdf`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
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

export async function signPdf(args: SignPdfArgs): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("file", args.file);
  fd.append("signature", args.signaturePng, "signature.png");
  fd.append("page_index", String(args.pageIndex));
  fd.append("x_pt", String(args.xPt));
  fd.append("y_pt", String(args.yPt));
  fd.append("width_pt", String(args.widthPt));
  fd.append("height_pt", String(args.heightPt));
  const res = await fetch(`${API_BASE}/tools/sign-pdf`, { method: "POST", body: fd });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}


