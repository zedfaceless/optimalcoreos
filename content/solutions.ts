import { DELIVERY } from "@/content/site";

export type SolutionSize = "small" | "large";

export type Solution = {
  /** Anchor id, e.g. `/solutions#inventory-and-pos`. */
  id: string;
  number: number;
  problem: string;
  system: string;
  outcomes: [string, string, string];
  size: SolutionSize;
  art: "inventory" | "orders" | "invoicing" | "team" | "website" | "field" | "mvp" | "reporting";
  alt: string;
};

const SMALL = `Small system · ${DELIVERY.small}`;
const LARGE = `Larger system · ${DELIVERY.large}`;

export function solutionTimeline(size: SolutionSize): string {
  return size === "small" ? SMALL : LARGE;
}

export const solutions: Solution[] = [
  {
    id: "inventory-and-pos",
    number: 1,
    problem: "I can't tell what's in stock.",
    system: "Inventory & Point-of-Sale System",
    outcomes: ["Real-time stock counts", "Low-stock alerts", "Sales and daily reports"],
    size: "small",
    art: "inventory",
    alt: "Inventory screen with a product list, stock quantity bars, and a red low-stock badge.",
  },
  {
    id: "orders-and-bookings",
    number: 2,
    problem: "Orders and bookings live in chat messages.",
    system: "Order & Booking Management",
    outcomes: ["One list of every order", "Status tracking", "Automatic confirmations"],
    size: "small",
    art: "orders",
    alt: "Order board with three columns: New, In progress, Completed.",
  },
  {
    id: "invoicing-and-books",
    number: 3,
    problem: "Billing and records are manual.",
    system: "Invoicing & Bookkeeping System",
    outcomes: ["Faster invoices", "Fewer errors", "Owner-ready summaries"],
    size: "small",
    art: "invoicing",
    alt: "Invoice preview next to a monthly summary chart.",
  },
  {
    id: "multi-branch",
    number: 4,
    problem: "My staff and branches aren't aligned.",
    system: "Multi-branch / Team Management",
    outcomes: ["Roles and permissions", "Branch-level reports", "Activity history"],
    size: "large",
    art: "team",
    alt: "Org tree showing an owner, two branches and staff with role badges.",
  },
  {
    id: "business-website",
    number: 5,
    problem: "My website doesn't bring in customers.",
    system: "Business Website & Lead Capture",
    outcomes: ["Clear structure", "Fast on phones", "Inquiry forms that reach you instantly"],
    size: "small",
    art: "website",
    alt: "Website layout wireframe on a laptop and a phone with a contact form highlighted.",
  },
  {
    id: "field-app",
    number: 6,
    problem: "My team works in the field.",
    system: "Mobile-Ready Field App (PWA)",
    outcomes: ["Works on phones", "Capture data on site", "Syncs to the main system"],
    size: "small",
    art: "field",
    alt: "Phone held in a hand showing a checklist and a camera capture button.",
  },
  {
    id: "mvp",
    number: 7,
    problem: "I need an MVP before I spend big.",
    system: "Rapid Product Build (MVP)",
    outcomes: ["Working product quickly", "Real users test early", "Room to grow"],
    size: "small",
    art: "mvp",
    alt: "Minimal path graphic going from sketch to working app in three connected steps.",
  },
  {
    id: "dashboards",
    number: 8,
    problem: "I need to see my numbers.",
    system: "Reporting & Dashboards",
    outcomes: ["Live KPIs", "Exportable reports", "One source of truth"],
    size: "large",
    art: "reporting",
    alt: "Dashboard with four KPI tiles and a line chart.",
  },
];

export const solutionsPage = {
  title: "Real business problems. Practical systems.",
  subtitle: "Find your situation below. Each one is a system we can design and deliver.",
  ctaHeading: "Don't see your situation? Describe it.",
  ctaBody: "A short conversation is usually enough to tell you what a system would take.",
} as const;
