import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { QUOTE_NEXT_STEPS, quotePage } from "@/content/quote";
import { CTA, DELIVERY, PROMISES } from "@/content/site";
import { QuoteWizard } from "@/components/forms/quote-wizard";
import { FinePrint } from "@/components/site/fine-print";
import { PageHero } from "@/components/site/page-hero";
import { getSiteSettings } from "@/lib/site/settings";

export const metadata: Metadata = {
  title: "Request a free quote",
  description:
    "Three short steps: tell us about your business, what you want to fix and when to meet. Free, no-obligation consultation, reply within 1 business day.",
  alternates: { canonical: CTA.quotePath },
};

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[] }>;
}) {
  const params = await searchParams;
  const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const settings = getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Free consultation"
        title={quotePage.heading}
        body={quotePage.intro}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Request a quote", href: CTA.quotePath },
        ]}
      />

      <section className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div>
          <QuoteWizard initialProjectType={topic} contactEmail={settings.email} />
          <div className="mt-4 space-y-1">
            <p className="text-[0.8125rem] text-gray-600">
              {DELIVERY.smallFull} for small systems; {DELIVERY.largeFull.toLowerCase()} for larger platforms.
            </p>
            <FinePrint />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-base font-bold text-navy-950">What you get</h2>
            <ul className="mt-4 space-y-3 text-[0.9375rem] text-gray-900">
              {[PROMISES.freeConsultation, PROMISES.response, PROMISES.quotationAfterDiscovery].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-accent-600"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-gray-200 bg-white p-6">
            <h2 className="text-base font-bold text-navy-950">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {QUOTE_NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[0.75rem] font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-semibold text-navy-950">{step.title}</span>
                    <span className="mt-0.5 block text-[0.875rem] leading-relaxed text-gray-600">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[0.8125rem] leading-relaxed text-gray-600">{quotePage.meetingHoursNote}</p>
          </div>

          <p className="px-1 text-[0.8125rem] leading-relaxed text-gray-600">
            Prefer email? Write to{" "}
            <a href={`mailto:${settings.email}`} className="font-medium text-brand-700 hover:text-brand-600">
              {settings.email}
            </a>{" "}
            and we will reply the same way.
          </p>
        </aside>
      </section>
    </>
  );
}
