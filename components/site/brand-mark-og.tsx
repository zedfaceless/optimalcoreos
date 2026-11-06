/**
 * The brand mark for `next/og`. Satori — the renderer behind `ImageResponse` — cannot
 * draw SVG paths, so the same hexagon-and-arrow geometry from `brand-mark.tsx` is
 * rebuilt from bars, on the same 40-unit grid scaled by `size`.
 *
 * Each bar is centred on the midpoint of the line it represents and then rotated.
 * Rotation about the centre is the one transform satori handles the same way a
 * browser does, so no `transformOrigin` is needed — that property is unreliable there
 * and a wrong origin would flip the mark.
 *
 * The `light` tone assumes navy-900 (#0f1b2e), the background `app/opengraph-image.tsx`
 * paints. The knockout has to match whatever surface is behind the mark or the shaft
 * shows a seam where it crosses the rings: this file is only ever drawn on the OG card,
 * while `brand-mark.tsx` is also drawn in the footer, which is navy-950 (#0a1220) — the
 * two files therefore knock out different values on purpose.
 */
const BOX = 40;

const CENTRE_X = 19;
const CENTRE_Y = 20;
const RINGS = [
  { radius: 14.5, opacity: 1 },
  { radius: 11, opacity: 0.78 },
  { radius: 7.5, opacity: 0.55 },
];
const EDGE_ANGLES = [0, 60, 120, 180, 240, 300];

/**
 * One hexagonal ring, drawn as six bars. In a regular hexagon the side equals the
 * circumradius and each edge's midpoint sits 0.866 of that out from the centre, so the
 * radius alone decides how long a bar is and where it lands.
 */
function HexRing({
  radius,
  thickness,
  color,
  opacity,
  scale,
}: {
  radius: number;
  thickness: number;
  color: string;
  opacity: number;
  scale: number;
}) {
  const bar = thickness * scale;
  const side = radius * scale;

  return (
    <>
      {EDGE_ANGLES.map((degrees) => {
        const radians = (degrees * Math.PI) / 180;
        const centreX = (CENTRE_X + radius * 0.866 * Math.cos(radians)) * scale;
        const centreY = (CENTRE_Y - radius * 0.866 * Math.sin(radians)) * scale;
        return (
          <div
            key={degrees}
            style={{
              position: "absolute",
              left: centreX - side / 2,
              top: centreY - bar / 2,
              width: side,
              height: bar,
              borderRadius: bar / 2,
              background: color,
              opacity,
              transform: `rotate(${90 - degrees}deg)`,
            }}
          />
        );
      })}
    </>
  );
}

export function BrandMarkOg({ size = 96, tone = "light" }: { size?: number; tone?: "dark" | "light" }) {
  const scale = size / BOX;
  const light = tone === "light";
  const knockout = light ? "#0F1B2E" : "#FFFFFF";
  const accent = light ? "#4FD1E8" : "#1F6FEB";
  const ringColour = light ? "#4FD1E8" : "#1F6FEB";

  /* The shaft runs (6,34) to (27.9,12.1) — 45 degrees, midpoint (16.95,23.05). */
  const shaft = (thickness: number, colour: string) => {
    const length = Math.hypot(21.9, 21.9) * scale;
    const bar = thickness * scale;
    return {
      position: "absolute" as const,
      left: 16.95 * scale - length / 2,
      top: 23.05 * scale - bar / 2,
      width: length,
      height: bar,
      borderRadius: bar / 2,
      background: colour,
      transform: "rotate(-45deg)",
    };
  };
  /* The head is the arrow-up-right corner: axis-aligned arms, tip at (35,5). Bars
     rather than a filled triangle because satori has no clip paths — at icon sizes the
     corner glyph is what reads as the arrowhead anyway. The box is `10` because satori
     sizes boxes border-box, so the borders stay inside it. */
  const head = (thickness: number, colour: string) => {
    const bar = thickness * scale;
    return {
      position: "absolute" as const,
      left: 25 * scale,
      top: 5 * scale,
      width: 10 * scale,
      height: 10 * scale,
      borderTopWidth: bar,
      borderTopStyle: "solid" as const,
      borderTopColor: colour,
      borderRightWidth: bar,
      borderRightStyle: "solid" as const,
      borderRightColor: colour,
      borderTopRightRadius: 2.6 * scale,
    };
  };

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex" }}>
      {RINGS.map((ring) => (
        <HexRing
          key={ring.radius}
          radius={ring.radius}
          thickness={2.6}
          color={ringColour}
          opacity={ring.opacity}
          scale={scale}
        />
      ))}

      {/* Knockout, then the accent: the arrow reads over the rings. */}
      <div style={shaft(8.6, knockout)} />
      <div style={head(8.6, knockout)} />
      <div style={shaft(4.6, accent)} />
      <div style={head(4.6, accent)} />
    </div>
  );
}
