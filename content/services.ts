export type ServiceArt = "systems" | "website" | "pwa";

export type Service = {
  id: string;
  title: string;
  short: string;
  intro: string;
  examples: string;
  deliverables: string[];
  art: ServiceArt;
  alt: string;
};

export const services: Service[] = [
  {
    id: "custom-business-systems",
    title: "Custom Business Systems",
    short:
      "Internal tools that replace the spreadsheet, the notebook and the group chat with one place your team can trust.",
    intro:
      "Inventory and point of sale, bookkeeping, scheduling, multi-branch operations and reporting — built to match the way your business already runs, then improved where it should.",
    examples: "Inventory trackers, point of sale, booking systems, multi-branch operations, reporting dashboards.",
    deliverables: [
      "A written requirements document",
      "Designed screens you can review before build",
      "The working system",
      "User roles and permissions",
      "Data import from your current files",
      "Training and handover",
      "Deployment and go-live support",
    ],
    art: "systems",
    alt: "Linked boxes representing inventory, sales and accounting modules",
  },
  {
    id: "business-websites",
    title: "Business Websites & Platforms",
    short:
      "A site that explains what you do, loads fast on a phone and turns visitors into enquiries you actually receive.",
    intro:
      "Marketing sites, lead capture, service and product catalogues, and booking-request sites — built on the same foundation as our systems, so a website can grow into a platform.",
    examples: "Company websites, service catalogues, booking-request sites, lead capture pages.",
    deliverables: [
      "Responsive design for phone, tablet and desktop",
      "A search-friendly foundation with clean metadata",
      "Contact and quote forms with email delivery",
      "Analytics, so you can see what works",
      "Hosting setup and deployment",
    ],
    art: "website",
    alt: "Browser window with a navigation bar and hero block",
  },
  {
    id: "mobile-ready-apps",
    title: "Mobile-Ready Apps (PWA)",
    short:
      "Phone-first applications your staff or customers can install and open like an app — no app store, no second codebase.",
    intro:
      "Field data capture, staff tools and customer-facing web apps, built as Progressive Web Apps: they install to the home screen, work on any modern phone, and stay in step with your main system.",
    examples: "Field inspection apps, delivery checklists, staff tools, customer-facing order apps.",
    deliverables: [
      "A mobile-first interface, designed for one hand",
      "Offline-friendly caching where it helps",
      "Install-to-home-screen support",
      "Secure login and role-based access",
    ],
    art: "pwa",
    alt: "Smartphone showing an installable app icon on a home screen",
  },
];

export const included = [
  "Plain-English scope",
  "Secure login & roles",
  "Mobile-friendly design",
  "Data stored in a managed cloud database",
  "Deployment & go-live support",
  "Handover & training",
] as const;

export const sizeTable = {
  caption: "Project sizes at a glance",
  columns: ["Small system", "Larger system"] as const,
  rows: [
    { label: "Typical users", small: "Up to a few hundred", large: "1,000+" },
    { label: "Delivery", small: "15 business days", large: "60–90 days" },
    {
      label: "Examples",
      small: "Inventory tracker, booking system, business website",
      large: "Multi-branch platform, high-volume operations system",
    },
    { label: "Pricing", small: "Quotation after discovery", large: "Quotation after discovery" },
  ],
} as const;

export const technology = {
  items: ["Next.js", "React", "Supabase", "Vercel"] as const,
  line:
    "Modern, proven technology with managed hosting, so your system stays fast, secure and maintainable.",
} as const;

export const servicesPage = {
  title: "What we build.",
  subtitle: "Three kinds of work. One accountable team.",
} as const;
