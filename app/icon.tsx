import { ImageResponse } from "next/og";

/**
 * The icon, drawn rather than shipped (PRD §16: a rounded square in the brand blue
 * holding a white concentric-ring "core" glyph). One component, two sizes, and the
 * SVG-free version of the mark that the OG image reuses.
 */
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
          background: "#1f6feb",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: "5px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ffffff" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
