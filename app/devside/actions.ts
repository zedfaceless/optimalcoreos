"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { rateLimit } from "@/lib/api/guard";
import { requireAdmin } from "@/lib/devside/auth";
import { adminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * The console's four mutations (PRD §12.2, §12.5).
 *
 * Every action asks `requireAdmin()` for itself. A console page redirects a guest
 * before it renders, but a Server Action is a POST to the same route and that page's
 * guard is not the thing that decided — this is.
 */

const credentials = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
  /** Length only: the rule that matters is Supabase's, and echoing it here would
      let a stranger measure passwords through our error messages. */
  password: z.string().min(1).max(200),
});

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

export async function saveLead(formData: FormData) {
  await requireAdmin();

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

  const { error } = await service
    .from("quote_requests")
    .update({ status: status.data, internal_notes: notes.data || null })
    .eq("id", id.data);

  revalidatePath("/devside/dashboard");
  revalidatePath("/devside/leads");
  revalidatePath(`/devside/leads/${id.data}`);
  redirect(`/devside/leads/${id.data}${error ? "?error=save" : "?saved=1"}`);
}

export async function saveMessage(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(MESSAGE_STATUSES).safeParse(formData.get("status"));
  const notes = z.string().trim().max(4000).safeParse(formData.get("internalNotes") ?? "");
  if (!id.success || !status.success || !notes.success) redirect("/devside/messages?error=invalid");

  const service = adminSupabase();
  if (!service) redirect("/devside/messages?error=unconfigured");

  const { error } = await service
    .from("contact_messages")
    .update({ status: status.data, internal_notes: notes.data || null })
    .eq("id", id.data);

  revalidatePath("/devside/dashboard");
  revalidatePath("/devside/messages");
  redirect(`/devside/messages${error ? "?error=save" : "?saved=1"}`);
}
