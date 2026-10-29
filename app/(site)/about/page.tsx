import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, MapPin } from "lucide-react";
import { aboutPage } from "@/content/about";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Optimal Core OS is a software studio for business owners: clarity, reliability, ownership and craft, with scope, timeline and price written down before work starts.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={aboutPage.title}
        body={aboutPage.intro}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
        actions={
          <Link href="/contact" className={buttonClass("secondary", "md")}>
            Talk to us
          </Link>
        }
      />

      <section className="shell py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Mission</p>
            <p className="mt-3 text-[1.1875rem] leading-relaxed font-medium text-navy-950">{aboutPage.mission}</p>
          </div>
          <div className="rounded-card border border-gray-200 bg-gray-50 p-6 md:p-8">
            <p className="eyebrow">{aboutPage.approach.heading}</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-gray-600">{aboutPage.approach.body}</p>
          </div>
        </div>

        <h2 className="mt-14 text-2xl font-bold text-navy-950 sm:text-3xl">What we hold to.</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aboutPage.principles.map((principle, index) => (
            <li key={principle.title}>
              <Reveal>
                <div className="h-full rounded-card border border-gray-200 bg-white p-5 shadow-card">
                  <span className="font-display text-xs font-bold text-brand-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-navy-950">{principle.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-600">{principle.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="shell grid gap-8 py-14 md:grid-cols-2 md:py-16">
          <div>
            <h2 className="text-xl font-bold text-navy-950">{aboutPage.leadership.heading}</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-gray-600">{aboutPage.leadership.body}</p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy-950">
              <MapPin className="size-5 text-brand-600" strokeWidth={2} aria-hidden="true" />
              {aboutPage.whereWeWork.heading}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-navy-950">{aboutPage.whereWeWork.body}</p>
            <p className="mt-2 flex items-start gap-2 text-[0.9375rem] leading-relaxed text-gray-600">
              <Globe2 className="mt-0.5 size-4 shrink-0 text-gray-200" strokeWidth={2} aria-hidden="true" />
              {aboutPage.whereWeWork.detail}
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        heading="A free conversation is the whole first step."
        body="Tell us how the business runs today. We will tell you honestly whether software is the answer."
      />
    </>
  );
}
