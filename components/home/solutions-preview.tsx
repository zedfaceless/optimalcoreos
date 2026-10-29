import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { solutions, solutionTimeline } from "@/content/solutions";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

/**
 * The situation picker (§7.4). The owner's own sentence comes first, because that
 * is the sentence they recognise; the system name is the answer underneath it.
 */
export function SolutionsPreview() {
  return (
    <section className="section-y border-y border-gray-200 bg-gray-50">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Find your situation"
            title="Start from the problem, not the product."
            body="Each situation below is a system we can design and deliver. Pick the one that sounds like your week."
          />
          <Link
            href="/solutions"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            All solutions
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {solutions.map((solution, index) => (
            <li key={solution.id}>
              <Reveal delay={(index % 2) * 60} className="h-full">
                <Link
                  href={`/solutions#${solution.id}`}
                  className="group flex h-full flex-col rounded-card border border-gray-200 bg-white p-5 shadow-card transition-transform duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lift"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                      {solution.number}
                    </span>
                    <div>
                      <p className="font-display text-[1.0625rem] font-bold leading-snug text-navy-950">
                        “{solution.problem}”
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-brand-600">{solution.system}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-200 pt-3">
                    {solution.outcomes.map((outcome) => (
                      <span key={outcome} className="text-[0.8125rem] text-gray-600">
                        {outcome}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-gray-600">
                    {solutionTimeline(solution.size)}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
