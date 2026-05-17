import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "white",
          fontSize: 124,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: -6,
          lineHeight: 1,
        }}
      >
        P
      </div>
    ),
    { ...size },
  );
}
