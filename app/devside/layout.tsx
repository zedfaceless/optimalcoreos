import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "@/app/devside/actions";
import { currentAdmin } from "@/lib/devside/auth";

/**
 * The console shell (PRD §12.1, §12.3). No marketing header, no footer, no link
 * anywhere on the public site leads here, and every response carries the noindex
 * header set in `next.config.ts` — this metadata is the second copy of it, for the
 * crawler that reads the document rather than the headers.
 */
export const metadata: Metadata = {
  title: "Devside",
  robots: { index: false, follow: false, noarchive: true },
};

/**
 * Nothing under `/devside` may be prerendered. Without this, a build in an
 * environment that has no Supabase keys (CI, a laptop before `pnpm env`) renders the
 * console once, at build time, as "the database is not configured" — and that HTML
 * is what the first admin would then be served in production. It also makes the
 * console dynamic for the right reason: the answer depends on who is asking.
 */
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/devside/dashboard", label: "Dashboard" },
  { href: "/devside/leads", label: "Leads" },
  { href: "/devside/messages", label: "Messages" },
  /* Owner-only, and hidden rather than shown-and-refused: the two pages behind these
     links answer `requireOwner()`, so a staff admin following one would land on the
     dashboard with an error. The gate is still the page, not this list. */
  { href: "/devside/team", label: "Team", ownerOnly: true },
  { href: "/devside/audit", label: "Audit", ownerOnly: true },
];

export default async function DevsideLayout({ children }: { children: ReactNode }) {
  const admin = await currentAdmin();

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-brand-600 font-display text-sm font-bold"
            >
              OC
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">Optimal Core OS</span>
            <span className="rounded-full border border-white/25 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-white/75">
              Admin
            </span>
          </div>

          {admin ? (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <nav aria-label="Console" className="flex items-center gap-1">
                {LINKS.filter((link) => !("ownerOnly" in link) || admin.role === "owner").map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <span className="text-white/50" aria-hidden="true">
                |
              </span>
              <span className="text-white/70">
                {admin.displayName ?? admin.email}
                <span className="ml-1 text-white/40">({admin.role})</span>
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/25 px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
