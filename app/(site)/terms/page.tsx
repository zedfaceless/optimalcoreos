import type { Metadata } from "next";
import { LegalDocument } from "@/components/site/legal-document";
import { legalUpdated, termsSections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms that apply to this website, what a quote request does and does not create, and how delivery timelines are confirmed.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of use"
      intro="What applies when you use this site, and what submitting a request does and does not commit either of us to."
      path="/terms"
      sections={termsSections()}
      updated={legalUpdated()}
      counterpart={{ label: "Read the privacy policy", href: "/privacy" }}
    />
  );
}
