import Link from "next/link";
import { setNewPassword } from "@/app/devside/actions";
import { currentAdmin } from "@/lib/devside/auth";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * `/devside/update-password` — the second half of recovery, and the last step of an
 * invitation. Both land here with a session that `/devside/auth/confirm` already
 * verified; this page only asks for the password.
 *
 * Three states are told apart on purpose. No session at all means the link is spent or
 * expired. A session for an account that is not on the allowlist means somebody was
 * invited and then deactivated, or is holding a mailbox nobody added — the password
 * form would be a lie, so it is not shown. Only the third renders the form.
 */
export const metadata = { title: "Set a new password" };

const ERRORS: Record<string, string> = {
  short: "Use at least twelve characters.",
  mismatch: "The two passwords do not match.",
  refused: "That password was refused. Try a longer one with letters and digits.",
  allowlist: "This account is not on the console allowlist. Ask an owner to add you.",
  expired: "That link has expired or has already been used. Request a fresh one.",
  unconfigured: "The console is not configured on this deployment yet.",
};

const PANEL = "mt-6 rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-600";

const INPUT =
  "mt-1.5 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "") : "";

  const client = await supabaseServer();
  if (!client) {
    return (
      <div className="mx-auto max-w-sm py-8 sm:py-16">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Set a new password</h1>
        <p className={PANEL}>The console is not configured on this deployment.</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-sm py-8 sm:py-16">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Set a new password</h1>
        <p className={PANEL}>
          This link has expired or has already been used. Request a fresh one and it will work.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/devside/reset-password" className="text-brand-600 hover:underline">
            Send me a new link
          </Link>
        </p>
      </div>
    );
  }

  const admin = await currentAdmin();
  if (!admin) {
    return (
      <div className="mx-auto max-w-sm py-8 sm:py-16">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Set a new password</h1>
        <p className={PANEL}>
          You are signed in as {user.email}, but that account is not on the console allowlist, so there
          is nothing here to set a password for.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/devside" className="text-brand-600 hover:underline">
            Back to the console
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Set a new password</h1>
      <p className="mt-2 text-sm text-gray-600">
        For {admin.email}. At least twelve characters, with letters and digits.
      </p>

      {message ? (
        <p
          role="alert"
          className="mt-6 rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {message}
        </p>
      ) : null}

      <form action={setNewPassword} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-900">
            Type it again
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            className={INPUT}
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Save the password
        </button>
      </form>
    </div>
  );
}
