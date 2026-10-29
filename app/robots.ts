import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site/config";

/**
 * `/robots.txt` (PRD §16). Everything public is allowed and the sitemap is named.
 *
 * `/devside` is deliberately *not* listed as `Disallow`: a rule in this file is a
 * public advertisement of the path (PRD §12.1), and a crawler that is told not to
 * fetch a page can still index the URL. The console answers with `X-Robots-Tag:
 * noindex` and a `noindex` metadata block instead, which is the instruction that
 * actually keeps it out. The API routes are disallowed because nothing there is a
 * page and a bot hammering a POST endpoint is pure cost.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
