import Link from "next/link";
import { saveMessage } from "@/app/devside/actions";
import { requireAdmin } from "@/lib/devside/auth";
import { formatInManila, MESSAGE_STATUSES, messageStatusLabel, relativeTime } from "@/lib/devside/format";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * `/devside/messages` — the contact inbox (PRD §12.4).
 *
 * One card per message, each with its own form, so an admin marks a message handled
 * in one click and the page still needs no client JavaScript. Filtering is the same
 * URL-parameter pattern as the leads list.
 */
export const metadata = { title: "Messages" };

/** See `app/devside/layout.tsx`: the inbox is per-request, never a prerender. */
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Message = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  status: string;
  internal_notes: string | null;
  referrer: string | null;
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; saved?: string; error?: string }>;
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

  const status = MESSAGE_STATUSES.includes(params.status as (typeof MESSAGE_STATUSES)[number])
    ? params.status
    : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = service
    .from("contact_messages")
    .select("id, created_at, name, email, message, status, internal_notes, referrer", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  const rows = (data ?? []) as Message[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const filters = [
    { value: undefined as string | undefined, label: "All" },
    ...MESSAGE_STATUSES.map((value) => ({ value: value as string | undefined, label: messageStatusLabel(value) })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-600">
            {count ?? 0} message{count === 1 ? "" : "s"} from the contact form.
          </p>
        </div>
        <a
          href={`/devside/export?type=messages${status ? `&status=${status}` : ""}`}
          className="rounded-[10px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:border-brand-600"
        >
          Export CSV
        </a>
      </div>

      {params.saved ? (
        <p
          role="status"
          className="rounded-[10px] border border-accent-500/40 bg-accent-500/5 px-3.5 py-3 text-sm text-gray-900"
        >
          Saved.
        </p>
      ) : null}
      {params.error ? (
        <p
          role="alert"
          className="rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {params.error === "unconfigured" ? "The database is not configured." : "That change was not saved."}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => {
          const active = (item.value ?? "") === (status ?? "");
          return (
            <Link
              key={item.label}
              href={item.value ? `/devside/messages?status=${item.value}` : "/devside/messages"}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 hover:border-brand-600"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-card border border-danger-600/30 bg-white p-6 text-sm text-danger-600">
          Could not read messages: {error.message}
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-card border border-gray-200 bg-white p-6 text-sm text-gray-600">Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((message) => (
            <li key={message.id} className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-navy-900">
                  {message.name}{" "}
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm font-normal text-brand-600 hover:underline"
                  >
                    {message.email}
                  </a>
                </p>
                <p className="text-sm text-gray-600" title={formatInManila(message.created_at)}>
                  {relativeTime(message.created_at)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-900">{message.message}</p>
              <p className="mt-3 text-xs text-gray-600">
                {messageStatusLabel(message.status)}
                {message.referrer ? ` · from ${message.referrer}` : ""}
              </p>

              <form action={saveMessage} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={message.id} />
                <div>
                  <label
                    htmlFor={`status-${message.id}`}
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${message.id}`}
                    name="status"
                    defaultValue={message.status}
                    className="mt-1 rounded-[10px] border border-gray-200 bg-white px-2.5 py-2 text-sm"
                  >
                    {MESSAGE_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {messageStatusLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-48 flex-1">
                  <label
                    htmlFor={`notes-${message.id}`}
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    Internal notes
                  </label>
                  <input
                    id={`notes-${message.id}`}
                    name="internalNotes"
                    maxLength={4000}
                    defaultValue={message.internal_notes ?? ""}
                    className="mt-1 w-full rounded-[10px] border border-gray-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-11 rounded-[10px] bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              href={`/devside/messages?page=${page - 1}${status ? `&status=${status}` : ""}`}
              className="text-brand-600 hover:underline"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/devside/messages?page=${page + 1}${status ? `&status=${status}` : ""}`}
              className="text-brand-600 hover:underline"
            >
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
