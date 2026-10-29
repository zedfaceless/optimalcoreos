import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { miniFaq } from "@/content/faq";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { SectionHeading } from "@/components/site/section-heading";

/** Three questions on the home page; the rest are answered on How We Work. */
export function FaqPreview() {
  return (
    <section className="section-y border-t border-gray-200 bg-gray-50">
      <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Questions"
            title="The three we are asked first."
            body="If your question is not here, ask it in the meeting — the first conversation is free."
          />
          <Link
            href="/how-we-work#faq"
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Read every question
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <FaqAccordion items={miniFaq} />
      </div>
    </section>
  );
}
