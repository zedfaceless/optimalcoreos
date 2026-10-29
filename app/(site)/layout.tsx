import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { StickyMobileCta } from "@/components/site/sticky-mobile-cta";

/**
 * The public shell. `/devside` deliberately sits outside this group: it gets its
 * own layout, no marketing header, and no link from anywhere on the site.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
