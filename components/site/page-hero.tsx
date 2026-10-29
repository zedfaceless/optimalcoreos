import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * The banner every inner page opens with (§5.2): breadcrumb, one H1, a supporting
 * paragraph, and an optional action slot. One component keeps the H1 size, the
 * spacing and the breadcrumb markup identical across nine routes.
 */
export function PageHero({
  eyebrow,
  title,
  body,
  crumbs,
  actions,
  aside,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gray-50">
      <div className="grid-dots-dark pointer-events-none absolute inset-x-0 top-0 h-64" aria-hidden="true" />
      <div className="shell relative py-10 md:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-gray-600">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-1">
                  {last ? (
                    <span aria-current="page" className="font-medium text-navy-950">
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link href={crumb.href} className="hover:text-brand-600">
                        {crumb.name}
                      </Link>
                      <ChevronRight className="size-3.5 text-gray-200" strokeWidth={2} aria-hidden="true" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={cn("mt-6", aside ? "grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end" : "")}>
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1 className="mt-3 text-[2rem] font-extrabold text-navy-950 sm:text-[2.75rem]">{title}</h1>
            {body ? <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-gray-600">{body}</p> : null}
            {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
          </div>
          {aside}
        </div>
      </div>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </section>
  );
}
