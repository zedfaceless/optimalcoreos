import { MEETING_TIMEZONE } from "@/lib/site/meetings";

/** Form options for the quote wizard (§10.3). Pure data: no icons, no env. */

export const PROJECT_TYPES = [
  "Custom business system",
  "Business website",
  "Mobile-ready app (PWA)",
  "Inventory / POS",
  "Booking / order management",
  "Reporting & dashboards",
  "Not sure yet",
] as const;

export const EXPECTED_USERS = [
  "Just me / small team (1–10)",
  "11–50",
  "51–200",
  "201–999",
  "1,000+",
  "Not sure",
] as const;

export const TIMELINE_PREFS = [
  "As soon as possible",
  "Within 1 month",
  "1–3 months",
  "3+ months",
  "Flexible",
] as const;

/**
 * Budget bands are a `[PLACEHOLDER]` in §10.3 (currency and bands are the CEO's
 * call). These are the PHP bands the form ships with; `docs/PLACEHOLDERS.md`
 * records that they need a decision before launch.
 */
export const BUDGET_RANGES = [
  "Prefer to discuss",
  "Under ₱50,000",
  "₱50,000 – ₱150,000",
  "₱150,000 – ₱500,000",
  "₱500,000+",
  "Not sure yet",
] as const;

export const MEETING_PLATFORMS = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "any", label: "Any / you choose" },
] as const;

/**
 * What a visitor should expect after they submit the wizard. Short, and each line
 * is a thing that actually happens — no promise of a fixed price before discovery.
 */
export const QUOTE_NEXT_STEPS = [
  {
    title: "A person reads it",
    body: "Every request is read by the team, not a form robot. You get a reply within 1 business day.",
  },
  {
    title: "We meet at your time",
    body: "A free virtual meeting in the slot you chose, to ask questions and understand the work.",
  },
  {
    title: "You get a written quotation",
    body: "A scope, a price and a delivery timeline in writing. No obligation to proceed.",
  },
] as const;

export const quotePage = {
  heading: "Tell us what you want to solve",
  intro:
    "Three short steps. We use what you write here to prepare a scope and a quotation — no technical knowledge needed.",
  reassurances: [
    "Free, no-obligation discussion",
    "Reply within 1 business day",
    "Quotation prepared after we understand your needs",
  ],
  steps: ["About you", "About your project", "Book your meeting"],
  submitLabel: "Request Free Consultation",
  successHeading: "Request received",
  timezoneNote: "Shown in your timezone",
  meetingHoursNote: "Meetings run 09:00–17:00 Asia/Manila, Monday to Friday.",
  defaultTimezone: MEETING_TIMEZONE,
  consentLabel: "I agree that Optimal Core OS may contact me about this request.",
  descriptionHint:
    "What do you do today, what is slow or painful, and what would a good result look like?",
  budgetHint: "Optional. It helps us propose the right solution.",
} as const;

export const contactPage = {
  heading: "Talk to us about your business.",
  intro:
    "Tell us what is slowing your business down. We will reply with questions or a suggested next step.",
  callout: "Have a project in mind? Request a quotation and book a free virtual meeting.",
  infoHeading: "Contact details",
  formHeading: "Send a message",
} as const;
