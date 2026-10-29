import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconTile({
  icon: Icon,
  size = "md",
  tone = "light",
  className,
}: {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  className?: string;
}) {
  const box = size === "lg" ? "size-14" : size === "sm" ? "size-10" : "size-12";
  const glyph = size === "lg" ? "size-7" : size === "sm" ? "size-5" : "size-6";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl",
        box,
        tone === "light" ? "bg-brand-50 text-brand-600" : "bg-white/10 text-white",
        className,
      )}
      aria-hidden="true"
    >
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
}

export function Chip({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-medium",
        tone === "light" ? "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200" : "bg-white/10 text-white/85",
      )}
    >
      {children}
    </span>
  );
}

export function Badge({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
        tone === "accent" ? "bg-accent-500/10 text-[#0b7c71]" : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200",
      )}
    >
      {children}
    </span>
  );
}
