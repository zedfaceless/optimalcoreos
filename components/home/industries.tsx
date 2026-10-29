import { industries } from "@/content/home";
import { SectionHeading } from "@/components/site/section-heading";

/**
 * Industries (§7.7). Ten sectors, named as nouns — no client counts, because there
 * are none to claim yet (§8).
 */
export function Industries() {
  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow="Who it is for"
          title="Businesses that run on process, paper and people."
          body="The problems are the same across trades: stock that does not add up, orders that live in chat, and numbers that arrive too late to act on."
          align="center"
        />
        <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2.5">
          {industries.map((industry) => (
            <li
              key={industry}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900"
            >
              {industry}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
