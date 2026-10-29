/**
 * Structured data helpers (§12.2). Kept as plain objects so a test can assert the
 * shape without rendering a page, and so no page hand-writes JSON.
 */
import { BRAND } from "@/content/site";
import { faqs, type Faq } from "@/content/faq";
import { absoluteUrl, siteUrl } from "@/lib/site/config";
import { getSiteSettings } from "@/lib/site/settings";

export type Crumb = { name: string; href: string };

export function organizationJsonLd() {
  const settings = getSiteSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: siteUrl(),
    description: BRAND.positioning,
    email: settings.email,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    areaServed: "Worldwide",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: siteUrl(),
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}

export function faqJsonLd(items: Faq[] = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * `<` is escaped because a `</script>` inside a string would end the tag early.
 * The JSON stays valid: `\u003c` is the same character to a parser.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
