import Link from "next/link";
import { requireAdmin } from "@/lib/devside/auth";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, relativeTime, slotLabelManila } from "@/lib/devside/format";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * `/devside/leads` — the pipeline table (PRD §12.4).
 *
 * Search and status are URL parameters, not component state: a filtered list is a
 * link an admin can paste into a message, and the page works with no client
 * JavaScript at all.
 */
export const metadata = { title: "Leads" };

/** See `app/devside/layout.tsx`: the list is per-request, never a prerender. */
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

/** `%` and `_` are wildcards in `ilike`, and `,()` split the `or()` expression. */
function safeSearch(raw: string): string {
  return raw.replace(/[%_,()*\\]/g, " ").trim().slice(0, 80);
}

function pageHref(page: number, status: string | undefined, search: string): string {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  return `/devside/leads?${params.toString()}`;
}

type LeadRow = {
  id: string;
  created_at: string;
  full_name: string;
  business_name: string;
  email: string;
  project_type: string;
  budget: string;
  status: string;
  preferred_date: string;
  preferred_time: string | null;
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; error?: string }>;
}) {
  await requireAdmin();
  const service = adminSupabase();
  const params = await searchParams;

  if (!service) {
    return (
      <p className="rounded-card border border-gray-200 bg-white p-6 text-sm text-gray-600">
        The database is not configured on this deployment, so there is nothing to show.
      </p>
    );
  }

  const status = LEAD_STATUSES.includes(params.status as (typeof LEAD_STATUSES)[number])
    ? params.status
    : undefined;
  const search = safeSearch(params.q ?? "");
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = service
    .from("quote_requests")
    .select(
      "id, created_at, full_name, business_name, email, project_type, budget, status, preferred_date, preferred_time",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`business_name.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  const rows = (data ?? []) as LeadRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const chip = (value: string | undefined, label: string) => {
    const active = (value ?? "") === (status ?? "");
    const href = value
      ? `/devside/leads?status=${value}${search ? `&q=${encodeURIComponent(search)}` : ""}`
      : `/devside/leads${search ? `?q=${encodeURIComponent(search)}` : ""}`;
    return (
      <Link
        key={label}
        href={href}
        aria-current={active ? "page" : undefined}
        className={
          active
            ? "rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
            : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 hover:border-brand-600"
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-600">
            {count ?? 0} request{count === 1 ? "" : "s"}
            {status ? ` with status ${LEAD_STATUS_LABELS[status] ?? status}` : ""}
            {search ? ` matching “${search}”` : ""}.
          </p>
        </div>
        <a
          href={`/devside/export?type=leads${status ? `&status=${status}` : ""}`}
          className="rounded-[10px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:border-brand-600"
        >
          Export CSV
        </a>
      </div>

      {params.error ? (
        <p
          role="alert"
          className="rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {params.error === "unconfigured" ? "The database is not configured." : "That change was not saved."}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {chip(undefined, "All")}
        {LEAD_STATUSES.map((value) => chip(value, LEAD_STATUS_LABELS[value] ?? value))}
        <form action="/devside/leads" className="ml-auto flex items-center gap-2">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="q" className="sr-only">
            Search leads
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Business, name or email"
            className="w-56 rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <button type="submit" className="rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-sm">
            Search
          </button>
        </form>
      </div>

      {error ? (
        <p className="rounded-card border border-danger-600/30 bg-white p-6 text-sm text-danger-600">
          Could not read leads: {error.message}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-gray-200 bg-white shadow-card">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Received</th>
                <th scope="col" className="px-4 py-3 font-semibold">Business</th>
                <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-4 py-3 font-semibold">Project</th>
                <th scope="col" className="px-4 py-3 font-semibold">Budget</th>
                <th scope="col" className="px-4 py-3 font-semibold">Meeting</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((lead) => (
                <tr key={lead.id} className="align-top hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{relativeTime(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/devside/leads/${lead.id}`} className="font-medium text-navy-900 hover:underline">
                      {lead.business_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.full_name}
                    <br />
                    <a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline">
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.project_type}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.budget}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {slotLabelManila(lead.preferred_date, lead.preferred_time)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-900">
                      {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                    Nothing here yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1, status, search)} className="text-brand-600 hover:underline">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1, status, search)} className="text-brand-600 hover:underline">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
