import { currentAdmin } from "@/lib/devside/auth";
import { toCsv } from "@/lib/devside/csv";
import { LEAD_STATUSES, MESSAGE_STATUSES } from "@/lib/devside/format";
import { adminSupabase } from "@/lib/supabase/admin";
import { isoDateInZone } from "@/lib/site/meetings";

/**
 * CSV export of either table (PRD §12.4).
 *
 * A route handler rather than a Server Action, because the answer is a download and
 * not a re-render. It answers 401 instead of redirecting: a redirect here would hand
 * a fetch() an HTML login page with a 200 after following it, which is exactly the
 * kind of silence that ends with a spreadsheet full of login markup.
 *
 * The escaping and the BOM moved to `lib/devside/csv.ts` so the formula guard is a
 * tested function rather than a private one.
 */

export async function GET(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const service = adminSupabase();
  if (!service) return new Response("The database is not configured.", { status: 503 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "messages" ? "messages" : "leads";
  const status = url.searchParams.get("status");
  const today = isoDateInZone(new Date());

  let body: string;
  let filename: string;

  if (type === "messages") {
    let query = service
      .from("contact_messages")
      .select("created_at, name, email, message, status, internal_notes, referrer")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (MESSAGE_STATUSES.includes(status as (typeof MESSAGE_STATUSES)[number])) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return new Response(`Could not read messages: ${error.message}`, { status: 500 });

    body = toCsv(
      ["Received", "Name", "Email", "Message", "Status", "Internal notes", "Referrer"],
      (data ?? []).map((row) => [
        row.created_at,
        row.name,
        row.email,
        row.message,
        row.status,
        row.internal_notes,
        row.referrer,
      ]),
    );
    filename = `contact-messages-${today}.csv`;
  } else {
    let query = service
      .from("quote_requests")
      .select(
        "created_at, full_name, business_name, email, phone, role, country, project_type, description, expected_users, timeline, budget, preferred_date, preferred_time, timezone, meeting_platform, status, internal_notes, utm_source, utm_medium, utm_campaign, referrer",
      )
      .order("created_at", { ascending: false })
      .limit(5000);
    if (LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return new Response(`Could not read leads: ${error.message}`, { status: 500 });

    body = toCsv(
      [
        "Received",
        "Name",
        "Business",
        "Email",
        "Phone",
        "Role",
        "Country",
        "Project type",
        "Description",
        "Expected users",
        "Timeline",
        "Budget",
        "Meeting date (Manila)",
        "Meeting time (Manila)",
        "Visitor timezone",
        "Platform",
        "Status",
        "Internal notes",
        "UTM source",
        "UTM medium",
        "UTM campaign",
        "Referrer",
      ],
      (data ?? []).map((row) => [
        row.created_at,
        row.full_name,
        row.business_name,
        row.email,
        row.phone,
        row.role,
        row.country,
        row.project_type,
        row.description,
        row.expected_users,
        row.timeline,
        row.budget,
        row.preferred_date,
        row.preferred_time,
        row.timezone,
        row.meeting_platform,
        row.status,
        row.internal_notes,
        row.utm_source,
        row.utm_medium,
        row.utm_campaign,
        row.referrer,
      ]),
    );
    filename = `quote-requests-${today}.csv`;
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
