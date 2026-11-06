import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { vercelAnalyticsEnabled } from "@/lib/site/analytics";
import { siteUrl } from "@/lib/site/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Resort Systems & Offline Software | Optimal Core OS",
    template: "%s | Optimal Core OS",
  },
  description:
    "Custom systems for resorts and hotels — bookings, front desk, housekeeping, POS — plus offline software that works with no internet.",
  applicationName: "Optimal Core OS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Optimal Core OS",
    locale: "en",
    url: "/",
    title: "Resort Systems & Offline Software | Optimal Core OS",
    description:
      "Bookings, front desk, housekeeping, POS and owner dashboards for resorts — plus software that keeps working with no internet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resort Systems & Offline Software | Optimal Core OS",
    description:
      "Resort and hotel systems, and offline software that keeps working with no internet.",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1B2E",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* Read per render rather than at module load: the layout is prerendered, and Next inlines
     `NEXT_PUBLIC_*` at build time either way, so this is the same value every request — it
     just keeps the decision in one function a test can read (§14.3). */
  const analytics = vercelAnalyticsEnabled();
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        {children}
        {analytics ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
