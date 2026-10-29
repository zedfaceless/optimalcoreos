export type Faq = { question: string; answer: string };

/**
 * §7.8. Question 1–6 are reused on How We Work and Request Quote; the whole list
 * appears here and drives the FAQPage JSON-LD.
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
export const processFaq = faqs.slice(0, 6);
