import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The service-role client: imported by the two public route handlers under
 * `app/api/**` and by the `/devside` console, and by nothing else.
 *
 * It exists because `quote_requests`, `contact_messages` and `admin_users` carry RLS
 * with **no policy at all** and their grants are revoked from `anon` and
 * `authenticated`: no browser, signed in or not, can read or write a lead. The
 * console therefore checks the session and the allowlist first, then reads through
 * this key. Nothing in a client component may import this module — `server-only`
 * above turns that mistake into a build error rather than a leaked key.
 *
 * When the two variables are absent — a fresh clone before `pnpm db:start` — the
 * factory returns null rather than throwing at import time, so the site still
 * builds and renders; the form then tells the visitor to email us instead of
 * pretending the request was saved, and the console says it is not configured.
 */
export function adminSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "optimal-core-os-web" } },
  });
}

/**
 * A hash of the visitor's IP, never the address itself (§11.4, and the privacy
 * page says so). SHA-256 over the address plus a server-side salt, truncated to
 * 32 characters: enough to spot a repeated sender, useless as an address.
 */
export async function hashIp(value: string | null): Promise<string | null> {
  if (!value) return null;
  const salt = process.env.IP_HASH_SALT ?? "";
  const data = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
