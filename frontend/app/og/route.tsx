import { ImageResponse } from "next/og";
import { brand } from "@/brand.config";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || `${brand.name}`).slice(0, 80);
  const subtitle = (
    searchParams.get("subtitle") ||
    "Free PDF tools, merge, compress, OCR, convert"
  ).slice(0, 140);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          backgroundImage:
            "linear-gradient(135deg, #6366f1 0%, #d946ef 60%, #f59e0b 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            📄
          </div>
          {brand.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, opacity: 0.92, maxWidth: 1000 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.85, display: "flex" }}>
          {brand.domain} · Free for everyone, everywhere
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
