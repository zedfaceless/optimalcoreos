"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/content/faq";
import { cn } from "@/lib/utils";

/**
 * One panel open at a time (§7.8). A button-and-panel pair rather than `<details>`
 * so the chevron and the grid both animate, and so the answer is announced by
 * `aria-expanded` instead of a browser default the specs cannot rely on.
 */
export function FaqAccordion({ items, className }: { items: Faq[]; className?: string }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-gray-200 overflow-hidden rounded-card border border-gray-200 bg-white", className)}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-button-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[1.0625rem] font-semibold text-navy-950 transition-colors hover:bg-gray-50"
              >
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  strokeWidth={2}
                  className={cn(
                    "size-5 shrink-0 text-brand-600 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-gray-600"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
