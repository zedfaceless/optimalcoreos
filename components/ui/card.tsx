import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Desktop-only 2px lift on hover. Off by default for cards that are not links. */
  interactive?: boolean;
  as?: "div" | "article" | "li" | "section";
};

export function Card({ children, className, interactive = false, as = "div" }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "rounded-card border border-gray-200 bg-white shadow-card",
        interactive && "transition-transform duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lift",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
