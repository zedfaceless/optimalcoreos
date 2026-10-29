import { hero } from "@/content/home";

/**
 * The hero's product visual (§7.1). Built from divs rather than an image so it is
 * sharp on every screen and costs no bytes; because it carries meaning, it is
 * exposed as a single labelled graphic instead of a stack of decorative boxes.
 */
export function HeroVisual() {
  return (
    <div className="relative" role="img" aria-label={hero.visualAlt}>
      <div className="rounded-card border border-gray-200 bg-white p-3 shadow-lift sm:p-4">
        <div className="flex items-center gap-1.5 pb-3">
          <span className="size-2 rounded-full bg-gray-200" />
          <span className="size-2 rounded-full bg-gray-200" />
          <span className="size-2 rounded-full bg-gray-200" />
          <span className="ml-2 h-2 w-24 rounded-full bg-gray-50" />
        </div>

        <div className="rounded-xl bg-gray-50 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2 w-16 rounded-full bg-gray-200" />
              <div className="mt-2 h-3.5 w-28 rounded-full bg-navy-900/80" />
            </div>
            <div className="rounded-lg bg-brand-600 px-3 py-1.5 text-[0.625rem] font-semibold text-white">
              Today
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Sales", value: "₱48,200" },
              { label: "Orders", value: "126" },
              { label: "Low stock", value: "4" },
            ].map((tile) => (
              <div key={tile.label} className="rounded-lg border border-gray-200 bg-white p-2.5">
                <div className="text-[0.5625rem] uppercase tracking-[0.12em] text-gray-600">
                  {tile.label}
                </div>
                <div className="mt-1 font-display text-[0.8125rem] font-bold text-navy-950">
                  {tile.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-end justify-between gap-1.5" aria-hidden="true">
              {[38, 55, 42, 70, 62, 84, 74].map((height, index) => (
                <div
                  key={index}
                  className="w-full rounded-t-[3px] bg-brand-600/85"
                  style={{ height: `${height * 0.6}px` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.5rem] text-gray-600">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {[
              { name: "Order #1042", status: "Paid", tone: "bg-accent-500/15 text-[#0b7c71]" },
              { name: "Order #1041", status: "Packed", tone: "bg-brand-50 text-brand-700" },
              { name: "Order #1040", status: "Paid", tone: "bg-accent-500/15 text-[#0b7c71]" },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="text-[0.625rem] font-medium text-navy-950">{row.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[0.5rem] font-semibold ${row.tone}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The phone, showing the same system in a hand-sized window. */}
      <div className="absolute -bottom-6 -right-3 w-[42%] max-w-[9.5rem] rounded-[1.25rem] border border-gray-200 bg-white p-2 shadow-lift sm:-right-6 sm:w-[38%]">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-gray-200" />
        <div className="rounded-xl bg-navy-950 p-2.5 text-white">
          <div className="text-[0.5rem] uppercase tracking-[0.1em] text-white/60">Stock</div>
          <div className="mt-0.5 font-display text-xs font-bold">1,284 items</div>
          <div className="mt-2 space-y-1">
            {[70, 45, 88].map((width, index) => (
              <div key={index} className="h-1 rounded-full bg-white/20">
                <div
                  className="h-1 rounded-full bg-accent-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-brand-600 py-1.5 text-center text-[0.5rem] font-semibold text-white">
          + New sale
        </div>
      </div>
    </div>
  );
}
