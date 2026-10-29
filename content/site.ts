/**
 * Brand-level constants and the delivery promise.
 *
 * The promise is worded once here and imported by Home, Services, How We Work and
 * Request Quote so the sentence cannot drift between pages (acceptance criterion
 * AC-05 compares the four pages by eye and by grep).
 */
export const BRAND = {
  name: "Optimal Core OS",
  positioning: "Custom software built around your business — delivered in weeks, not years.",
  supportingLine:
    "Systems, websites and mobile-ready apps designed for how you actually work. Small systems in 15 business days. Larger platforms in 60–90 days.",
} as const;

export const CTA = {
  primary: "Book a Free Consultation",
  secondary: "See How We Work",
  quotePath: "/request-quote",
  processPath: "/how-we-work",
} as const;

export const DELIVERY = {
  small: "15 business days",
  large: "60 to 90 days",
  smallHeading: "Small systems",
  largeHeading: "Larger systems (1,000+ users)",
  smallFull: "Small systems — 15 business days",
  largeFull: "Larger systems (1,000+ users) — 60 to 90 days",
  /**
   * Required fine print (§3.4). It appears beneath every timeline claim on How We
   * Work and Request Quote. It is short on purpose: a customer reads it, a lawyer
   * approves it, and nobody has to scroll to find it.
   */
  finePrint:
    "Timelines begin once the scope is agreed in writing. Exact delivery dates are confirmed in your quotation.",
} as const;

export const PROMISES = {
  response: "We reply within 1 business day.",
  freeConsultation: "Free, no-obligation discussion",
  quotationAfterDiscovery: "Quotation prepared after we understand your needs",
} as const;
