/**
 * Small helpers every public form route needs: a JSON reply, the visitor's address
 * for the hash and the rate limit, and an in-process throttle.
 *
 * The throttle is deliberately modest. It lives in the instance's memory, so on
 * Vercel it protects one warm function rather than the whole deployment; it stops
 * a double-submit and a bored script, not a determined one. The database is the
 * durable record and `docs/PLACEHOLDERS.md` says so.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  if (entry.count > limit) return false;
  return true;
}

/** Test seam: lets a suite start from an empty throttle. */
export function resetRateLimits() {
  hits.clear();
}

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip") ?? null;
}

/**
 * A hidden field a person never sees and a naive bot fills in. When it holds a
 * value the route answers exactly as it would on success and writes nothing.
 */
export function honeypotTripped(body: Record<string, unknown>): boolean {
  const value = body.website;
  return typeof value === "string" && value.trim().length > 0;
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export function jsonError(status: number, message: string, fields?: Record<string, string>) {
  return json({ ok: false, message, ...(fields ? { fields } : {}) }, status);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
