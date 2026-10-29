/**
 * The one place a URL is decided. Read from `NEXT_PUBLIC_SITE_URL` so a preview
 * deployment links to itself and not to production; the fallback is the local dev
 * server, never a guess at the production domain (PRD §0.4: placeholders are never
 * invented).
 *
 * Empty counts as absent, which is what `.env.example` promises for every key: a
 * copied-and-unfilled file is a site that renders, not a build that fails. `??`
 * alone would only catch "unset", and the empty string is a real state here — it
 * is what `.env.example` ships and what a GitHub Actions variable set to nothing
 * hands the build. `new URL("")` in `app/layout.tsx` threw `Invalid URL`, so the
 * difference between unset and empty was the difference between a build and no
 * build on a fresh checkout.
 *
 * Trailing whitespace is trimmed for the same reason a slash is: it came from a
 * person typing into a dashboard, and `"https://example.com "` in a canonical link
 * is a different URL to every crawler that reads it.
 */
export function resolveSiteUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  return (value === "" ? "http://localhost:3000" : value).replace(/\/+$/, "");
}

export function siteUrl(): string {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
