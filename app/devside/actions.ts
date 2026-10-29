"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { rateLimit } from "@/lib/api/guard";
import type { AuditAction } from "@/lib/devside/audit";
import { currentAdmin, requireAdmin, requireOwner } from "@/lib/devside/auth";
import { deactivationRefusal, roleChangeRefusal } from "@/lib/devside/team";
import { adminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site/config";

/**
 * The console's mutations (PRD §12.2, §12.5, §14.5).
 *
 * Every action asks `requireAdmin()` — or `requireOwner()` for the three that manage
 * the allowlist — for itself. A console page redirects a guest before it renders, but
 * a Server Action is a POST to the same route and that page's guard is not the thing
 * that decided; this is.
 */

/** The same twelve `supabase/config.toml` enforces (PRD §15.10), applied before the round trip. */
const MIN_PASSWORD_LENGTH = 12;

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);

const credentials = z.object({
  email: emailField,
  /** Length only: the rule that matters is Supabase's, and echoing it here would
      let a stranger measure passwords through our error messages. */
  password: z.string().min(1).max(200),
});

const uuidField = z.string().uuid();
const roleField = z.enum(["owner", "staff"]);

/** One audit row per change, and a failure to write it is logged rather than shown:
    the row that was saved is the record, and losing it to a log problem would be the
    worse of the two failures. */
async function writeAudit(input: {
  actorEmail: string;
  action: AuditAction;
  entity: "quote_request" | "contact_message" | "admin_user";
  entityId: string | null;
  detail?: Record<string, unknown>;
}) {
  const service = adminSupabase();
  if (!service) return;
  const { error } = await service.from("admin_audit_log").insert({
    actor_email: input.actorEmail,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    detail: input.detail ?? {},
  });
  if (error) console.error("[devside] audit write failed", error.message);
}

/** Active owners, for the two guards that refuse to leave the console without one. */
async function activeOwnerCount(service: SupabaseClient): Promise<number> {
  const { data } = await service
    .from("admin_users")
    .select("id")
    .eq("role", "owner")
    .eq("is_active", true);
  return data?.length ?? 0;
}

const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;
const MESSAGE_STATUSES = ["new", "replied", "archived", "spam"] as const;

async function callerIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || store.get("x-real-ip") || "unknown";
}

export async function signIn(formData: FormData) {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/devside?error=invalid");

  /* Five attempts per address and email per quarter hour (PRD §12.2). The counter
     is the same in-process map the public forms use, so it protects one instance;
     Supabase's own auth limits are the durable half. */
  if (!rateLimit(`devside:${await callerIp()}:${parsed.data.email}`, 5, 15 * 60_000)) {
    redirect("/devside?error=throttled");
  }

  const client = await supabaseServer();
  if (!client) redirect("/devside?error=unconfigured");

  const { data, error } = await client.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) redirect("/devside?error=invalid");

  /* A valid Supabase account is not an admin: the allowlist decides, and a user it
     does not name is signed straight back out (PRD §12.1). */
  const service = adminSupabase();
  const { data: admin } = service
    ? await service.from("admin_users").select("is_active").eq("user_id", data.user.id).maybeSingle()
    : { data: null };

  if (!admin?.is_active) {
    await client.auth.signOut();
    redirect("/devside?error=invalid");
  }

  redirect("/devside/dashboard");
}

export async function signOut() {
  const client = await supabaseServer();
  await client?.auth.signOut();
  redirect("/devside");
}

/**
 * Send a recovery link (§14.5). The page answers "if that address has an account, a
 * link is on its way" either way, and so does this: a reset form that says "no such
 * user" is a way to test whether an address is on the allowlist.
 *
 * The link lands on `/devside/auth/confirm`, which exchanges the token for a session
 * and forwards to `/devside/update-password`; the route has to be listed in
 * `additional_redirect_urls` on every project, which `docs/PLACEHOLDERS.md` says.
 */
export async function requestPasswordReset(formData: FormData) {
  const email = emailField.safeParse(formData.get("email"));
  if (!email.success) redirect("/devside/reset-password?error=invalid");

  /* Three an address per quarter hour, with the same in-process map as sign-in: an
     unauthenticated endpoint that sends mail is a way to spend somebody else's quota. */
  if (!rateLimit(`reset:${await callerIp()}:${email.data}`, 3, 15 * 60_000)) {
    redirect("/devside/reset-password?error=throttled");
  }

  const client = await supabaseServer();
  if (!client) redirect("/devside/reset-password?error=unconfigured");

  const { error } = await client.auth.resetPasswordForEmail(email.data, {
    redirectTo: absoluteUrl("/devside/auth/confirm"),
  });
  if (error) console.error("[devside] reset request failed", error.message);

  redirect("/devside/reset-password?sent=1");
}

