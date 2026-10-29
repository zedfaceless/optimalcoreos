import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site/config";

/**
 * The manifest Next serves at `/manifest.webmanifest`, which `app/layout.tsx`
 * already points at. Icons come from `app/icon.tsx` and `app/apple-icon.tsx`, so
 * there is exactly one set to keep in step with the brand mark.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Optimal Core OS",
    short_name: "Optimal Core",
    description: "Custom systems, websites and mobile-ready apps, built around how your business runs.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f1b2e",
    lang: "en",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    /* The canonical URL is the deployment's own, read from the environment rather
       than guessed (PRD §0.4). */
    id: siteUrl(),
  };
}
