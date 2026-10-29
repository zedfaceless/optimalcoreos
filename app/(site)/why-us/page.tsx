import type { Metadata } from "next";
import { Check } from "lucide-react";
import { commitments, comparison, reasons, whyPage } from "@/content/why-us";
import { CtaBand } from "@/components/site/cta-band";
import { FinePrint } from "@/components/site/fine-print";
import { PageHero } from "@/components/site/page-hero";
import { ProofSection } from "@/components/site/proof-section";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Why Us",
  description:
    "Built around your workflow, defined delivery times, one accountable team, secure by design and modern maintainable technology — what we commit to, and how a custom system compares to spreadsheets and off-the-shelf software.",
  alternates: { canonical: "/why-us" },
};

export default function WhyUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Why us"
        title={whyPage.title}
        body={whyPage.subtitle}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Why Us", href: "/why-us" },
        ]}
      />

      <section className="shell py-14 md:py-20">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <li key={reason.title}>
                <Reveal>
                  <div className="h-full rounded-card border border-gray-200 bg-white p-6 shadow-card">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-lg font-bold text-navy-950">{reason.title}</h2>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-600">{reason.body}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      <ProofSection />

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="shell py-14 md:py-20">
          <h2 className="text-2xl font-bold text-navy-950 sm:text-3xl">
            A custom system next to the usual two options.
          </h2>
          <p className="measure mt-3 text-[1.0625rem] leading-relaxed text-gray-600">
            Most businesses run on spreadsheets or on software built for somebody else&rsquo;s process. Here is
            the honest difference.
          </p>
          <div className="table-scroll mt-7 rounded-card border border-gray-200 bg-white shadow-card">
            <table className="w-full min-w-[44rem] border-collapse text-left text-[0.9375rem]">
              <caption className="sr-only">
                Comparison of a custom system, spreadsheets and off-the-shelf software
              </caption>
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Measure</span>
                  </th>
                  {comparison.columns.map((column, index) => (
                    <th
                      key={column}
                      scope="col"
                      className={
                        index === 0
                          ? "px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-600"
                          : "px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-gray-600"
                      }
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-200 last:border-0">
                    <th scope="row" className="whitespace-nowrap px-5 py-4 font-medium text-navy-950">
                      {row.label}
                    </th>
                    <td className="bg-brand-50/40 px-5 py-4 font-medium text-navy-950">{row.custom}</td>
                    <td className="px-5 py-4 text-gray-600">{row.spreadsheets}</td>
                    <td className="px-5 py-4 text-gray-600">{row.offTheShelf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-16">
        <h2 className="text-2xl font-bold text-navy-950">{whyPage.commitmentsHeading}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {commitments.map((commitment) => (
            <li
              key={commitment}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-[0.9375rem] font-medium text-navy-950 shadow-card"
            >
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              </span>
              {commitment}
            </li>
          ))}
        </ul>
        <FinePrint className="mt-6" />
      </section>

      <CtaBand
        heading="Test the claims on a free call."
        body="Bring the process that hurts most. We will tell you what a system for it involves, and what it does not."
      />
    </>
  );
}