/**
 * The other half of a recovery link, and the last step of an invitation.
 *
 * Manual checks rather than a zod schema because each failure needs a different slug:
 * "too short" and "the two fields disagree" are the two mistakes a person makes here,
 * and one generic message sends them hunting for the wrong one.
 */
export async function setNewPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
    redirect("/devside/update-password?error=short");
  }
  if (password !== confirm) redirect("/devside/update-password?error=mismatch");

  /* The session came from a link, so it exists; the allowlist is what decides whether
     this is an account that may use it. An invited stranger who guesses the route
     still cannot set a password for a mailbox nobody added to `admin_users`. */
  const admin = await currentAdmin();
  if (!admin) redirect("/devside/update-password?error=allowlist");

  const client = await supabaseServer();
  if (!client) redirect("/devside/update-password?error=unconfigured");

  const { error } = await client.auth.updateUser({ password });
  if (error) {
    console.error("[devside] password update refused", error.message);
    redirect("/devside/update-password?error=refused");
  }

  await writeAudit({
    actorEmail: admin.email,
    action: "admin.password",
    entity: "admin_user",
    entityId: admin.id,
  });

  redirect("/devside/dashboard?password=changed");
}

export async function saveLead(formData: FormData) {
  const admin = await requireAdmin();

  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(LEAD_STATUSES).safeParse(formData.get("status"));
  const notes = z
    .string()
    .trim()
    .max(4000)
    .safeParse(formData.get("internalNotes") ?? "");

  if (!id.success || !status.success || !notes.success) redirect("/devside/leads?error=invalid");

  const service = adminSupabase();
  if (!service) redirect("/devside/leads?error=unconfigured");

  /* Read before write, because the audit row is the delta: "changed new → contacted"
     needs the value that was there, and a second query is cheaper than a version
     column nothing else would read. */
  const { data: before } = await service
    .from("quote_requests")
    .select("status, internal_notes")
    .eq("id", id.data)
    .maybeSingle();

  const nextNotes = notes.data || null;
  const { error } = await service
    .from("quote_requests")
    .update({ status: status.data, internal_notes: nextNotes })
    .eq("id", id.data);

  if (!error && before) {
    const statusMoved = before.status !== status.data;
    const notesMoved = (before.internal_notes ?? null) !== nextNotes;
    if (statusMoved || notesMoved) {
      await writeAudit({
        actorEmail: admin.email,
        action: "lead.update",
        entity: "quote_request",
        entityId: id.data,
        detail: {
          ...(statusMoved ? { from: before.status, to: status.data } : {}),
          ...(notesMoved ? { notes: true } : {}),
        },
      });
    }
  }

  revalidatePath("/devside/dashboard");
  revalidatePath("/devside/leads");
  revalidatePath("/devside/audit");
  revalidatePath(`/devside/leads/${id.data}`);
  redirect(`/devside/leads/${id.data}${error ? "?error=save" : "?saved=1"}`);
}

export async function saveMessage(formData: FormData) {
  const admin = await requireAdmin();

  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(MESSAGE_STATUSES).safeParse(formData.get("status"));
  const notes = z.string().trim().max(4000).safeParse(formData.get("internalNotes") ?? "");
  if (!id.success || !status.success || !notes.success) redirect("/devside/messages?error=invalid");

  const service = adminSupabase();
  if (!service) redirect("/devside/messages?error=unconfigured");

  const { data: before } = await service
    .from("contact_messages")
    .select("status, internal_notes")
    .eq("id", id.data)
    .maybeSingle();

  const nextNotes = notes.data || null;
  const { error } = await service
    .from("contact_messages")
    .update({ status: status.data, internal_notes: nextNotes })
    .eq("id", id.data);

  if (!error && before) {
    const statusMoved = before.status !== status.data;
    const notesMoved = (before.internal_notes ?? null) !== nextNotes;
    if (statusMoved || notesMoved) {
      await writeAudit({
        actorEmail: admin.email,
        action: "message.update",
        entity: "contact_message",
        entityId: id.data,
        detail: {
          ...(statusMoved ? { from: before.status, to: status.data } : {}),
          ...(notesMoved ? { notes: true } : {}),
        },
      });
    }
  }

  revalidatePath("/devside/dashboard");
  revalidatePath("/devside/messages");
  revalidatePath("/devside/audit");
  redirect(`/devside/messages${error ? "?error=save" : "?saved=1"}`);
}

/**
 * Add somebody to the allowlist and ask Supabase to send them an invitation (§12.6).
 *
 * The order matters and is not obvious: the Auth user is created first, because
 * `admin_users_user_id_fkey` needs an id to point at, and the allowlist row second.
 * If the second insert fails the person holds an account they cannot use — inert
 * rather than open — and the console says the invitation failed so an owner retries
 * rather than assuming it worked.
 */
