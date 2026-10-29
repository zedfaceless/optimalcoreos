import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import {
  largeSystemPhases,
  pricing,
  processPage,
  processSteps,
  smallSystemFits,
} from "@/content/process";
import { processFaq } from "@/content/faq";
import { DELIVERY } from "@/content/site";
import { CtaBand } from "@/components/site/cta-band";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { FinePrint } from "@/components/site/fine-print";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "Six steps from a free conversation to launch and support: discovery, scope and quotation, design, build, launch, support. Plus delivery times and answers to common questions.",
  alternates: { canonical: "/how-we-work" },
};

export default function HowWeWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="How we work"
        title={processPage.title}
        body={processPage.subtitle}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "How We Work", href: "/how-we-work" },
        ]}
      />

      <section className="shell py-14 md:py-20">
        <ol className="space-y-4">
          {processSteps.map((step) => (
            <li key={step.number}>
              <Reveal>
                <div className="grid gap-4 md:grid-cols-[auto_1fr] md:gap-8">
                  <div className="hidden md:block">
                    <span className="sticky top-24 flex size-12 items-center justify-center rounded-full border-2 border-brand-600 bg-white font-display text-base font-bold text-brand-600">
                      {step.number}
                    </span>
                  </div>
                  <div className="rounded-card border border-gray-200 bg-white p-5 shadow-card md:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-600 font-display text-xs font-bold text-white md:hidden">
                        {step.number}
                      </span>
                      <h2 className="text-lg font-bold text-navy-950">{step.title}</h2>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[0.75rem] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                        <Clock className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        {step.duration}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-600">
                          What we do
                        </p>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-gray-600">{step.weDo}</p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-gray-600">
                          What you do
                        </p>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-gray-600">{step.youDo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="shell grid gap-6 py-14 md:grid-cols-2 md:py-16">
          <div className="rounded-card border border-gray-200 bg-white p-6 shadow-card">
            <p className="eyebrow">Delivery</p>
            <h2 className="mt-2 text-xl font-bold text-navy-950">{DELIVERY.smallFull}</h2>
            <ul className="mt-4 space-y-2 text-[0.9375rem] text-gray-600">
              {smallSystemFits.map((fit) => (
                <li key={fit} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500" />
                  {fit}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-gray-200 bg-white p-6 shadow-card">
            <p className="eyebrow">Larger platforms</p>
            <h2 className="mt-2 text-xl font-bold text-navy-950">{DELIVERY.largeFull}</h2>
            <ol className="mt-4 space-y-2 text-[0.9375rem] text-gray-600">
              {largeSystemPhases.map((phase, index) => (
                <li key={phase} className="flex gap-2">
                  <span className="text-[0.75rem] font-bold text-brand-600">{index + 1}.</span>
                  {phase}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="shell pb-12">
          <FinePrint />
        </div>
      </section>

      <section className="shell py-14 md:py-16">
        <h2 className="text-xl font-bold text-navy-950">{pricing.heading}</h2>
        <p className="measure mt-2 text-[1.0625rem] leading-relaxed text-gray-600">{pricing.body}</p>
        <Link
          href="/request-quote"
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Request a free consultation
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
        </Link>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-gray-200 bg-gray-50">
        <div className="shell grid gap-10 py-14 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">The questions owners ask.</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-gray-600">
              Straight answers on time, cost, data and what happens after launch.
            </p>
          </div>
          <FaqAccordion items={processFaq} />
        </div>
      </section>

      <CtaBand
        heading="Start with the free conversation."
        body="Thirty to forty-five minutes, virtual, no obligation. We will tell you what the work involves."
      />
      <JsonLd data={faqJsonLd(processFaq)} />

    </>
  );
}
