import { cn } from "@/lib/utils";

/**
 * The three service illustrations (§7.2). They are abstract on purpose: a shape a
 * reader recognises (modules, a browser, a phone) says more than a stock photo, and
 * each one carries the `alt` copy from `content/services.ts`.
 */
export function ServiceArt({
  art,
  alt,
  className,
}: {
  art: "systems" | "website" | "pwa";
  alt: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#EEF4FF_0%,#F7F9FC_100%)] p-4",
        className,
      )}
    >
      {art === "systems" ? (
        <div className="flex h-full items-center justify-center gap-2">
          {[
            { label: "Stock", tone: "bg-white" },
            { label: "Sales", tone: "bg-brand-600 text-white" },
            { label: "Books", tone: "bg-white" },
          ].map((box, index) => (
            <div key={box.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "rounded-lg border border-gray-200 px-2.5 py-4 text-center text-[0.5625rem] font-semibold shadow-card",
                  box.tone,
                )}
              >
                {box.label}
              </div>
              {index < 2 ? <span className="h-px w-3 bg-brand-600/50" /> : null}
            </div>
          ))}
        </div>
      ) : null}

      {art === "website" ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-card">
          <div className="flex items-center gap-1 border-b border-gray-200 px-2.5 py-2">
            <span className="size-1.5 rounded-full bg-gray-200" />
            <span className="size-1.5 rounded-full bg-gray-200" />
            <span className="ml-1.5 h-1.5 w-16 rounded-full bg-gray-50" />
          </div>
          <div className="space-y-1.5 p-3">
            <div className="h-2 w-20 rounded-full bg-navy-900/75" />
            <div className="h-1.5 w-full rounded-full bg-gray-200" />
            <div className="h-1.5 w-4/5 rounded-full bg-gray-200" />
            <div className="mt-2 h-4 w-16 rounded bg-brand-600" />
          </div>
        </div>
      ) : null}

      {art === "pwa" ? (
        <div className="mx-auto w-24 rounded-[1rem] border border-gray-200 bg-white p-2 shadow-card">
          <div className="mx-auto mb-2 h-1 w-6 rounded-full bg-gray-200" />
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((cell) => (
              <span
                key={cell}
                className={cn("aspect-square rounded-[3px]", cell === 1 ? "bg-brand-600" : "bg-brand-50")}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
