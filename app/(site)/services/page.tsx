import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { included, services, servicesPage, sizeTable, technology } from "@/content/services";
import { CTA } from "@/content/site";
import { CtaBand } from "@/components/site/cta-band";
import { FinePrint } from "@/components/site/fine-print";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ServiceArt } from "@/components/site/service-art";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom business systems, business websites and platforms, and mobile-ready apps — what each one includes, who it suits and how long it takes.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={servicesPage.title}
        body={servicesPage.subtitle}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
        actions={
          <Link href={CTA.quotePath} className={buttonClass("primary", "md")}>
            {CTA.primary}
          </Link>
        }
      />

      <div className="shell py-14 md:py-20">
        <div className="space-y-6">
          {services.map((service, index) => (
            <section key={service.id} id={service.id} className="scroll-mt-24">
              <Reveal>
                <div className="grid gap-8 rounded-card border border-gray-200 bg-white p-5 shadow-card md:grid-cols-2 md:items-start md:gap-10 md:p-8">
                  <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                    <ServiceArt art={service.art} alt={service.alt} className="h-56" />
                    <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-gray-600">
                      <span className="font-semibold text-navy-950">Typical examples: </span>
                      {service.examples}
                    </p>
                  </div>
                  <div className={index % 2 === 1 ? "md:order-1" : undefined}>
                    <h2 className="text-2xl font-bold text-navy-950">{service.title}</h2>
                    <p className="mt-3 text-[1.0625rem] leading-relaxed text-gray-600">{service.intro}</p>
                    <h3 className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray-600">
                      What you receive
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {service.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[0.9375rem] text-gray-600">
                          <Check className="mt-0.5 size-4 shrink-0 text-accent-500" strokeWidth={2.5} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`${CTA.quotePath}?topic=${encodeURIComponent(service.title)}`}
                      className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Request a quotation for this
                      <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-navy-950">Included in every project</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-4 text-[0.9375rem] text-gray-900 shadow-card"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-accent-500" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-navy-950">{sizeTable.caption}</h2>
          <div className="table-scroll mt-5 rounded-card border border-gray-200 bg-white shadow-card">
            <table className="w-full min-w-[36rem] border-collapse text-left text-[0.9375rem]">
              <caption className="sr-only">{sizeTable.caption}</caption>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Measure</span>
                  </th>
                  {sizeTable.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-gray-600"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeTable.rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-200 last:border-0">
                    <th scope="row" className="whitespace-nowrap px-5 py-4 font-medium text-navy-950">
                      {row.label}
                    </th>
                    <td className="px-5 py-4 text-gray-600">{row.small}</td>
                    <td className="px-5 py-4 text-gray-600">{row.large}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FinePrint className="mt-4" />
        </section>

        <section className="mt-14 rounded-card border border-gray-200 bg-gray-50 p-6 md:p-8">
          <h2 className="text-lg font-bold text-navy-950">Built on technology you can hire for</h2>
          <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-gray-600">{technology.line}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {technology.items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-gray-900"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

      </div>

      <CtaBand
        heading="Tell us which service fits."
        body="If you are not sure, describe the problem instead — we will tell you what it takes."
      />
    </>
  );
}
