import { json } from "@/lib/api/guard";

/**
 * `GET /api/version` — which commit this deployment was built from, and nothing else.
 *
 * It exists so a machine can tell a fresh deployment from the one before it.
 * Vercel builds `main` through its Git integration and posts nothing back to this
 * repository when it finishes, so `.github/workflows/verify-production.yml` cannot
 * hear the deploy land; it polls instead, and this endpoint is the thing it polls.
 * Without it the only way to know the new commit is live is a person refreshing the
 * dashboard, which is how a verification step quietly stops running.
 *
 * Three fields and no keys, no paths, no build host: a commit SHA is the identity of
 * published code, not a secret. `no-store` comes from `json()` in `lib/api/guard`
 * because a cached answer is exactly the wrong answer — the question is always "what
 * is live now". `force-dynamic` keeps it a function rather than a prerendered route,
 * so the values are read from the running deployment's environment.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    env: process.env.VERCEL_ENV ?? null,
  });
}
