import type { Metadata } from "next";
import { finalCta } from "@/content/home";
import { miniFaq } from "@/content/faq";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { ProofSection } from "@/components/site/proof-section";
import { FaqPreview } from "@/components/home/faq-preview";
import { HomeHero } from "@/components/home/hero";
import { Industries } from "@/components/home/industries";
import { PainPoints } from "@/components/home/pain-points";
import { ProcessPreview } from "@/components/home/process-preview";
import { ReasonsPreview } from "@/components/home/reasons-preview";
import { ServicesPreview } from "@/components/home/services-preview";
import { SolutionsPreview } from "@/components/home/solutions-preview";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Resort Systems & Offline Software",
  description:
    "Custom systems for resorts and hotels — bookings, front desk, housekeeping, POS — plus offline software that works with no internet.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PainPoints />
      <ServicesPreview />
      <SolutionsPreview />
      <ProcessPreview />
      <ReasonsPreview />
      <ProofSection />
      <Industries />
      <FaqPreview />
      <CtaBand heading={finalCta.heading} body={finalCta.body} buttonLabel={finalCta.button} />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(miniFaq)]} />
    </>
  );
}
