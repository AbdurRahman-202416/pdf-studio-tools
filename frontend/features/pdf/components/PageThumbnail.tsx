"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { thumbnailUrl } from "@/services/api";

interface PageThumbnailProps {
  id: string;
  file_id: string;
  page_index: number;
  selected: boolean;
  orderIndex?: number;
  onToggle: (file_id: string, page_index: number) => void;
}

export function PageThumbnail({
  id,
  file_id,
  page_index,
  selected,
  orderIndex,
  onToggle,
}: PageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all",
        selected ? "border-primary shadow-md ring-2 ring-primary/40" : "border-border hover:border-primary/50",
        isDragging && "opacity-70 scale-[1.02] shadow-xl",
      )}
      data-testid="page-thumb"
      data-page-index={page_index}
      data-file-id={file_id}
    >
      <button
        type="button"
        onClick={() => onToggle(file_id, page_index)}
        className="block w-full text-left"
        aria-pressed={selected}
        aria-label={`Page ${page_index + 1}`}
      >
        <div className="relative aspect-[3/4] bg-muted">
          {!error ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl(file_id, page_index, 240)}
              alt={`Page ${page_index + 1}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={cn(
                "h-full w-full object-contain transition-opacity duration-300",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Preview failed
            </div>
          )}
          {!loaded && !error && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/40" />
          )}
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">Page {page_index + 1}</span>
          {selected && orderIndex !== undefined && (
            <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0.5 font-medium">
              #{orderIndex + 1}
            </span>
          )}
        </div>
      </button>

      <div
        className={cn(
          "pointer-events-none absolute top-2 left-2 grid h-5 w-5 place-items-center rounded-full border transition",
          selected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card/80 border-border opacity-0 group-hover:opacity-100",
        )}
        aria-hidden
      >
        <Check className="h-3 w-3" />
      </div>

      <button
        {...attributes}
        {...listeners}
        aria-label="Drag handle"
        className={cn(
          "absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-md bg-card/90 text-muted-foreground border border-border opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing",
          selected && "opacity-100",
        )}
        data-testid="drag-handle"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