export async function inviteAdmin(formData: FormData) {
  const admin = await requireOwner();

  const email = emailField.safeParse(formData.get("email"));
  const role = roleField.safeParse(formData.get("role") ?? "staff");
  if (!email.success || !role.success) redirect("/devside/team?error=invalid");

  const service = adminSupabase();
  if (!service) redirect("/devside/team?error=unconfigured");

  const { data: existing } = await service
    .from("admin_users")
    .select("id")
    .ilike("email", email.data)
    .maybeSingle();
  if (existing) redirect("/devside/team?error=duplicate");

  const { data: invited, error } = await service.auth.admin.inviteUserByEmail(email.data, {
    redirectTo: absoluteUrl("/devside/auth/confirm"),
  });
  if (error || !invited.user) {
    /* A recorded account that was never allowlisted lands here: Supabase answers
       "already registered", that account cannot be re-invited, and this build cannot
       look one up by address — so the page says the invitation failed and an owner
       finishes it from the dashboard. */
    console.error("[devside] invite failed", error?.message);
    redirect("/devside/team?error=invite");
  }

  const { error: insertError } = await service.from("admin_users").insert({
    user_id: invited.user.id,
    email: email.data,
    role: role.data,
    invited_by: admin.email,
  });
  if (insertError) {
    console.error("[devside] allowlist insert failed after invite", insertError.message);
    redirect("/devside/team?error=invite");
  }

  await writeAudit({
    actorEmail: admin.email,
    action: "admin.invite",
    entity: "admin_user",
    entityId: invited.user.id,
    detail: { email: email.data, role: role.data },
  });

  revalidatePath("/devside/team");
  revalidatePath("/devside/audit");
  redirect("/devside/team?invited=1");
}

/** Deactivate or reactivate a row. Both refusals live in `lib/devside/team.ts`. */
export async function setAdminActive(formData: FormData) {
  const admin = await requireOwner();

  const id = uuidField.safeParse(formData.get("id"));
  const activate = formData.get("active") === "1";
  if (!id.success) redirect("/devside/team?error=invalid");

  const service = adminSupabase();
  if (!service) redirect("/devside/team?error=unconfigured");

  const { data: target } = await service
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", id.data)
    .maybeSingle();
  if (!target) redirect("/devside/team?error=save");

  if (activate) {
    if (target.is_active) redirect("/devside/team?error=unchanged");
  } else {
    const refusal = deactivationRefusal({
      actorEmail: admin.email,
      targetEmail: target.email,
      targetActive: target.is_active,
      targetRole: target.role === "owner" ? "owner" : "staff",
      activeOwnerCount: await activeOwnerCount(service),
    });
    if (refusal) redirect(`/devside/team?error=${refusal}`);
  }

  const { error } = await service
    .from("admin_users")
    .update({ is_active: activate })
    .eq("id", id.data);
  if (error) {
    console.error("[devside] allowlist update failed", error.message);
    redirect("/devside/team?error=save");
  }

  await writeAudit({
    actorEmail: admin.email,
    action: activate ? "admin.activate" : "admin.deactivate",
    entity: "admin_user",
    entityId: id.data,
    detail: { email: target.email },
  });

  revalidatePath("/devside/team");
  revalidatePath("/devside/audit");
  redirect("/devside/team?saved=1");
}

/** Owner or staff. Only the loss of the last active owner is refused. */
export async function setAdminRole(formData: FormData) {
  const admin = await requireOwner();

  const id = uuidField.safeParse(formData.get("id"));
  const role = roleField.safeParse(formData.get("role"));
  if (!id.success || !role.success) redirect("/devside/team?error=invalid");

  const service = adminSupabase();
  if (!service) redirect("/devside/team?error=unconfigured");

  const { data: target } = await service
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", id.data)
    .maybeSingle();
  if (!target) redirect("/devside/team?error=save");

  const before = target.role === "owner" ? "owner" : "staff";
  const refusal = roleChangeRefusal({
    actorEmail: admin.email,
    targetEmail: target.email,
    targetActive: target.is_active,
    targetRole: before,
    nextRole: role.data,
    activeOwnerCount: await activeOwnerCount(service),
  });
  if (refusal) redirect(`/devside/team?error=${refusal}`);

  const { error } = await service.from("admin_users").update({ role: role.data }).eq("id", id.data);
  if (error) {
    console.error("[devside] role update failed", error.message);
    redirect("/devside/team?error=save");
  }

  await writeAudit({
    actorEmail: admin.email,
    action: "admin.role",
    entity: "admin_user",
    entityId: id.data,
    detail: { email: target.email, from: before, to: role.data },
  });

  revalidatePath("/devside/team");
  revalidatePath("/devside/audit");
  redirect("/devside/team?saved=1");
}
