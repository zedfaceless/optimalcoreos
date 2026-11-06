export type ServiceArt = "systems" | "website" | "pwa" | "offline";

export type Service = {
  id: string;
  title: string;
  short: string;
  intro: string;
  /** Optional plain-English note rendered under the intro — used where a card needs qualifying. */
  note?: string;
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
    note: "Most of this work is for resorts and hospitality: room and booking management, front desk and check-in/out, housekeeping and maintenance tracking, restaurant or bar POS, kitchen and supply inventory, activity and tour bookings, staff scheduling, billing, and owner dashboards across the whole property.",
    examples:
      "Inventory trackers, point of sale, resort front desk and housekeeping, multi-branch operations, reporting dashboards.",
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
  {
    id: "offline-and-desktop",
    title: "Offline & Desktop Software",
    short:
      "Software that does its job with no internet at all — on a computer in the office, on your own local network, or on a device that syncs when a connection returns.",
    intro:
      "Built for places where the connection is weak, expensive or missing: remote resorts and islands, farms, warehouses, field sites, clinics and schools. A desktop app installed on your machines, a system running on the local network with no outside line, or an offline-first app that stores work on the device and syncs to the cloud when it can.",
    note: "A PWA is a website that installs to a phone and still needs a connection for most of its work. True offline software keeps running with the internet unplugged — that difference is the whole point of this service.",
    examples:
      "Front desk that keeps taking bookings during an outage, stock and sales on the local network, field and site forms, clinic records in low-signal areas.",
    deliverables: [
      "A desktop or local-network install, set up on your machines",
      "Offline storage that survives a closed laptop or a power cut",
      "Sync to the cloud, or between devices, when a connection returns",
      "A clear conflict rule for records edited in two places",
      "Installation, training and handover",
    ],
    art: "offline",
    alt: "Desktop window listing records saved on the device, with an offline badge and a pending-sync count",
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
  subtitle: "Four kinds of work. One accountable team.",
} as const;
