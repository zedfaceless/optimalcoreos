import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { buttonClass } from "@/components/ui/button";
import { NAV_LINKS } from "@/content/nav";

/**
 * The 404. It lives at the root rather than in the `(site)` group, because the URL a
 * visitor mistyped never entered a group — so this file carries the header and
 * footer itself, and the page still looks like the site rather than like a server.
 */
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          That page is not here
        </h1>
        <p className="mt-4 text-gray-600">
          The link may be old, or the address may have a typo in it. Everything the site has is one
          click away below.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={buttonClass("primary")}>
            Back to home
          </Link>
          <Link href="/request-quote" className={buttonClass("secondary")}>
            Book a Free Consultation
          </Link>
        </div>
        <nav aria-label="Site" className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-600 hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>
      </main>
      <Footer />
    </>
  );
}
