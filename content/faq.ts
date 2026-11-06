export type Faq = { question: string; answer: string };

/**
 * §7.8. The first three appear on the home page; the whole list appears on How We
 * Work and drives the FAQPage JSON-LD.
 */
export const faqs: Faq[] = [
  {
    question: "How long does it take?",
    answer:
      "Small systems are delivered in 15 business days. Larger systems that serve 1,000 or more users take 60 to 90 days. Timelines begin once scope is agreed in writing.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Every project is studied individually. We prepare a quotation after you describe what you want to solve. Start with a free virtual meeting.",
  },
  {
    question: "Can you build for my resort?",
    answer:
      "Yes. We build for small hotels, beach resorts, homestays and travel operators: room and booking management, front desk and check-in/out, housekeeping and maintenance tracking, restaurant, bar or cafe POS, kitchen and supply inventory, activity and tour bookings, staff scheduling, billing, and owner dashboards across the property. Most properties start with one piece — usually bookings or the front desk — and add the rest afterwards.",
  },
  {
    question: "Will it work without internet?",
    answer:
      "Yes, when your site needs it. A PWA installs to a phone but still needs a connection for most of its work; true offline software keeps running with the internet unplugged — a desktop app on your own computers, a system on your local network, or an offline-first app that saves work on the device and syncs when a connection returns. We confirm which one fits your site before quoting.",
  },
  {
    question: "What do I need to prepare for the meeting?",
    answer:
      "A short description of the problem, how your team works today, and what a good result looks like. Screenshots or sample spreadsheets help but are optional.",
  },
  {
    question: "Will it work on phones?",
    answer:
      "Yes. Every system is designed mobile-first and works in the phone browser. We can also make it installable like an app.",
  },
  {
    question: "Can the system grow with my business?",
    answer: "Yes. Larger systems are designed for 1,000+ users.",
  },
  {
    question: "Who owns the system?",
    answer: "You do. Ownership terms are written in your agreement.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Systems use secure login, role-based access and managed cloud infrastructure.",
  },
  {
    question: "What happens after launch?",
    answer: "Handover, training and a support period defined in your quotation.",
  },
];

export const miniFaq = faqs.slice(0, 3);
/**
 * Every question. This used to be `faqs.slice(0, 6)`, which meant a question could be
 * written here and never appear on the page the home section links to.
 */
export const processFaq = faqs;
