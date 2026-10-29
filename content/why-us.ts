import {
  Boxes,
  Code2,
  Handshake,
  Layers,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Timer,
  UserRoundCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Reason = { title: string; body: string; icon: LucideIcon };

export const reasons: Reason[] = [
  {
    title: "Built around your workflow",
    body: "We start with how your business runs, not a template. The screens your team uses are the screens your work actually needs.",
    icon: Boxes,
  },
  {
    title: "Defined delivery times",
    body: "15 business days for small systems. 60 to 90 days for larger ones. The timeline is written into the scope before work starts.",
    icon: Timer,
  },
  {
    title: "One accountable team",
    body: "The people who scope your project are the people who build it. You are not handed between a salesperson and a delivery team.",
    icon: UserRoundCheck,
  },
  {
    title: "Plain-English communication",
    body: "No jargon, no surprises. A written scope before work starts, and progress updates you can read without a translator.",
    icon: MessageSquare,
  },
  {
    title: "Secure by design",
    body: "Role-based access, protected data and managed cloud infrastructure. Your team sees what they need to see, and nothing else.",
    icon: ShieldCheck,
  },
  {
    title: "Built to grow",
    body: "Architected to handle 1,000+ users when your business needs it, so a good year does not become a technical problem.",
    icon: Layers,
  },
  {
    title: "Mobile-ready from day one",
    body: "Every screen is designed for phones first, because that is where your staff and customers already are.",
    icon: Smartphone,
  },
  {
    title: "Modern, maintainable technology",
    body: "Next.js, React, Supabase and Vercel are widely supported, so you are never locked into obscure tools or a single specialist.",
    icon: Code2,
  },
];

export const comparison = {
  columns: ["Custom system", "Spreadsheets", "Off-the-shelf software"] as const,
  rows: [
    {
      label: "Fits your workflow",
      custom: "Yes — designed around your process",
      spreadsheets: "Only as far as files allow",
      offTheShelf: "You adapt to the product",
    },
    {
      label: "Scales with you",
      custom: "Designed for 1,000+ users",
      spreadsheets: "Breaks as files and people grow",
      offTheShelf: "Depends on the vendor's tiers",
    },
    {
      label: "Integrates your data",
      custom: "One system, one source of truth",
      spreadsheets: "Copies and versions multiply",
      offTheShelf: "Limited to what the vendor offers",
    },
    {
      label: "Ongoing license fees",
      custom: "No per-seat license",
      spreadsheets: "Low, but paid in staff time",
      offTheShelf: "Monthly, per user",
    },
    {
      label: "Control over features",
      custom: "You decide what gets built",
      spreadsheets: "Constrained by the tool",
      offTheShelf: "A roadmap you do not own",
    },
  ],
} as const;

export const commitments = [
  "A free first consultation",
  "A written scope before any work",
  "Weekly progress updates during the build",
  "A clear handover at the end",
] as const;

export const whyPage = {
  title: "Why business owners choose us.",
  subtitle: "Because you need a system that works, delivered on time, by people who answer.",
  commitmentsHeading: "Our commitments",
  icon: Handshake,
} as const;
