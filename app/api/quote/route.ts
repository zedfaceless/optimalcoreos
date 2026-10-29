import { clientIp, honeypotTripped, json, jsonError, rateLimit, readJsonObject } from "@/lib/api/guard";
import { notifyOwners, sendEmail } from "@/lib/email/send";
import { ownerQuoteEmail, visitorQuoteEmail } from "@/lib/email/templates";
import { isSelectableDate, labelForSlot } from "@/lib/site/meetings";
import { adminSupabase, hashIp } from "@/lib/supabase/admin";
import { fieldErrors, quoteSchema } from "@/lib/validation/forms";

/**
 * `POST /api/quote` — one row in `quote_requests`, one email to the owners, one
 * confirmation to the visitor. The row is written before either email, so a mail
 * outage never loses a request (§10.4).
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`quote:${ip ?? "unknown"}`, 5, 10 * 60_000)) {
    return jsonError(429, "Too many requests from this connection. Please try again in a few minutes.");
  }

  const body = await readJsonObject(request);
  if (!body) return jsonError(400, "We could not read that request. Please try again.");

  // A filled honeypot is silent: the bot sees the success it expects.
  if (honeypotTripped(body)) return json({ ok: true });

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Please check the highlighted fields.", fieldErrors(parsed.error));
  }
  const input = parsed.data;

  if (!isSelectableDate(input.preferredDate)) {
    return jsonError(422, "Please choose a weekday within the next six weeks.", {
      preferredDate: "Please choose a weekday within the next six weeks.",
    });
  }

  const supabase = adminSupabase();
  if (!supabase) {
    return jsonError(
      503,
      "We could not save your request just now. Please email us directly and we will pick it up from there.",
    );
  }

  const slotLabel = labelForSlot(input.preferredDate, input.preferredTime, input.timezone);

  const { error } = await supabase.from("quote_requests").insert({
    full_name: input.fullName,
    business_name: input.businessName,
    email: input.email,
    phone: input.phone ?? null,
    role: input.role ?? null,
    country: input.country,
    project_type: input.projectType,
    description: input.description,
    expected_users: input.expectedUsers,
    timeline: input.timeline,
    budget: input.budget,
    preferred_date: input.preferredDate,
    preferred_time: input.preferredTime,
    timezone: input.timezone,
    meeting_platform: input.meetingPlatform,
    consent: input.consent,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    utm_term: input.utmTerm ?? null,
    utm_content: input.utmContent ?? null,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
    ip_hash: await hashIp(ip),
  });

  if (error) {
    console.error("[api/quote] insert failed", error.message);
    return jsonError(
      503,
      "We could not save your request just now. Please email us directly and we will pick it up from there.",
    );
  }

  await Promise.allSettled([
    notifyOwners(ownerQuoteEmail(input, slotLabel), input.email),
    sendEmail({ to: input.email, message: visitorQuoteEmail(input, slotLabel) }),
  ]);

  return json({ ok: true });
}
