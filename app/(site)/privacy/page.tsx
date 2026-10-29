import type { Metadata } from "next";
import { LegalDocument } from "@/components/site/legal-document";
import { legalUpdated, privacySections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Optimal Core OS collects through this website, why, where it is stored, how long we keep it and how to ask us to delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy policy"
      intro="A plain-language account of what this website collects, who can see it and how to have it removed."
      path="/privacy"
      sections={privacySections()}
      updated={legalUpdated()}
      counterpart={{ label: "Read the terms of use", href: "/terms" }}
    />
  );
}
