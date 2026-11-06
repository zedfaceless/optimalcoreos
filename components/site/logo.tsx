import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";
import { cn } from "@/lib/utils";

/**
 * The wordmark plus the mark: three nested hexagons with an arrow climbing out of
 * them, in the brand blues. Drawn inline so it is sharp at every size and costs one
 * request fewer.
 *
 * `public/logo.jpeg` holds the master artwork, and the tab icon is that artwork
 * (`app/icon.jpeg`, `app/apple-icon.jpeg`). It is *not* used here: at 32px the
 * artwork's ribbons land under a pixel wide and the header would show a navy square
 * with a smudge in it, so this draws the same geometry with a transparent background.
 * To use the raster anyway, add `import Image from "next/image"` and swap the line
 * below for:
 *   <Image src="/logo.jpeg" alt="" width={32} height={32} className="size-8 shrink-0 rounded-md" />
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
      <BrandMark tone={tone} />
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
