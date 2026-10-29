export type NavLink = { label: string; href: string };

/**
 * The seven nav destinations are separate routes (§5.1). The primary CTA is a
 * button, not a nav link, and lives beside them.
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Services", href: "/services" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Why Choose Us", href: "/why-us" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Why Choose Us", href: "/why-us" },
      { label: "How We Work", href: "/how-we-work" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "What we build",
    links: [
      { label: "Solutions", href: "/solutions" },
      { label: "Services", href: "/services" },
      { label: "Book a Free Consultation", href: "/request-quote" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

/** Routes the public sitemap may list. `/devside` is never one of them (§12.1). */
export const PUBLIC_ROUTES = [
  "/",
  "/solutions",
  "/services",
  "/how-we-work",
  "/why-us",
  "/about",
  "/contact",
  "/request-quote",
  "/privacy",
  "/terms",
] as const;
