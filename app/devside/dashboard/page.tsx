import Link from "next/link";
import { requireAdmin } from "@/lib/devside/auth";
import {
  LEAD_STATUS_LABELS,
  messageStatusLabel,
  relativeTime,
  slotLabelManila,
  slotLabelVisitor,
} from "@/lib/devside/format";
import { adminSupabase } from "@/lib/supabase/admin";
import { isoDateInZone } from "@/lib/site/meetings";

/**
 * `/devside/dashboard` — the numbers the owner actually checks (PRD §12.4).
 *
 * Every tile is a `head: true` count, because a count is all a tile needs and the
 * rows would be thrown away. The pipeline strip is the one place that reads rows,
 * and it is capped at 1000: this console is for a business that gets a handful of
 * requests a day, and a table that outgrows the cap needs a report, not a tile.
 */
export const metadata = { title: "Dashboard" };

/** See `app/devside/layout.tsx`: the counts are per-request, never a prerender. */
export const dynamic = "force-dynamic";

const PIPELINE = ["new", "contacted", "quoted", "won", "lost"] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; password?: string }>;
}) {
  const admin = await requireAdmin();
  const { error, password } = await searchParams;
  const service = adminSupabase();

  if (!service) {
    return (
      <p className="rounded-card border border-gray-200 bg-white p-6 text-sm text-gray-600">
        The database is not configured on this deployment, so there is nothing to show.
      </p>
    );
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const today = isoDateInZone(now);
  const fortnight = isoDateInZone(new Date(now.getTime() + 14 * 86_400_000));

  const [newThisWeek, awaitingReply, unread, pipeline, meetings, recentLeads, recentMessages] =
    await Promise.all([
      service.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      service
        .from("quote_requests")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "contacted"]),
      service.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      service.from("quote_requests").select("status").limit(1000),
      service
        .from("quote_requests")
        .select("id, full_name, preferred_date, preferred_time, timezone")
        .gte("preferred_date", today)
        .lte("preferred_date", fortnight)
        .order("preferred_date", { ascending: true })
        .limit(5),
      service
        .from("quote_requests")
        .select("id, created_at, business_name, project_type, status")
        .order("created_at", { ascending: false })
        .limit(8),
      service
        .from("contact_messages")
        .select("id, created_at, name, message, status")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const tally = new Map<string, number>();
  for (const row of (pipeline.data ?? []) as { status: string }[]) {
    tally.set(row.status, (tally.get(row.status) ?? 0) + 1);
  }

  const tiles = [
    { label: "New leads (7 days)", value: newThisWeek.count ?? 0, href: "/devside/leads?status=new" },
    { label: "Awaiting reply", value: awaitingReply.count ?? 0, href: "/devside/leads?status=contacted" },
    { label: "Unread messages", value: unread.count ?? 0, href: "/devside/messages?status=new" },
    { label: "Meetings in 14 days", value: meetings.data?.length ?? 0, href: "/devside/leads" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Signed in as {admin.displayName ?? admin.email}.</p>
      </div>

      {/* `requireOwner()` sends a staff admin here rather than to the page it refused,
          because redirecting to `/devside/team` would land on the same guard again. */}
      {error === "owner-only" ? (
        <p
          role="alert"
          className="rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          That page is for owners. Ask an owner if you need something changed there.
        </p>
      ) : null}

      {password === "changed" ? (
        <p
          role="status"
          className="rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-600"
        >
          Password saved. The next sign-in uses the new one.
        </p>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label} className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <p className="text-sm text-gray-600">{tile.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-navy-900">{tile.value}</p>
            <Link href={tile.href} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
              Open
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="pipeline">
        <h2 id="pipeline" className="text-sm font-semibold uppercase tracking-wider text-gray-600">
          Pipeline
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {PIPELINE.map((status) => (
            <li key={status}>
              <Link
                href={`/devside/leads?status=${status}`}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-900 hover:border-brand-600"
              >
                {LEAD_STATUS_LABELS[status]}
                <span className="font-semibold text-brand-600">{tally.get(status) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-leads" className="rounded-card border border-gray-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 id="recent-leads" className="font-display text-base font-semibold text-navy-900">
            Recent leads
          </h2>
          <Link href="/devside/leads" className="text-sm font-medium text-brand-600 hover:underline">
            All leads
          </Link>
        </div>
        {recentLeads.error ? (
          <p className="px-5 py-6 text-sm text-danger-600">Could not read leads: {recentLeads.error.message}</p>
        ) : recentLeads.data && recentLeads.data.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentLeads.data.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/devside/leads/${lead.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm hover:bg-gray-50"
                >
                  <span className="font-medium text-navy-900">{lead.business_name}</span>
                  <span className="text-gray-600">{lead.project_type}</span>
                  <span className="text-gray-600">{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</span>
                  <span className="text-gray-600">{relativeTime(lead.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-600">
            No leads yet. Submissions from the website appear here.
          </p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="meetings" className="rounded-card border border-gray-200 bg-white shadow-card">
          <h2
            id="meetings"
            className="border-b border-gray-200 px-5 py-3 font-display text-base font-semibold text-navy-900"
          >
            Requested meetings
          </h2>
          {meetings.data && meetings.data.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {meetings.data.map((meeting) => (
                <li key={meeting.id} className="px-5 py-3 text-sm">
                  <Link href={`/devside/leads/${meeting.id}`} className="font-medium text-navy-900 hover:underline">
                    {meeting.full_name}
                  </Link>
                  <p className="text-gray-600">{slotLabelManila(meeting.preferred_date, meeting.preferred_time)}</p>
                  <p className="text-gray-600">
                    Their clock: {slotLabelVisitor(meeting.preferred_date, meeting.preferred_time, meeting.timezone)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-gray-600">No meetings requested in the next two weeks.</p>
          )}
        </section>

        <section aria-labelledby="recent-messages" className="rounded-card border border-gray-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 id="recent-messages" className="font-display text-base font-semibold text-navy-900">
              Recent messages
            </h2>
            <Link href="/devside/messages" className="text-sm font-medium text-brand-600 hover:underline">
              Inbox
            </Link>
          </div>
          {recentMessages.data && recentMessages.data.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentMessages.data.map((message) => (
                <li key={message.id} className="px-5 py-3 text-sm">
                  <p className="font-medium text-navy-900">{message.name}</p>
                  <p className="line-clamp-2 text-gray-600">{message.message}</p>
                  <p className="mt-1 text-gray-600">
                    {messageStatusLabel(message.status)} · {relativeTime(message.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-gray-600">No messages yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
