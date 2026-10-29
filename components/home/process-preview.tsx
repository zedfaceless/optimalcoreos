import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { processPreview } from "@/content/home";
import { SectionHeading } from "@/components/site/section-heading";
import { FinePrint } from "@/components/site/fine-print";
import { Reveal } from "@/components/site/reveal";

/** The four-step preview (§7.5). The full six steps live on How We Work. */
export function ProcessPreview() {
  return (
    <section className="section-y">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="How we work"
            title="You always know what happens next."
            body="A free conversation, a written scope, weekly progress, and a launch you can plan around."
          />
          <Link
            href="/how-we-work"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            See the full process
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {processPreview.map((step, index) => (
            <li key={step.number}>
              <Reveal delay={index * 60} className="h-full">
                <div className="relative h-full rounded-card border border-gray-200 bg-white p-6 shadow-card">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-navy-950">{step.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-gray-600">{step.body}</p>
                  {index < processPreview.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-3 top-11 hidden size-6 items-center justify-center text-gray-200 lg:flex"
                    >
                      <ArrowRight className="size-4" strokeWidth={2} />
                    </span>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <FinePrint className="mt-6" />
      </div>
    </section>
  );
}
