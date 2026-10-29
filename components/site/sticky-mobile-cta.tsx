"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTA } from "@/content/site";

/**
 * The mobile-only bar (§5.6). It appears after the hero, hides on the quote pages
 * (where the form is the next thing the visitor wants), and leaves room for the
 * iPhone home indicator.
 */
export function StickyMobileCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hidden = pathname.startsWith("/request-quote");

  useEffect(() => {
    if (hidden) return;
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-[120%]"
      }`}
      aria-hidden={visible ? undefined : true}
    >
      <Link
        href={CTA.quotePath}
        tabIndex={visible ? undefined : -1}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand-600 text-[0.9375rem] font-semibold text-white"
      >
        {CTA.primary}
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}
