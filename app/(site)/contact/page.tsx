import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageSquare, Phone } from "lucide-react";
import { contactPage } from "@/content/quote";
import { CTA, PROMISES } from "@/content/site";
import { CtaBand } from "@/components/site/cta-band";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { buttonClass } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site/settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us what is slowing your business down. Email, phone or a short message — we reply within 1 business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const settings = getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={contactPage.heading}
        body={contactPage.intro}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      <section className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
        <div>
          <h2 className="text-xl font-bold text-navy-950">{contactPage.formHeading}</h2>
          <p className="mt-2 text-[0.9375rem] text-gray-600">{PROMISES.response}</p>
          <div className="mt-6">
            <ContactForm contactEmail={settings.email} />
          </div>
        </div>

        <aside className="space-y-4 lg:pt-11">
          <div className="rounded-card border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-base font-bold text-navy-950">{contactPage.infoHeading}</h2>
            <ul className="mt-4 space-y-4 text-[0.9375rem]">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" strokeWidth={2} aria-hidden="true" />
                <span>
                  <span className="block text-[0.8125rem] font-medium text-gray-600">Email</span>
                  <a href={`mailto:${settings.email}`} className="font-medium text-navy-950 hover:text-brand-600">
                    {settings.email}
                  </a>
                </span>
              </li>
              {settings.phone ? (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" strokeWidth={2} aria-hidden="true" />
                  <span>
                    <span className="block text-[0.8125rem] font-medium text-gray-600">Phone</span>
                    <a href={`tel:${settings.phone}`} className="font-medium text-navy-950 hover:text-brand-600">
                      {settings.phone}
                    </a>
                  </span>
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" strokeWidth={2} aria-hidden="true" />
                <span>
                  <span className="block text-[0.8125rem] font-medium text-gray-600">Hours</span>
                  <span className="font-medium text-navy-950">{settings.hours}</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-card border border-brand-600/25 bg-brand-50 p-6">
            <MessageSquare className="size-5 text-brand-600" strokeWidth={2} aria-hidden="true" />
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-navy-950">{contactPage.callout}</p>
            <Link href={CTA.quotePath} className={buttonClass("primary", "sm", "mt-4 w-full")}>
              {CTA.primary}
            </Link>
          </div>
        </aside>
      </section>

      <CtaBand
        heading="Prefer to talk it through?"
        body="Pick a time in your own timezone and we will come to the meeting with questions, not a pitch."
      />
    </>
  );
}
