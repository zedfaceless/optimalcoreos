"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/content/nav";
import { CTA } from "@/content/site";
import { Logo } from "@/components/site/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  /* The shadow appears after 8px of scroll. It is decoration, so it is read in a
     passive listener and never on the render path. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* A route change always closes the drawer: the tap that navigated should not
     leave a panel covering the page it opened. The comparison happens during
     render rather than in an effect, so the drawer is never painted open on the
     new route for a frame and React never has to cascade a second render. */
  const [routeAtOpen, setRouteAtOpen] = useState(pathname);
  if (routeAtOpen !== pathname) {
    setRouteAtOpen(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => focusables()[0]?.focus());

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur transition-shadow duration-200",
        scrolled && "shadow-[0_1px_2px_rgba(15,27,46,0.06),0_8px_24px_rgba(15,27,46,0.06)]",
      )}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-4">
        <Logo />

        {/* `lg:ml-auto xl:ml-0`: between 1024 and 1279 the header has no button,
            so the nav takes the free space instead of leaving a hole at the right. */}
        <nav aria-label="Primary" className="hidden lg:block lg:ml-auto xl:ml-0">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-11 items-center rounded-md px-2.5 text-[0.8125rem] font-medium transition-colors xl:px-3 xl:text-sm",
                      active ? "text-brand-600" : "text-gray-600 hover:text-gray-900",
                    )}
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2.5 -bottom-[0.0625rem] h-0.5 rounded-full bg-brand-600"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Hidden below `xl` on purpose: at 1024–1279 the seven nav labels and
              this button do not both fit — the labels broke onto two lines first.
              The drawer keeps the button and the sticky bar repeats it, so the
              header gives up the button rather than the navigation.
              `max-xl:hidden`, not `hidden`: `buttonClass` carries `inline-flex`
              itself, and in the compiled sheet `.inline-flex` follows `.hidden`,
              so a bare `hidden` loses and the phone header grew a second CTA. */}
          <Link href={CTA.quotePath} className={buttonClass("primary", "md", "max-xl:hidden")}>
            {CTA.primary}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-[10px] text-navy-950 transition-colors hover:bg-gray-50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
          >
            <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Drawer and overlay stay mounted so the slide has something to animate;
          `inert` keeps the closed panel out of the tab order and the a11y tree. */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")}>
        <div
          className={cn(
            "absolute inset-0 bg-navy-950/50 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          inert={!open}
          className={cn(
            "absolute right-0 top-0 flex h-dvh w-[19rem] max-w-[86vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-gray-200 px-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-11 items-center justify-center rounded-[10px] text-navy-950 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <X className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-3">
            <ul>
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-14 items-center rounded-[10px] px-4 text-base font-medium transition-colors",
                        active ? "bg-brand-50 text-brand-600" : "text-gray-900 hover:bg-gray-50",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href={CTA.quotePath}
              onClick={() => setOpen(false)}
              className={buttonClass("primary", "md", "w-full")}
            >
              {CTA.primary}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
