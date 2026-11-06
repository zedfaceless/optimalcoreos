/**
 * The brand palette as literal hex — the copy for the two surfaces that cannot read
 * `app/globals.css`.
 *
 * Everything a browser renders uses the `@theme` tokens directly: Tailwind classes, or
 * `var(--color-…)` inside the SVG mark. Two surfaces cannot. Satori, which draws the OG
 * card, does not resolve `var()`, and mail clients strip custom properties — Gmail
 * removes them outright — so both need the values baked in. This module is that baked
 * copy, and the only one: `components/site/brand-mark-og.tsx` and
 * `lib/email/templates.ts` import it rather than repeating hexes.
 *
 * The values are sampled from the supplied artwork: its arrow gradient runs
 * #1859BF -> #2F9BE0 -> #4FD1E8, with #3FA9E0 / #7FE3F5 / #BFF2FA on the light side.
 * No build step keeps this file and the `@theme` block in sync, which is why the two are
 * edited together and reviewed side by side.
 */
export const BRAND_COLOURS = {
  navy950: "#0a1220",
  navy900: "#0f1b2e",
  navy700: "#1d2e4a",

  brand700: "#1859bf",
  brand600: "#1f6feb",
  brand500: "#2f9be0",
  brand400: "#3fa9e0",
  brand300: "#4fd1e8",
  brand200: "#7fe3f5",
  brand100: "#bff2fa",
  brand50: "#eef4ff",

  gray900: "#111827",
  gray600: "#4b5563",
  gray200: "#e5e9f0",
  gray50: "#f7f9fc",

  white: "#ffffff",
} as const;
