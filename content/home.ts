import {
  Boxes,
  CalendarClock,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  ScanEye,
  Timer,
  UserRoundCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const hero = {
  eyebrow: "Custom software for business owners",
  titleLead: "Software built around ",
  titleEmphasis: "your business",
  titleTail: " — not the other way around.",
  subtitle:
    "Systems, websites and mobile-ready apps designed for how you actually work. Small systems delivered in 15 business days.",
  trust: ["Plain-English scoping", "Fixed timelines", "You own your system"],
  visualAlt:
    "Illustration of a business dashboard on a laptop and a phone showing the same system, with charts, an orders table and a stock-level card.",
} as const;

export type PainPoint = { title: string; body: string; icon: LucideIcon };

export const painPoints: PainPoint[] = [
  {
    title: "Spreadsheet overload",
    body: "Data lives in files that only one person understands.",
    icon: FileSpreadsheet,
  },
  {
    title: "Disconnected tools",
    body: "Sales, stock and billing don't talk to each other.",
    icon: Boxes,
  },
  {
    title: "Manual repetition",
    body: "Staff re-type the same information every day.",
    icon: ClipboardList,
  },
  {
    title: "No clear view",
    body: "Owners wait days for numbers they need now.",
    icon: ScanEye,
  },
];

export type ServiceCard = {
  key: "systems" | "website" | "pwa";
  title: string;
  description: string;
  bullets: string[];
  href: string;
  alt: string;
};

export const serviceCards: ServiceCard[] = [
  {
    key: "systems",
    title: "Custom Business Systems",
    description:
      "Inventory, sales, billing and reporting in one place, shaped around how your team already works.",
    bullets: ["Inventory and point of sale", "Invoicing and bookkeeping", "Roles and branch reporting"],
    href: "/services#custom-business-systems",
    alt: "Linked boxes representing inventory, sales and accounting modules",
  },
  {
    key: "website",
    title: "Business Websites & Platforms",
    description:
      "A site that explains your business clearly, loads fast on a phone and turns visitors into enquiries.",
    bullets: ["Fast, mobile-first pages", "Search-friendly structure", "Enquiry forms that reach you"],
    href: "/services#business-websites",
    alt: "Browser window with a navigation bar and hero block",
  },
  {
    key: "pwa",
    title: "Mobile-Ready Apps (PWA)",
    description:
      "Phone-first applications your staff or customers can install and use like an app, without an app store.",
    bullets: ["Works in the phone browser", "Installable to the home screen", "Secure login and roles"],
    href: "/services#mobile-ready-apps",
    alt: "Smartphone showing an installable app icon on a home screen",
  },
];

export type ProcessPreviewStep = { number: number; title: string; body: string };

export const processPreview: ProcessPreviewStep[] = [
  { number: 1, title: "Discover", body: "A free virtual meeting about how your business runs today." },
  { number: 2, title: "Scope & Quote", body: "A written scope, a timeline and a clear quotation." },
  { number: 3, title: "Build", body: "Weekly progress and working software you can try." },
  { number: 4, title: "Launch & Support", body: "Deployment, handover, training and post-launch fixes." },
];

export type ReasonPreview = { title: string; body: string; icon: LucideIcon };

export const reasonsPreview: ReasonPreview[] = [
  {
    title: "Built around your workflow",
    body: "We start with how your business runs, not a template.",
    icon: Boxes,
  },
  {
    title: "Fast, defined delivery",
    body: "15 business days for small systems; 60 to 90 days for larger ones.",
    icon: Timer,
  },
  {
    title: "One accountable team",
    body: "The people who scope your project are the people who build it.",
    icon: UserRoundCheck,
  },
  {
    title: "Secure by design",
    body: "Role-based access, protected data and managed cloud infrastructure.",
    icon: LayoutDashboard,
  },
];

export const industries = [
  "Retail & Stores",
  "Distribution",
  "Clinics & Healthcare",
  "Schools & Training",
  "Logistics",
  "Food & Hospitality",
  "Manufacturing",
  "Agriculture",
  "Real Estate",
  "Professional Services",
] as const;

export const finalCta = {
  heading: "Tell us what slows your business down.",
  body: "Describe your challenge in a free virtual meeting. We will come back with a clear scope and quotation.",
  button: "Book a Free Consultation",
  icon: CalendarClock,
} as const;
