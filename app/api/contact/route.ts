import { clientIp, honeypotTripped, json, jsonError, rateLimit, readJsonObject } from "@/lib/api/guard";
import { notifyOwners, sendEmail } from "@/lib/email/send";
import { ownerContactEmail, visitorContactEmail } from "@/lib/email/templates";
import { adminSupabase, hashIp } from "@/lib/supabase/admin";
import { contactSchema, fieldErrors } from "@/lib/validation/forms";

/** `POST /api/contact` — one row in `contact_messages`, one email each way. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`contact:${ip ?? "unknown"}`, 5, 10 * 60_000)) {
    return jsonError(429, "Too many messages from this connection. Please try again in a few minutes.");
  }

  const body = await readJsonObject(request);
  if (!body) return jsonError(400, "We could not read that message. Please try again.");
  if (honeypotTripped(body)) return json({ ok: true });

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Please check the highlighted fields.", fieldErrors(parsed.error));
  }
  const input = parsed.data;

  const supabase = adminSupabase();
  if (!supabase) {
    return jsonError(
      503,
      "We could not send that message just now. Please email us directly and we will reply from there.",
    );
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    message: input.message,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
    ip_hash: await hashIp(ip),
  });

  if (error) {
    console.error("[api/contact] insert failed", error.message);
    return jsonError(
      503,
      "We could not send that message just now. Please email us directly and we will reply from there.",
    );
  }

  await Promise.allSettled([
    notifyOwners(ownerContactEmail(input), input.email),
    sendEmail({ to: input.email, message: visitorContactEmail(input) }),
  ]);

  return json({ ok: true });
}
