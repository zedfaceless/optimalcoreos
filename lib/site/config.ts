/**
 * The one place a URL is decided. Read from `NEXT_PUBLIC_SITE_URL` so a preview
 * deployment links to itself and not to production; the fallback is the local dev
 * server, never a guess at the production domain (PRD §0.4: placeholders are never
 * invented).
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
