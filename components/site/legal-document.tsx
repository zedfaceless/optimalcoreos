import Link from "next/link";
import type { LegalSection } from "@/content/legal";
import { PageHero } from "@/components/site/page-hero";
import { getSiteSettings } from "@/lib/site/settings";

/**
 * Privacy and Terms are the same shape — eyebrow, H1, numbered sections, an
 * optional effective date — so they share one renderer and cannot drift apart in
 * spacing or heading levels.
 */
export function LegalDocument({
  eyebrow,
  title,
  intro,
  path,
  sections,
  updated,
  counterpart,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  path: string;
  sections: LegalSection[];
  updated: string | null;
  counterpart: { label: string; href: string };
}) {
  const settings = getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        body={intro}
        crumbs={[
          { name: "Home", href: "/" },
          { name: title, href: path },
        ]}
      />

      <section className="shell py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.28fr_0.72fr] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="On this page">
              <ol className="space-y-2 text-[0.875rem]">
                {sections.map((section, index) => (
                  <li key={section.heading}>
                    <a href={`#section-${index + 1}`} className="text-gray-600 hover:text-brand-700">
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-6 space-y-1 border-t border-gray-200 pt-4 text-[0.8125rem] text-gray-600">
              {updated ? <p>Effective {updated}</p> : null}
              <p>
                Questions? Email{" "}
                <a href={`mailto:${settings.email}`} className="font-medium text-brand-700 hover:text-brand-600">
                  {settings.email}
                </a>
                .
              </p>
              <p>
                <Link href={counterpart.href} className="font-medium text-brand-700 hover:text-brand-600">
                  {counterpart.label}
                </Link>
              </p>
            </div>
          </aside>

          <article className="measure space-y-8">
            {sections.map((section, index) => (
              <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-navy-950">
                  {index + 1}. {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[0.9375rem] leading-relaxed text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
