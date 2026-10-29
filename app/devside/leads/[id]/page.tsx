import Link from "next/link";
import { notFound } from "next/navigation";
import { saveLead } from "@/app/devside/actions";
import { requireAdmin } from "@/lib/devside/auth";
import { describeAudit, type AuditRow } from "@/lib/devside/audit";
import {
  formatInManila,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  relativeTime,
  slotLabelManila,
  slotLabelVisitor,
} from "@/lib/devside/format";
import { adminSupabase } from "@/lib/supabase/admin";
import { meetingPlatformLabel } from "@/lib/site/meetings";

/**
 * `/devside/leads/[id]` — one request, whole (PRD §12.4).
 *
 * Everything the visitor typed is shown as text, never as HTML: React escapes it,
 * and the email link is built from a value the database already constrained. The
 * slot is printed twice — Manila and the visitor's zone — because the two only
 * agree for a client in the same timezone, and a meeting booked against the wrong
 * one is the mistake this page exists to prevent.
 */
export const metadata = { title: "Lead" };

type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string | null;
  role: string | null;
  country: string;
  project_type: string;
  description: string;
  expected_users: string;
  timeline: string;
  budget: string;
  preferred_date: string;
  preferred_time: string | null;
  timezone: string;
  meeting_platform: string;
  status: string;
  internal_notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  );
}

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const service = adminSupabase();
  const { id } = await params;
  const flags = await searchParams;

  if (!service) {
    return (
      <p className="rounded-card border border-gray-200 bg-white p-6 text-sm text-gray-600">
        The database is not configured on this deployment.
      </p>
    );
  }

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data, error } = await service.from("quote_requests").select("*").eq("id", id).maybeSingle();
  if (error) {
    return (
      <p className="rounded-card border border-danger-600/30 bg-white p-6 text-sm text-danger-600">
        Could not read this lead: {error.message}
      </p>
    );
  }
  if (!data) notFound();

  const lead = data as Lead;

  /* The last ten things that happened to this lead, from the audit table (§13). Capped
     because the answer this page gives is "where is it now", and a lead with more than
     ten moves has a story the console is not the right place to read. */
  const { data: activityData } = await service
    .from("admin_audit_log")
    .select("id, created_at, actor_email, action, entity, entity_id, detail")
    .eq("entity", "quote_request")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(10);
  const activity = (activityData ?? []) as AuditRow[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/devside/leads" className="text-sm text-brand-600 hover:underline">
          ← All leads
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-900">
          {lead.business_name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {lead.full_name} · received {relativeTime(lead.created_at)} ·{" "}
          {formatInManila(lead.created_at)} Manila
        </p>
      </div>

      {flags.saved ? (
        <p role="status" className="rounded-[10px] border border-accent-500/40 bg-accent-500/5 px-3.5 py-3 text-sm text-gray-900">
          Saved.
        </p>
      ) : null}
      {flags.error ? (
        <p
          role="alert"
          className="rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {flags.error === "unconfigured"
            ? "The database is not configured, so nothing was saved."
            : "That change was not saved. Nothing was lost — try again."}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-navy-900">The request</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Project type">{lead.project_type}</Field>
              <Field label="Budget">{lead.budget}</Field>
              <Field label="Timeline">{lead.timeline}</Field>
              <Field label="Expected users">{lead.expected_users}</Field>
              <Field label="Country">{lead.country}</Field>
              <Field label="Their role">{lead.role ?? "—"}</Field>
            </dl>
            <div className="mt-4">
              <Field label="Description">
                <p className="whitespace-pre-wrap">{lead.description}</p>
              </Field>
            </div>
          </section>

          <section className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-navy-900">The meeting</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="In Manila">{slotLabelManila(lead.preferred_date, lead.preferred_time)}</Field>
              <Field label={`Their clock (${lead.timezone})`}>
                {slotLabelVisitor(lead.preferred_date, lead.preferred_time, lead.timezone)}
              </Field>
              <Field label="Platform">{meetingPlatformLabel(lead.meeting_platform)}</Field>
              <Field label="Phone">{lead.phone ?? "—"}</Field>
            </dl>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-navy-900">Follow-up</h2>
            <form action={saveLead} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={lead.status}
                  className="mt-1.5 w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm"
                >
                  {LEAD_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {LEAD_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-900">
                  Internal notes
                </label>
                <textarea
                  id="internalNotes"
                  name="internalNotes"
                  rows={5}
                  maxLength={4000}
                  defaultValue={lead.internal_notes ?? ""}
                  className="mt-1.5 w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                />
                <p className="mt-1 text-xs text-gray-600">Never shown to the client. Not sent anywhere.</p>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Save
              </button>
            </form>
            <p className="mt-3 text-sm text-gray-600">
              Reply by email:{" "}
              <a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline">
                {lead.email}
              </a>
            </p>
          </section>

          <section className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-navy-900">Activity</h2>
            {activity.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">
                Nothing recorded yet. The first status change writes a line here.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {activity.map((event) => (
                  <li key={event.id} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-gray-900">{describeAudit(event)}</span>
                    <span className="text-xs text-gray-600">
                      {event.actor_email} · {relativeTime(event.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-navy-900">Source</h2>
            <dl className="mt-4 space-y-3">
              <Field label="Referrer">{lead.referrer ?? "Direct"}</Field>
              <Field label="Campaign">
                {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "—"}
              </Field>
              <Field label="Term / content">
                {[lead.utm_term, lead.utm_content].filter(Boolean).join(" / ") || "—"}
              </Field>
              <Field label="Browser">
                <span className="break-words text-gray-600">{lead.user_agent ?? "—"}</span>
              </Field>
              <Field label="IP hash">
                <span className="break-all font-mono text-xs text-gray-600">{lead.ip_hash ?? "—"}</span>
              </Field>
              <Field label="Last updated">{formatInManila(lead.updated_at)}</Field>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
