import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/content/nav";
import { absoluteUrl } from "@/lib/site/config";

/**
 * Only the public, indexable pages (PRD §16). `/devside` and the API routes are
 * absent by construction — they are not in `PUBLIC_ROUTES`, and that list is the one
 * the footer and the router's own canonicals are checked against.
 *
 * No `lastModified`: nothing on this site is dated, and a build timestamp would tell
 * a crawler that all ten pages changed every deploy, which is worse than silence.
 */
const PRIORITY: Record<string, number> = {
  "/": 1,
  "/request-quote": 0.9,
  "/contact": 0.8,
  "/solutions": 0.8,
  "/services": 0.8,
  "/how-we-work": 0.7,
  "/why-us": 0.7,
  "/about": 0.6,
  "/privacy": 0.3,
  "/terms": 0.3,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: PRIORITY[route] ?? 0.5,
  }));
}
