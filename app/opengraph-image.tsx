import { ImageResponse } from "next/og";
import { BRAND, DELIVERY } from "@/content/site";

/**
 * The social card (PRD §16): the wordmark in white on deep navy, a thin blue line
 * grid, and the tagline. 1200 by 630, the size every network crops from.
 *
 * Drawn with `next/og` instead of shipping a PNG, so the words on it are the words
 * in this file and cannot drift from the copy. The grid lines are a repeating
 * linear-gradient rather than 40 divs, because satori renders a gradient natively.
 */
export const alt =
  "Optimal Core OS wordmark in white on a deep navy background with a thin blue line grid and the tagline 'Custom software built around your business'.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0f1b2e",
          backgroundImage:
            "linear-gradient(to right, rgba(31,111,235,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,111,235,0.22) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#1f6feb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                border: "7px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: 8, background: "#ffffff" }} />
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#ffffff", letterSpacing: -1 }}>
            {BRAND.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#ffffff", letterSpacing: -2, lineHeight: 1.1 }}>
            Custom software built around your business
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "rgba(255,255,255,0.72)" }}>
            {`Systems, websites and mobile-ready apps. ${DELIVERY.smallFull}.`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
