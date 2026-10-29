import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The wordmark plus the "core" glyph: a brand-blue rounded square holding a white
 * filled circle inside a ring (§16). Drawn inline so it is sharp at every size and
 * costs one request fewer.
 */
export function Logo({
  tone = "dark",
  className,
  href = "/",
}: {
  tone?: "dark" | "light";
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label="Optimal Core OS — home"
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="9" fill="#1F6FEB" />
        <circle cx="16" cy="16" r="8.4" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.85" />
        <circle cx="16" cy="16" r="3.4" fill="#FFFFFF" />
      </svg>
      <span
        className={cn(
          "whitespace-nowrap font-display text-[1.0625rem] font-extrabold tracking-[-0.02em]",
          tone === "dark" ? "text-navy-950" : "text-white",
        )}
      >
        Optimal Core OS
      </span>
    </Link>
  );
}
