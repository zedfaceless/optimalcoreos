import Link from "next/link";
import { FOOTER_GROUPS } from "@/content/nav";
import { Logo } from "@/components/site/logo";
import { getSiteSettings } from "@/lib/site/settings";

/**
 * Four columns on desktop, one stacked column on mobile (§5.5). There is no admin
 * link here, and there never will be: the backend is reached only by its own URL.
 */
export function Footer() {
  const settings = getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8 lg:py-16">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-[34ch] text-sm leading-relaxed text-white/70">
            Custom systems, websites and mobile-ready apps for business owners — designed around how
            your business actually runs.
          </p>
          <a
            href={`mailto:${settings.email}`}
            className="inline-flex min-h-11 items-center text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {settings.email}
          </a>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/50">
              {group.title}
            </h2>
            <ul className="mt-3 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Optimal Core OS. All rights reserved.</p>
          <p>Built in the Philippines. Working worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
