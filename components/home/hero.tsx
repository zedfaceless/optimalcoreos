import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { hero } from "@/content/home";
import { CTA, DELIVERY } from "@/content/site";
import { FinePrint } from "@/components/site/fine-print";
import { HeroVisual } from "@/components/site/hero-visual";
import { buttonClass } from "@/components/ui/button";

/**
 * Hero (§7.1). The H1 carries the positioning, the two buttons are the only
 * actions, and the delivery promise sits under the fold line as a strip so the
 * timeline is stated once on this page and worded exactly as `DELIVERY` words it.
 */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(60%_100%_at_70%_0%,#EEF4FF_0%,rgba(247,249,252,0.6)_55%,#FFFFFF_100%)]"
      />
      <div className="shell relative grid gap-12 pb-14 pt-12 md:pb-20 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-500" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 text-[2.125rem] font-extrabold leading-[1.08] text-navy-950 sm:text-[3rem] lg:text-[3.4rem]">
            {hero.titleLead}
            <span className="relative whitespace-nowrap text-brand-600">
              {hero.titleEmphasis}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-[0.18em] rounded-full bg-accent-500/35"
              />
            </span>
            {hero.titleTail}
          </h1>
          <p className="measure mt-5 text-[1.0625rem] leading-relaxed text-gray-600 sm:text-lg">
            {hero.subtitle}
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {hero.trust.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Check className="size-4 text-accent-500" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={CTA.quotePath} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
              {CTA.primary}
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link href={CTA.processPath} className={buttonClass("secondary", "lg", "w-full sm:w-auto")}>
              {CTA.secondary}
            </Link>
          </div>

          <p className="mt-4 text-[0.8125rem] text-gray-600">
            Free, no-obligation discussion · We reply within 1 business day.
          </p>
        </div>

        <div className="lg:pl-4">
          <HeroVisual />
        </div>
      </div>

      <div className="shell relative pb-12">
        <div className="rounded-card border border-gray-200 bg-white/80 p-5 shadow-card backdrop-blur sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
            <div className="sm:border-r sm:border-gray-200 sm:pr-8">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray-600">
                {DELIVERY.smallHeading}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-navy-950">{DELIVERY.small}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray-600">
                {DELIVERY.largeHeading}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-navy-950">{DELIVERY.large}</p>
            </div>
          </div>
          <FinePrint className="mt-5 border-t border-gray-200 pt-4" />
        </div>
      </div>
    </section>
  );
}
