import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { solutions, solutionsPage, solutionTimeline } from "@/content/solutions";
import { CTA, DELIVERY } from "@/content/site";
import { CtaBand } from "@/components/site/cta-band";
import { FinePrint } from "@/components/site/fine-print";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { SolutionArt } from "@/components/solutions/solution-art";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Inventory and POS, order and booking management, invoicing, multi-branch operations, websites, field apps and reporting — the systems we design and deliver.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title={solutionsPage.title}
        body={solutionsPage.subtitle}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Solutions", href: "/solutions" },
        ]}
        actions={
          <Link href={CTA.quotePath} className={buttonClass("primary", "md")}>
            {CTA.primary}
          </Link>
        }
        aside={
          <div className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray-600">
              {DELIVERY.smallHeading}
            </p>
            <p className="font-display text-xl font-bold text-navy-950">{DELIVERY.small}</p>
            <p className="mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray-600">
              {DELIVERY.largeHeading}
            </p>
            <p className="font-display text-xl font-bold text-navy-950">{DELIVERY.large}</p>
            <FinePrint className="mt-4 border-t border-gray-200 pt-3" />
          </div>
        }
      />

      <div className="shell py-14 md:py-20">
        <ul className="space-y-5">
          {solutions.map((solution, index) => (
            <li key={solution.id} id={solution.id} className="scroll-mt-24">
              <Reveal>
                <article className="grid gap-6 rounded-card border border-gray-200 bg-white p-5 shadow-card md:grid-cols-2 md:items-center md:gap-10 md:p-8">
                  <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {solution.number}
                      </span>
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-gray-600">
                        {solutionTimeline(solution.size)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-navy-950 sm:text-2xl">“{solution.problem}”</h2>
                    <p className="mt-2 text-[1.0625rem] font-medium text-brand-600">{solution.system}</p>
                    <ul className="mt-5 space-y-2">
                      {solution.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2 text-[0.9375rem] text-gray-600">
                          <Check className="mt-0.5 size-4 shrink-0 text-accent-500" strokeWidth={2.5} aria-hidden="true" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`${CTA.quotePath}?topic=${encodeURIComponent(solution.system)}`}
                      className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Discuss this on a free call
                      <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                  <SolutionArt
                    art={solution.art}
                    alt={solution.alt}
                    className={index % 2 === 1 ? "md:order-1" : undefined}
                  />
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <CtaBand heading={solutionsPage.ctaHeading} body={solutionsPage.ctaBody} />
    </>
  );
}
