"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { toast } from "sonner";
import { Layers, Merge, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageThumbnail } from "./PageThumbnail";
import { usePDFStore } from "@/store/pdfStore";
import { mergePDFs, ApiError } from "@/services/api";
import type { PageSelectorItem } from "@/types/pdf";

export function SelectedPagesPanel() {
  const selected = usePDFStore((s) => s.selected);
  const setOrder = usePDFStore((s) => s.setSelectionOrder);
  const toggle = usePDFStore((s) => s.toggleSelect);
  const clearSelection = usePDFStore((s) => s.clearSelection);
  const files = usePDFStore((s) => s.files);
  const setResult = usePDFStore((s) => s.setResult);

  const [merging, setMerging] = useState(false);
  const [resetting, setResetting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.findIndex((s) => s.id === active.id);
    const newIndex = selected.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setOrder(arrayMove(selected, oldIndex, newIndex));
  };

  const handleMerge = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one page to merge");
      return;
    }
    setMerging(true);
    try {
      // group selected pages by file_id, preserving the order
      const byFile = new Map<string, number[]>();
      const order: string[] = [];
      for (const item of selected) {
        if (!byFile.has(item.file_id)) {
          byFile.set(item.file_id, []);
          order.push(item.file_id);
        }
        byFile.get(item.file_id)!.push(item.page_index);
      }
      const items: PageSelectorItem[] = order.map((fid) => ({
        file_id: fid,
        page_indexes: byFile.get(fid)!,
      }));
      const result = await mergePDFs(items, "merged.pdf");
      setResult(result, "merge");
      toast.success(`Merged into ${result.filename} (${result.page_count} pages)`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Merge failed";
      toast.error(message);
    } finally {
      setMerging(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <>
      <Card data-testid="selected-panel">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Selection order</CardTitle>
              <p className="text-xs text-muted-foreground">
                {selected.length} page{selected.length === 1 ? "" : "s"} · drag to reorder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetting(true)}
              disabled={selected.length === 0}
              data-testid="reset-selection"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleMerge}
              isLoading={merging}
              data-testid="merge-button"
            >
              <Merge className="h-4 w-4" /> Merge selected
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Select pages from any file above to begin merging or compressing.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext items={selected.map((s) => s.id)} strategy={rectSortingStrategy}>
                <div
                  className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(120px,1fr))]"
                  data-testid="selected-grid"
                >
                  {selected.map((item, idx) => (
                    <PageThumbnail
                      key={item.id}
                      id={item.id}
                      file_id={item.file_id}
                      page_index={item.page_index}
                      selected
                      orderIndex={idx}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Modal
        open={resetting}
        onClose={() => setResetting(false)}
        title="Reset selection?"
        description="This will clear the current page selection across all files."
        testId="confirm-reset"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-testid="confirm-reset-button"
              onClick={() => {
                clearSelection();
                setResetting(false);
                toast.success("Selection cleared");
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </>
  );
}
