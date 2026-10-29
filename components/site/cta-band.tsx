import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTA } from "@/content/site";
import { cn } from "@/lib/utils";

/** The brand-gradient band that ends every page (§7.1 H-7 and its siblings). */
export function CtaBand({
  heading,
  body,
  buttonLabel = CTA.primary,
  href = CTA.quotePath,
  secondaryHref,
  secondaryLabel,
}: {
  heading: string;
  body: string;
  buttonLabel?: string;
  href?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(120deg,#1F6FEB_0%,#1448A8_100%)]">
      <div className="grid-dots absolute inset-0" aria-hidden="true" />
      <div className="shell relative py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.75rem] font-bold text-white sm:text-4xl">{heading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85">{body}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={href}
              className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-[10px] bg-white px-7 text-base font-semibold text-brand-600 transition-colors hover:bg-brand-50 sm:min-h-12"
            >
              {buttonLabel}
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className={cn(
                  "inline-flex min-h-[3.25rem] items-center justify-center rounded-[10px] border-[1.5px] border-white/70 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:min-h-12",
                )}
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
