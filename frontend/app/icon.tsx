import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #6366f1 0%, #7c3aed 55%, #ec4899 100%)",
          borderRadius: 14,
          color: "white",
          fontSize: 44,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        P
      </div>
    ),
    { ...size },
  );
}
