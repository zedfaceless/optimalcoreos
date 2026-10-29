import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section heading. `tone` flips it for the navy bands, and `align` keeps the home
 * page's centred band and the inner pages' left-aligned blocks in one component.
 */
export function SectionHeading({
  eyebrow,
  title,
  body,
  tone = "light",
  align = "left",
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn("eyebrow", tone === "dark" && "text-white/70")}>{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={cn(
          "mt-3 text-[1.75rem] font-bold sm:text-4xl",
          tone === "dark" ? "text-white" : "text-navy-950",
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "measure mt-4 text-[1.0625rem] leading-relaxed",
            align === "center" && "mx-auto",
            tone === "dark" ? "text-white/70" : "text-gray-600",
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
