"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Eraser, PenTool, Upload, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  signPdf,
  toolDownloadUrl,
  type ToolDownloadable,
} from "@/services/tools-api";
import { ApiError, thumbnailUrl, uploadPDF } from "@/services/api";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";
import type { PDFMetadata } from "@/types/pdf";

type DragMode = "move" | "resize" | null;

/**
 * Two-step UX:
 *
 *   1. Upload PDF → server returns metadata + per-page sizes in PDF points.
 *      We render the selected page as a thumbnail.
 *   2. Draw a signature → it becomes a draggable overlay positioned in
 *      preview pixels. User drags + resizes to taste, then we convert
 *      pixel coordinates → PDF points using the page's known width and
 *      ship the bytes to the backend to stamp.
 */
export function SignPdfView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  // Mirror `hasInk` so endDraw can read the current value synchronously -
  // pointer events fire too fast for React to commit between move/up.
  const inkRef = useRef(false);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startBox: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMeta, setPdfMeta] = useState<PDFMetadata | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const [hasInk, setHasInk] = useState(false);
  const [sigDataUrl, setSigDataUrl] = useState<string | null>(null);

  // Signature overlay in preview pixels.
  const [sigBox, setSigBox] = useState({ x: 60, y: 60, w: 200, h: 70 });
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ToolDownloadable | null>(null);

  // ---------- PDF upload ----------

  const onPickPdf = useCallback(async (f: File | null) => {
    setResult(null);
    setPdfFile(f);
    setPdfMeta(null);
    setPageIndex(0);
    if (!f) return;
    setUploading(true);
    try {
      const meta = await uploadPDF(f);
      setPdfMeta(meta);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to read PDF");
      setPdfFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  // ---------- Signature canvas ----------

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("pdf-studio-signature");
    if (!saved) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new window.Image();
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      inkRef.current = true;
      setHasInk(true);
      setSigDataUrl(saved);
    };
    img.src = saved;
  }, []);

  const toCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const { x, y } = toCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!inkRef.current) {
      inkRef.current = true;
      setHasInk(true);
    }
  };

  const endDraw = () => {
    drawingRef.current = false;
    // After releasing, persist the drawn signature.
    if (inkRef.current) commitSignature();
  };

  const commitSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSigDataUrl(dataUrl);
    try {
      window.localStorage.setItem("pdf-studio-signature", dataUrl);
    } catch {
      // ignore quota errors
    }
  };

  const clearSig = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    inkRef.current = false;
    setHasInk(false);
    setSigDataUrl(null);
    try {
      window.localStorage.removeItem("pdf-studio-signature");
    } catch {
      // ignore
    }
  };

  // ---------- Signature overlay drag/resize ----------

  const onPreviewLoad = useCallback(() => {
    const img = previewImgRef.current;
    if (!img) return;
    setPreviewSize({ w: img.clientWidth, h: img.clientHeight });
    // Place signature near bottom-right by default.
    setSigBox((b) => ({
      ...b,
      x: Math.max(20, img.clientWidth - b.w - 40),
      y: Math.max(20, img.clientHeight - b.h - 40),
    }));
  }, []);

  const beginDrag = (e: React.PointerEvent<HTMLDivElement>, mode: DragMode) => {
    if (!sigDataUrl) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...sigBox },
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.mode === "move") {
      const nx = clamp(d.startBox.x + dx, 0, previewSize.w - d.startBox.w);
      const ny = clamp(d.startBox.y + dy, 0, previewSize.h - d.startBox.h);
      setSigBox({ ...d.startBox, x: nx, y: ny });
    } else if (d.mode === "resize") {
      const nw = clamp(d.startBox.w + dx, 60, previewSize.w - d.startBox.x);
      // Keep aspect ratio of original signature image.
      const ratio = d.startBox.h / d.startBox.w;
      const nh = clamp(nw * ratio, 24, previewSize.h - d.startBox.y);
      setSigBox({ ...d.startBox, w: nw, h: nh });
    }
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // ---------- Submit ----------

  const handleSubmit = async () => {
    if (!pdfFile || !pdfMeta) {
      toast.error("Upload a PDF first");
      return;
    }
    if (!sigDataUrl) {
      toast.error("Draw your signature first");
      return;
    }
    const previewW = previewImgRef.current?.clientWidth ?? previewSize.w;
    if (!previewW) {
      toast.error("Preview not ready - try again in a moment");
      return;
    }
    const page = pdfMeta.pages[pageIndex];
    if (!page) {
      toast.error("Selected page is out of range");
      return;
    }
    const scale = page.width / previewW;
    const xPt = sigBox.x * scale;
    const yPt = sigBox.y * scale;
    const widthPt = sigBox.w * scale;
    const heightPt = sigBox.h * scale;

    // Crop the canvas to its ink bbox before sending so blank padding
    // doesn't waste resolution in the stamp.
    const blob = await exportCroppedSignature();
    if (!blob) {
      toast.error("Could not export signature");
      return;
    }

    setBusy(true);
    trackEvent("tool_started", { tool: "sign-pdf", page: pageIndex });
    try {
      const r = await signPdf({
        file: pdfFile,
        signaturePng: blob,
        pageIndex,
        xPt,
        yPt,
        widthPt,
        heightPt,
      });
      setResult(r);
      toast.success("PDF signed");
    } catch (err) {
      trackEvent("tool_failed", { tool: "sign-pdf" });
      toast.error(err instanceof ApiError ? err.message : "Signing failed");
    } finally {
      setBusy(false);
    }
  };

  const exportCroppedSignature = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const { width, height } = canvas;
    const { data } = ctx.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 8) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return null;
    const pad = 6;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(width - sx, maxX - sx + pad);
    const sh = Math.min(height - sy, maxY - sy + pad);
    const tmp = document.createElement("canvas");
    tmp.width = sw;
    tmp.height = sh;
    tmp.getContext("2d")!.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return new Promise<Blob | null>((resolve) =>
      tmp.toBlob((b) => resolve(b), "image/png"),
    );
  };

  // ---------- Rendering ----------

  const pageCount = pdfMeta?.page_count ?? 0;
  const previewSrc = pdfMeta ? thumbnailUrl(pdfMeta.file_id, pageIndex, 720) : null;

  return (
    <ToolShell
      title="Sign PDF"
      subtitle="Upload a PDF, draw your signature, then drag it onto the page where it belongs. Watermark-free."
      icon={PenTool}
      sideCard={
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Touch-friendly - works on tablets and phones.</p>
            <p>• Your signature is saved locally for next time.</p>
            <p>• Drag to move, drag the bottom-right corner to resize.</p>
            <p>• For legally-binding eSignatures, use a certificate-based service.</p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Step 1 - upload */}
        <Card>
          <CardHeader>
            <CardTitle>1. Choose your PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FileDrop
              label={uploading ? "Reading PDF…" : "Drop the PDF to sign"}
              hint="Max 100 MB. Files auto-delete after 1 hour."
              accept={{ "application/pdf": [".pdf"] }}
              file={pdfFile}
              onChange={onPickPdf}
              className="max-w-xl"
            />
            {pdfMeta && (
              <p className="text-xs text-muted-foreground">
                {pdfMeta.filename} · {pageCount} page{pageCount === 1 ? "" : "s"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Step 2 - draw signature */}
        <Card>
          <CardHeader>
            <CardTitle>2. Draw your signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={220}
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
                className="block w-full touch-none cursor-crosshair bg-[linear-gradient(to_top,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[length:100%_100%]"
                style={{ height: 220 }}
                data-testid="sign-pdf-canvas"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Drag with mouse, trackpad, or finger.
              </p>
              <div className="flex items-center gap-2">
                {hasInk && (
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <Check className="h-3.5 w-3.5" /> Signature ready
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={clearSig} disabled={!hasInk}>
                  <Eraser className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 - place on page */}
        {pdfMeta && (
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>3. Drag the signature onto the page</CardTitle>
              {pageCount > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                    disabled={pageIndex === 0}
                  >
                    ‹ Prev
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Page {pageIndex + 1} / {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
                    disabled={pageIndex >= pageCount - 1}
                  >
                    Next ›
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!sigDataUrl ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                  <Upload className="mx-auto h-5 w-5 mb-2 opacity-60" />
                  Draw a signature above to unlock the placement preview.
                </div>
              ) : (
                <div
                  ref={previewWrapRef}
                  className="relative inline-block mx-auto rounded-xl overflow-hidden border border-border bg-card select-none"
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerLeave={endDrag}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={previewImgRef}
                    src={previewSrc!}
                    alt={`PDF page ${pageIndex + 1}`}
                    onLoad={onPreviewLoad}
                    draggable={false}
                    className="block max-w-full h-auto"
                    data-testid="sign-pdf-preview"
                  />
                  {previewSize.w > 0 && (
                    <div
                      role="button"
                      aria-label="Drag to position signature"
                      tabIndex={0}
                      onPointerDown={(e) => beginDrag(e, "move")}
                      style={{
                        position: "absolute",
                        left: sigBox.x,
                        top: sigBox.y,
                        width: sigBox.w,
                        height: sigBox.h,
                      }}
                      className={cn(
                        "cursor-move touch-none rounded-md outline-2 outline-dashed outline-primary/70 bg-primary/[0.04] hover:bg-primary/[0.08] transition",
                      )}
                      data-testid="sign-pdf-overlay"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sigDataUrl}
                        alt=""
                        draggable={false}
                        className="block h-full w-full object-contain pointer-events-none"
                      />
                      {/* Resize handle */}
                      <div
                        role="button"
                        aria-label="Resize signature"
                        onPointerDown={(e) => beginDrag(e, "resize")}
                        className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-sm bg-primary border border-background cursor-se-resize touch-none"
                      />
                    </div>
                  )}
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Drag the dashed box to move; drag the small square at its corner to resize.
              </p>
            </CardContent>
          </Card>
        )}

        <Button
          size="lg"
          onClick={handleSubmit}
          isLoading={busy}
          disabled={!pdfFile || !pdfMeta || !sigDataUrl || busy}
          data-testid="sign-pdf-button"
        >
          <Wand2 className="h-4 w-4" /> Sign &amp; Download
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description="Signature stamped"
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="sign-pdf"
            testId="sign-pdf-result"
          />
        )}
      </div>
    </ToolShell>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
