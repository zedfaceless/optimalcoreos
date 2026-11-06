import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site/config";

/**
 * The manifest Next serves at `/manifest.webmanifest`, which `app/layout.tsx`
 * already points at. Both icons are the supplied artwork, dropped in as the
 * `app/icon.jpeg` and `app/apple-icon.jpeg` file conventions — so the tab icon is the
 * real logo, and there is no second geometry to keep in step with the header.
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
    background_color: "#ffffff",
    theme_color: "#0f1b2e",
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
