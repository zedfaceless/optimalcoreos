import { ImageResponse } from "next/og";

/** The 180px touch icon an iPhone uses when the site is added to the home screen. */
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
          background: "#0f1b2e",
        }}
      >
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 26,
            background: "#1f6feb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              border: "8px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 10, background: "#ffffff" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
