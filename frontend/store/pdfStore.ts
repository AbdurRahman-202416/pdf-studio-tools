"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  CompressionLevel,
  PDFMetadata,
  ProcessedFile,
  SelectedPage,
} from "@/types/pdf";

export interface RecentEntry {
  output_id: string;
  filename: string;
  size_bytes: number;
  page_count: number;
  type: "merge" | "compress" | "rotate" | "split";
  created_at: number;
}

interface PDFState {
  files: PDFMetadata[];
  selected: SelectedPage[]; // ordered list across files
  compression: CompressionLevel;
  result: ProcessedFile | null;
  recent: RecentEntry[];

  addFile: (file: PDFMetadata) => void;
  removeFile: (file_id: string) => void;
  clearFiles: () => void;

  toggleSelect: (file_id: string, page_index: number) => void;
  selectAllOf: (file_id: string) => void;
  deselectAllOf: (file_id: string) => void;
  clearSelection: () => void;
  setSelectionOrder: (next: SelectedPage[]) => void;
  isSelected: (file_id: string, page_index: number) => boolean;

  setCompression: (level: CompressionLevel) => void;
  setResult: (result: ProcessedFile | null, type?: RecentEntry["type"]) => void;
  removeRecent: (output_id: string) => void;
}

const pageKey = (file_id: string, page_index: number) => `${file_id}:${page_index}`;

export const usePDFStore = create<PDFState>()(
  persist(
    (set, get) => ({
      files: [],
      selected: [],
      compression: "medium",
      result: null,
      recent: [],

      addFile: (file) =>
        set((state) => {
          if (state.files.some((f) => f.file_id === file.file_id)) return state;
          // auto-select all pages by default for new files
          const newSel = file.pages.map((p) => ({
            id: pageKey(file.file_id, p.index),
            file_id: file.file_id,
            page_index: p.index,
          }));
          return {
            files: [...state.files, file],
            selected: [...state.selected, ...newSel],
          };
        }),

      removeFile: (file_id) =>
        set((state) => ({
          files: state.files.filter((f) => f.file_id !== file_id),
          selected: state.selected.filter((s) => s.file_id !== file_id),
        })),

      clearFiles: () => set({ files: [], selected: [], result: null }),

      toggleSelect: (file_id, page_index) =>
        set((state) => {
          const key = pageKey(file_id, page_index);
          const exists = state.selected.some((s) => s.id === key);
          if (exists) {
            return { selected: state.selected.filter((s) => s.id !== key) };
          }
          return {
            selected: [...state.selected, { id: key, file_id, page_index }],
          };
        }),

      selectAllOf: (file_id) =>
        set((state) => {
          const file = state.files.find((f) => f.file_id === file_id);
          if (!file) return state;
          const existing = new Set(state.selected.map((s) => s.id));
          const additions = file.pages
            .map((p) => ({
              id: pageKey(file_id, p.index),
              file_id,
              page_index: p.index,
            }))
            .filter((p) => !existing.has(p.id));
          return { selected: [...state.selected, ...additions] };
        }),

      deselectAllOf: (file_id) =>
        set((state) => ({
          selected: state.selected.filter((s) => s.file_id !== file_id),
        })),

      clearSelection: () => set({ selected: [] }),

      setSelectionOrder: (next) => set({ selected: next }),

      isSelected: (file_id, page_index) =>
        get().selected.some((s) => s.id === pageKey(file_id, page_index)),

      setCompression: (level) => set({ compression: level }),

      setResult: (result, type = "merge") =>
        set((state) => {
          if (!result) return { result: null };
          const entry: RecentEntry = {
            output_id: result.output_id,
            filename: result.filename,
            size_bytes: result.size_bytes,
            page_count: result.page_count,
            type,
            created_at: Date.now(),
          };
          const recent = [entry, ...state.recent.filter((r) => r.output_id !== result.output_id)].slice(0, 12);
          return { result, recent };
        }),

      removeRecent: (output_id) =>
        set((state) => ({ recent: state.recent.filter((r) => r.output_id !== output_id) })),
    }),
    {
      name: "pdf-tool-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({ compression: state.compression, recent: state.recent }),
    },
  ),
);
