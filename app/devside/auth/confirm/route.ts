import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site/config";

/**
 * `GET /devside/auth/confirm` — where a recovery or invitation link lands (§14.5).
 *
 * A route handler and not a page, because turning the link into a session writes
 * cookies and a Server Component cannot. Both shapes Auth sends are accepted: a
 * `token_hash` with a `type`, which is what `supabase/templates/*.html` links to, and
 * a `code`, which is what the PKCE flow redirects with. One of the two always
 * arrives; when neither does the link was already spent, and the page says so.
 *
 * The route is in `additional_redirect_urls` in `supabase/config.toml`, and every
 * hosted project has to list it in the dashboard too — an unlisted redirect is
 * refused by Auth before this handler ever runs.
 */
const OTP_TYPES = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

function isOtpType(value: string | null): value is EmailOtpType {
  return value !== null && OTP_TYPES.includes(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const expired = () => NextResponse.redirect(absoluteUrl("/devside/update-password?error=expired"));

  const client = await supabaseServer();
  if (!client) {
    return NextResponse.redirect(absoluteUrl("/devside/update-password?error=unconfigured"));
  }

  if (tokenHash && isOtpType(type)) {
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.error("[devside] token link refused", error.message);
      return expired();
    }
    return NextResponse.redirect(absoluteUrl("/devside/update-password"));
  }

  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[devside] code exchange refused", error.message);
      return expired();
    }
    return NextResponse.redirect(absoluteUrl("/devside/update-password"));
  }

  return expired();
}
