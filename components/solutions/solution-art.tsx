import { cn } from "@/lib/utils";
import type { Solution } from "@/content/solutions";

/**
 * The eight solution illustrations (§7.4). Each variant is a small abstract screen
 * that matches the `alt` copy beside it, so the picture and the description agree.
 */

function InventoryArt() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      {["Rice 25kg", "Cooking oil", "Sugar 1kg"].map((product, index) => (
        <div key={product} className="flex items-center gap-3 py-1.5">
          <span className="w-20 shrink-0 truncate text-[0.625rem] font-medium text-navy-950">{product}</span>
          <span className="h-1.5 flex-1 rounded-full bg-gray-50">
            <span className="block h-1.5 rounded-full bg-brand-600" style={{ width: `${70 - index * 22}%` }} />
          </span>
          {index === 2 ? (
            <span className="rounded-full bg-danger-600/10 px-1.5 py-0.5 text-[0.5rem] font-bold text-danger-600">
              Low
            </span>
          ) : (
            <span className="text-[0.5rem] text-gray-600">{120 - index * 40}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function OrdersArt() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {["New", "In progress", "Completed"].map((column, columnIndex) => (
        <div key={column} className="rounded-lg bg-white/70 p-2">
          <div className="mb-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-gray-600">
            {column}
          </div>
          {[0, 1].map((card) => (
            <div
              key={card}
              className={cn(
                "mb-1 rounded border border-gray-200 bg-white p-1.5",
                columnIndex === 1 && card === 0 && "border-brand-600/40",
              )}
            >
              <div className="h-1 w-8 rounded-full bg-gray-200" />
              <div className="mt-1 h-1 w-10 rounded-full bg-gray-50" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function InvoicingArt() {
  return (
    <div className="flex gap-2">
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-2.5">
        <div className="text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-gray-600">Invoice</div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="mt-1.5 flex justify-between">
            <span className="h-1 w-10 rounded-full bg-gray-200" />
            <span className="h-1 w-4 rounded-full bg-gray-200" />
          </div>
        ))}
        <div className="mt-2 border-t border-gray-200 pt-1.5 text-right text-[0.5rem] font-bold text-navy-950">
          ₱12,400
        </div>
      </div>
      <div className="w-14 rounded-lg border border-gray-200 bg-white p-2">
        <div className="flex h-12 items-end gap-1">
          {[40, 70, 55, 90].map((height, index) => (
            <span key={index} className="w-full rounded-t-[2px] bg-accent-500/80" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamArt() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded bg-navy-950 px-2.5 py-1 text-[0.5rem] font-semibold text-white">Owner</div>
      <span className="h-3 w-px bg-gray-200" />
      <div className="flex w-full justify-around">
        {["Branch A", "Branch B"].map((branch) => (
          <div key={branch} className="flex flex-col items-center gap-1.5">
            <div className="rounded bg-white px-2 py-0.5 text-[0.5rem] font-medium text-navy-950 ring-1 ring-gray-200">
              {branch}
            </div>
            <div className="flex gap-1">
              <span className="rounded-full bg-brand-50 px-1.5 text-[0.5rem] text-brand-700">admin</span>
              <span className="rounded-full bg-gray-50 px-1.5 text-[0.5rem] text-gray-600">seller</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebsiteArt() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-2.5">
        <div className="h-1.5 w-12 rounded-full bg-navy-900/70" />
        <div className="mt-1.5 h-1 w-full rounded-full bg-gray-200" />
        <div className="mt-1 h-1 w-2/3 rounded-full bg-gray-200" />
      </div>
      <div className="w-16 rounded-[0.75rem] border-2 border-brand-600/40 bg-white p-1.5">
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-gray-200" />
          <div className="h-1 w-full rounded-full bg-gray-200" />
          <div className="h-2 w-full rounded bg-brand-600" />
        </div>
      </div>
    </div>
  );
}

function FieldArt() {
  return (
    <div className="mx-auto w-24 rounded-[1rem] border border-gray-200 bg-white p-2">
      {["Site check", "Photo", "Notes"].map((item, index) => (
        <div key={item} className="flex items-center gap-1.5 py-1">
          <span
            className={cn(
              "size-2 rounded-[2px] border",
              index < 2 ? "border-brand-600 bg-brand-600" : "border-gray-200 bg-white",
            )}
          />
          <span className="text-[0.5rem] text-navy-950">{item}</span>
        </div>
      ))}
      <div className="mt-1 rounded bg-navy-950 py-1 text-center text-[0.5rem] font-semibold text-white">Capture</div>
    </div>
  );
}

function MvpArt() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {["Sketch", "Prototype", "Live"].map((step, index) => (
        <div key={step} className="flex items-center gap-1.5">
          <div
            className={cn(
              "rounded-md px-2 py-1.5 text-[0.5rem] font-semibold",
              index === 2 ? "bg-brand-600 text-white" : "bg-white text-navy-950 ring-1 ring-gray-200",
            )}
          >
            {step}
          </div>
          {index < 2 ? <span className="h-px w-2.5 bg-brand-600/50" /> : null}
        </div>
      ))}
    </div>
  );
}

function ReportingArt() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {["₱1.2M", "846", "12%", "3"].map((value) => (
          <div key={value} className="rounded border border-gray-200 bg-white p-1 text-center">
            <div className="text-[0.5rem] font-bold text-navy-950">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded border border-gray-200 bg-white p-1.5">
        <svg viewBox="0 0 100 30" className="h-10 w-full" aria-hidden="true" preserveAspectRatio="none">
          <polyline
            points="0,24 14,18 28,21 42,10 56,14 70,6 84,9 100,3"
            fill="none"
            stroke="#1F6FEB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

const ARTS: Record<Solution["art"], () => React.JSX.Element> = {
  inventory: InventoryArt,
  orders: OrdersArt,
  invoicing: InvoicingArt,
  team: TeamArt,
  website: WebsiteArt,
  field: FieldArt,
  mvp: MvpArt,
  reporting: ReportingArt,
};

export function SolutionArt({
  art,
  alt,
  className,
}: {
  art: Solution["art"];
  alt: string;
  className?: string;
}) {
  const Art = ARTS[art];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative overflow-hidden rounded-card border border-gray-200 bg-[linear-gradient(135deg,#EEF4FF_0%,#F7F9FC_100%)] p-5 shadow-card",
        className,
      )}
    >
      <Art />
    </div>
  );
}

