import "server-only";
import { getSiteSettings } from "@/lib/site/settings";

export type LegalSection = { heading: string; paragraphs: string[] };

/**
 * Plain-language drafts. The PRD asks for a clearly written draft at launch and a
 * review by counsel before it is treated as final (§7.9). Nothing here claims a
 * certification or a jurisdiction that has not been confirmed.
 */
/**
 * The effective date is a `[PLACEHOLDER]`, so it is only rendered when
 * `NEXT_PUBLIC_LEGAL_UPDATED` is set. A hard-coded date would be a claim about a
 * review nobody has done; an absent line is honest.
 */
export function legalUpdated(): string | null {
  const raw = process.env.NEXT_PUBLIC_LEGAL_UPDATED?.trim();
  return raw ? raw : null;
}

export function privacySections(): LegalSection[] {
  const settings = getSiteSettings();

  return [
    {
      heading: "What this policy covers",
      paragraphs: [
        "This policy explains what information Optimal Core OS collects through this website, why we collect it, where it is stored and how you can ask us to remove it.",
        "It applies to this website only. A system we build for a client is governed by that client's own agreement.",
      ],
    },
    {
      heading: "What the forms collect",
      paragraphs: [
        "The quote request form collects your name, business name, email address, and optionally your phone number, role, country, project details, expected number of users, timeline preference, budget range, preferred meeting times, timezone and meeting platform.",
        "The contact form collects your name, email address and message.",
        "We also record how you reached the site (campaign parameters and the referring page) and a hashed version of your IP address. The raw IP address is not stored.",
      ],
    },
    {
      heading: "Where your information is stored",
      paragraphs: [
        "Form submissions and their related records are stored in a Postgres database hosted by Supabase. Access is restricted to the Optimal Core OS team through an authenticated admin area, and to no one else.",
        "Transactional email is delivered through Resend. Those emails contain the details you submitted; they are sent to our team and, for a quote request, a confirmation is sent to you.",
      ],
    },
    {
      heading: "Analytics",
      paragraphs: [
        "We use Vercel Analytics and Speed Insights, which are cookieless and do not build a profile of you across other websites. We do not run advertising pixels, and we do not sell data.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        `We keep quote requests and contact messages for ${settings.retentionMonths} months so we can follow up on a conversation, then delete or anonymise them. You can ask us to delete your information sooner.`,
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        `You can ask to see, correct or delete the information we hold about you by emailing ${settings.email}. We will respond within a reasonable period and will tell you what we did.`,
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "If this policy changes, the updated version appears on this page with a new effective date.",
      ],
    },
  ];
}

export function termsSections(): LegalSection[] {
  return [
    {
      heading: "Using this website",
      paragraphs: [
        "This website describes services offered by Optimal Core OS and lets you request a consultation. By using it you agree to these terms.",
        "The content is provided for information. Descriptions of services, timelines and deliverables are indicative until they are agreed in writing in a project scope or quotation.",
      ],
    },
    {
      heading: "Requests are not a contract",
      paragraphs: [
        "Submitting the quote request or contact form starts a conversation. It does not create a contract, reserve a delivery slot or oblige either party to proceed.",
        "A project begins only when a written scope and quotation have been accepted.",
      ],
    },
    {
      heading: "Timelines",
      paragraphs: [
        "Where a delivery time is stated, it begins once the scope is agreed in writing. Exact delivery dates are confirmed in the quotation.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "The content of this website belongs to Optimal Core OS. Ownership of a delivered system is set out in the agreement for that project.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "Do not attempt to disrupt the site, submit false or unlawful information, or use the forms to send unsolicited advertising.",
      ],
    },
    {
      heading: "Limits",
      paragraphs: [
        "The website is provided as is. To the extent the law allows, Optimal Core OS is not liable for indirect or consequential loss arising from use of the website.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["Questions about these terms can be sent through the contact page."],
    },
  ];
}
