import "server-only";
import { redirect } from "next/navigation";
import { adminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type Admin = {
  id: string;
  email: string;
  displayName: string | null;
  role: "owner" | "staff";
};

/**
 * Who is signed in, if they are an admin (PRD §12.2).
 *
 * Three questions, in this order: does the cookie hold a session, does that session
 * survive a check against Supabase, and is the user on the allowlist. The third is
 * asked of `admin_users` with the service key because no client is allowed to read
 * that table — the anon key could not answer it even if it tried.
 */
export async function currentAdmin(): Promise<Admin | null> {
  const client = await supabaseServer();
  if (!client) return null;

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const service = adminSupabase();
  if (!service) return null;

  const { data } = await service
    .from("admin_users")
    .select("email, display_name, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data || !data.is_active) return null;

  return {
    id: user.id,
    email: data.email,
    displayName: data.display_name,
    role: data.role === "owner" ? "owner" : "staff",
  };
}

/**
 * The page guard: a visitor without a session never sees a console route.
 *
 * A session that is valid but not allowlisted — somebody deactivated while they still
 * hold a cookie — is refused here too, because `currentAdmin()` asks the allowlist on
 * every request. The cookie itself survives: a Server Component cannot delete one, and
 * there is no proxy in front. That is inert rather than open (every page redirects and
 * the export answers 401), and `signIn()` clears it the moment they try to sign in
 * again. If a route ever needs the browser to forget a stale session immediately, that
 * route has to be a Server Action or a `proxy.ts` — not this function.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await currentAdmin();
  if (!admin) redirect("/devside");
  return admin;
}

/**
 * The owner-only guard: the team page and the three mutations behind it.
 *
 * `role` is read from the allowlist row by `currentAdmin()`, so this is the same
 * question the page asks, answered once more before a write. A staff admin who POSTs
 * an invite form directly gets the same refusal as one who never saw the page.
 */
export async function requireOwner(): Promise<Admin> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/devside/dashboard?error=owner-only");
  return admin;
}


/** True once the environment is complete enough to sign anybody in at all. */
export function devsideConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
