import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "inverse" | "white" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  /* Brand blue on white text: 5.2:1, so it passes AA at the 14px label size too. */
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700",
  secondary:
    "border-[1.5px] border-brand-600 bg-white text-brand-600 hover:bg-brand-50 active:bg-brand-50",
  /* For dark sections: the primary stays brand, the secondary turns white. */
  inverse: "border-[1.5px] border-white/70 bg-transparent text-white hover:bg-white/10",
  white: "bg-white text-brand-600 hover:bg-brand-50 active:bg-brand-50",
  ghost: "bg-transparent text-gray-900 hover:bg-gray-50",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-[0.9375rem]",
  lg: "min-h-[3.25rem] px-7 text-base md:min-h-12",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold leading-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    extra,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

/**
 * The loading state keeps the button's width by rendering the label invisibly
 * underneath the spinner, so a submit never makes the card jump (§6.5).
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="size-[1.1em] animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">Sending…</span>
          <span aria-hidden="true" className="invisible">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
