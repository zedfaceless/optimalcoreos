import Link from "next/link";
import { requestPasswordReset } from "@/app/devside/actions";
import { devsideConfigured } from "@/lib/devside/auth";

/**
 * `/devside/reset-password` — the first half of the in-app recovery flow (§14.5).
 *
 * It exists because a locked-out admin used to need the Supabase dashboard. The page
 * says "if that address has an account" and never confirms one: whether an address is
 * on the allowlist is not something an unauthenticated form may answer.
 */
export const metadata = { title: "Reset password" };

const ERRORS: Record<string, string> = {
  invalid: "That does not look like an email address.",
  throttled: "Too many reset requests. Please wait a few minutes and try again.",
  unconfigured: "The console is not configured on this deployment yet.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const message = error ? (ERRORS[error] ?? ERRORS.invalid) : "";
  const configured = devsideConfigured();

  return (
    <div className="mx-auto max-w-sm py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Reset password</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter the address your account uses and we will send a link to set a new password.
      </p>

      {message ? (
        <p
          role="alert"
          className="mt-6 rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {message}
        </p>
      ) : null}

      {sent ? (
        <p
          role="status"
          className="mt-6 rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-600"
        >
          If that address has an account, a link is on its way. It expires in an hour.
        </p>
      ) : null}

      {configured ? (
        <form action={requestPasswordReset} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Send the link
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-600">
          Set <code className="text-navy-900">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-navy-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> first. Until then no
          mail can be sent, and the console says so instead of pretending.
        </p>
      )}

      <p className="mt-6 text-sm">
        <Link href="/devside" className="text-brand-600 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
