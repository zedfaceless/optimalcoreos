import type { MetadataRoute } from "next";
import { BRAND_COLOURS } from "@/lib/site/brand";
import { siteUrl } from "@/lib/site/config";

/**
 * The manifest Next serves at `/manifest.webmanifest`, which `app/layout.tsx`
 * already points at. Both icons are the supplied artwork, dropped in as the
 * `app/icon.jpeg` and `app/apple-icon.jpeg` file conventions, so every icon surface
 * is the real logo. The header is the one place that does not use it: at 32px the
 * artwork's ribbons collapse and it reads as a navy square, so the lockup draws the
 * same geometry instead (`components/site/brand-mark.tsx`, and the reason is spelled
 * out in `components/site/logo.tsx`).
 *
 * The `src` values are the file-convention URLs (`/icon.jpeg`, not `/icon`): a raster
 * icon route is served under its own extension.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Optimal Core OS",
    short_name: "Optimal Core",
    description:
      "Custom systems for resorts and hotels, offline and desktop software, websites and mobile-ready apps.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND_COLOURS.white,
    theme_color: BRAND_COLOURS.navy900,
    lang: "en",
    icons: [
      { src: "/icon.jpeg", sizes: "1024x1024", type: "image/jpeg" },
      { src: "/apple-icon.jpeg", sizes: "1024x1024", type: "image/jpeg" },
    ],
    /* The canonical URL is the deployment's own, read from the environment rather
       than guessed (PRD §0.4). */
    id: siteUrl(),
  };
}
