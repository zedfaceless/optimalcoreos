import { proof } from "@/content/proof";

/**
 * §8 of the PRD: no invented testimonials, logos or counts. While `proof` is empty
 * this returns `null`, so the page has no credibility band at all rather than a
 * placeholder one. Filling `content/proof.ts` turns it on with no layout change.
 */
export function ProofSection() {
  if (proof.length === 0) return null;

  return (
    <section className="section-y border-y border-gray-200 bg-gray-50">
      <div className="shell">
        <h2 className="eyebrow">In their words</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proof.map((item) => (
            <li
              key={`${item.attribution}-${item.permissionOn}`}
              className="rounded-card border border-gray-200 bg-white p-6 shadow-card"
            >
              <blockquote className="text-[1.0625rem] leading-relaxed text-navy-950">
                “{item.quote}”
              </blockquote>
              <p className="mt-4 text-sm font-medium text-gray-600">{item.attribution}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
