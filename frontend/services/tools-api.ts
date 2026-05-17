import { API_BASE, ApiError } from "@/services/api";

export interface ToolDownloadable {
  output_id: string;
  filename: string;
  size_bytes: number;
}

export interface NidCombineOptions {
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

export interface FormFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "number";
  required: boolean;
  placeholder: string;
  width: number;
}

export interface FormSummary {
  id: string;
  title: string;
  title_bn: string;
  description: string;
  icon: string;
  field_count: number;
}

export interface FormDetail {
  id: string;
  title: string;
  title_bn: string;
  description: string;
  icon: string;
  fields: FormFieldDef[];
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

export async function combineNID(
  front: File,
  back: File,
  options: NidCombineOptions = {},
): Promise<ToolDownloadable> {
  const fd = new FormData();
  fd.append("front", front);
  fd.append("back", back);
  fd.append("layout", options.layout ?? "a4_portrait");
  fd.append("add_labels", String(options.add_labels ?? true));
  const res = await fetch(`${API_BASE}/tools/nid/combine`, { method: "POST", body: fd });
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
  lang: "ben" | "eng" | "ben+eng" = "ben+eng",
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

export async function convertBankStatement(file: File): Promise<BankResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/tools/bank/to-excel`, { method: "POST", body: fd });
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

export async function listForms(): Promise<FormSummary[]> {
  const res = await fetch(`${API_BASE}/tools/forms`);
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  const data = await res.json();
  return data.forms;
}

export async function getForm(formId: string): Promise<FormDetail> {
  const res = await fetch(`${API_BASE}/tools/forms/${formId}`);
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

export async function renderForm(formId: string, values: Record<string, string>): Promise<ToolDownloadable> {
  const res = await fetch(`${API_BASE}/tools/forms/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form_id: formId, values }),
  });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json();
}
