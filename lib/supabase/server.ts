import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The cookie-bound client, used by `/devside` and by nothing on the public site.
 *
 * It carries the admin's session, so it can say who is signed in — but it is not
 * what reads the leads: those tables have no policy at all, so every read on the
 * console goes through `adminSupabase()` after `requireAdmin()` has said yes.
 *
 * Returns null rather than throwing when the environment is not configured, so a
 * fresh clone still builds and `/devside` can say what is missing instead of a 500.
 */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          /* A Server Component cannot write cookies. The sign-in action and the
             proxy are the two places that can, and both run before a page renders,
             so a failure here means the refresh already happened. */
        }
      },
    },
  });
}
