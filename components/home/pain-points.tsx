import { painPoints } from "@/content/home";
import { IconTile } from "@/components/ui/badge";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

/** The problem band (§7.2). Four symptoms, no blame, and no promised fix yet. */
export function PainPoints() {
  return (
    <section className="section-y border-y border-gray-200 bg-gray-50">
      <div className="shell">
        <SectionHeading
          eyebrow="The everyday reality"
          title="Does this sound familiar?"
          body="Most owners do not need more software. They need the software they already rely on to stop fighting itself."
          align="center"
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point, index) => (
            <li key={point.title}>
              <Reveal delay={index * 60} className="h-full">
                <div className="h-full rounded-card border border-gray-200 bg-white p-6 shadow-card">
                  <IconTile icon={point.icon} />
                  <h3 className="mt-4 text-base font-bold text-navy-950">{point.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-gray-600">{point.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
