import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { reasonsPreview } from "@/content/home";
import { IconTile } from "@/components/ui/badge";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

/** Four of the eight reasons (§7.6). The rest are on Why Choose Us. */
export function ReasonsPreview() {
  return (
    <section className="section-y border-y border-gray-200 bg-gray-50">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Why choose us"
            title="Built to be handed over, not held hostage."
            body="One team from the first conversation to the last fix. You own the system and the data in it."
          />
          <Link
            href="/why-us"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            All the reasons
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {reasonsPreview.map((reason, index) => (
            <li key={reason.title}>
              <Reveal delay={index * 60} className="h-full">
                <div className="flex h-full gap-4 rounded-card border border-gray-200 bg-white p-6 shadow-card">
                  <IconTile icon={reason.icon} />
                  <div>
                    <h3 className="text-base font-bold text-navy-950">{reason.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-gray-600">{reason.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
