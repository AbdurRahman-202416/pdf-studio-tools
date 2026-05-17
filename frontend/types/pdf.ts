export interface PageInfo {
  index: number;
  width: number;
  height: number;
}

export interface PDFMetadata {
  file_id: string;
  filename: string;
  size_bytes: number;
  page_count: number;
  pages: PageInfo[];
}

export interface ProcessedFile {
  output_id: string;
  filename: string;
  size_bytes: number;
  original_size_bytes?: number | null;
  reduction_percent?: number | null;
  page_count: number;
}

export type CompressionLevel = "low" | "medium" | "high";

export interface PageSelectorItem {
  file_id: string;
  page_indexes: number[];
}

export interface SelectedPage {
  /** UI id for sortable lists */
  id: string;
  file_id: string;
  page_index: number;
}

export interface UploadingFile {
  localId: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  file_id?: string;
}
