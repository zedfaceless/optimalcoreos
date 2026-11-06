import { cn } from "@/lib/utils";

/**
 * The mark, from the brand artwork: three nested hexagonal rings with a heavy arrow
 * climbing out of them to the upper right.
 *
 * Vector, because it sits at 32px beside the wordmark, at 16px in a tab, and at
 * 1200px on a social card, and one geometry serves all three.
 *
 * `tone` follows the surface: `dark` is the header (blue on white), `light` is the
 * footer (cyan on navy-950). The arrow is drawn twice — a wide knockout stroke in the
 * surface colour, then the gradient — so it reads where it crosses the rings. If a
 * surface ever changes navy, that knockout has to change with it.
 */
const CENTRE_X = 19;
const CENTRE_Y = 20;
const RINGS = [
  { radius: 14.5, opacity: 1 },
  { radius: 11, opacity: 0.78 },
  { radius: 7.5, opacity: 0.55 },
];

/** A pointy-top hexagon: vertices at 0, 60, 120, 180, 240 and 300 degrees. */
function hexagonPath(radius: number): string {
  const corners = [0, 60, 120, 180, 240, 300].map((degrees) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return `${(CENTRE_X + radius * Math.cos(radians)).toFixed(2)} ${(
      CENTRE_Y +
      radius * Math.sin(radians)
    ).toFixed(2)}`;
  });
  return `M${corners.join("L")}Z`;
}

export function BrandMark({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  const ringsId = `oc-rings-${tone}`;
  const arrowId = `oc-arrow-${tone}`;
  const knockout = light ? "#0A1220" : "#FFFFFF";

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-8 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={ringsId} x1="6" y1="30" x2="32" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor={light ? "#1F6FEB" : "#1859BF"} />
          <stop offset="1" stopColor={light ? "#4FD1E8" : "#1F6FEB"} />
        </linearGradient>
        <linearGradient id={arrowId} x1="6" y1="34" x2="35" y2="5" gradientUnits="userSpaceOnUse">
          <stop stopColor={light ? "#3FA9E0" : "#1859BF"} />
          <stop offset="0.55" stopColor={light ? "#7FE3F5" : "#2F9BE0"} />
          <stop offset="1" stopColor={light ? "#BFF2FA" : "#4FD1E8"} />
        </linearGradient>
      </defs>

      {RINGS.map((ring) => (
        <path
          key={ring.radius}
          d={hexagonPath(ring.radius)}
          fill="none"
          stroke={`url(#${ringsId})`}
          strokeWidth={2.6}
          strokeLinejoin="round"
          opacity={ring.opacity}
        />
      ))}

      <path
        d="M6 34 27.9 12.1"
        stroke={knockout}
        strokeWidth={8.6}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6 34 27.9 12.1"
        stroke={`url(#${arrowId})`}
        strokeWidth={4.6}
        strokeLinecap="round"
        fill="none"
      />
      {/* The head: a 13-wide triangle on a 4.6 shaft, so it reads at 16px. */}
      <polygon points="35 5 32.53 16.67 23.33 7.47" fill={`url(#${arrowId})`} />
    </svg>
  );
}

