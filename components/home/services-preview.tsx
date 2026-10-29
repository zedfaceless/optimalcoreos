import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { serviceCards } from "@/content/home";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceArt } from "@/components/site/service-art";
import { Reveal } from "@/components/site/reveal";

/** The three things we sell (§7.3). Each card links to its section on Services. */
export function ServicesPreview() {
  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow="What we build"
          title="Three kinds of work, one team."
          body="A system, a website, or both — designed together so your data does not stop at the edge of the screen."
        />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {serviceCards.map((card, index) => (
            <li key={card.key}>
              <Reveal delay={index * 70} className="h-full">
                <article className="flex h-full flex-col rounded-card border border-gray-200 bg-white p-4 shadow-card transition-transform duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lift">
                  <ServiceArt art={card.key} alt={card.alt} className="h-40" />
                  <div className="flex flex-1 flex-col p-2 pt-5">
                    <h3 className="text-lg font-bold text-navy-950">{card.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-600">{card.description}</p>
                    <ul className="mt-4 space-y-1.5">
                      {card.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="mt-0.5 size-4 shrink-0 text-accent-500" strokeWidth={2.5} aria-hidden="true" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={card.href}
                      className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      See what is included
                      <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
