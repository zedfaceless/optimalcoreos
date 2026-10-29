import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/app/devside/actions";
import { currentAdmin, devsideConfigured } from "@/lib/devside/auth";

/**
 * `/devside` — the login page (PRD §12.2).
 *
 * A signed-in admin is sent on to the dashboard, so this page is never a place a
 * session lingers. Every failure below renders the same sentence: which half of a
 * credential pair was wrong is not something a login page should teach.
 */
const ERRORS: Record<string, string> = {
  invalid: "Invalid credentials.",
  throttled: "Too many attempts. Please wait a few minutes and try again.",
  unconfigured: "The console is not configured on this deployment yet.",
};

export const metadata = { title: "Sign in" };

export default async function DevsideLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await currentAdmin();
  if (admin) redirect("/devside/dashboard");

  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? ERRORS.invalid) : "";
  const configured = devsideConfigured();

  return (
    <div className="mx-auto max-w-sm py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        The console is for the Optimal Core OS team. Access is granted by invitation.
      </p>

      {message ? (
        <p
          role="alert"
          className="mt-6 rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {message}
        </p>
      ) : null}

      {configured ? (
        <form action={signIn} className="mt-6 space-y-4">
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Sign in
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-600">
          Set <code className="text-navy-900">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="text-navy-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
          <code className="text-navy-900">SUPABASE_SERVICE_ROLE_KEY</code>, then run the migrations.
          Until then nobody can sign in, and the console says so instead of pretending.
        </p>
      )}

      {configured ? (
        <p className="mt-6 text-sm">
          <Link href="/devside/reset-password" className="text-brand-600 hover:underline">
            Forgot your password?
          </Link>
        </p>
      ) : null}
    </div>
  );
}
