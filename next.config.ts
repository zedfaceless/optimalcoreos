import type { NextConfig } from "next";

/**
 * Headers, not middleware, for the two things that must be true of every response
 * (PRD §12.1, §15.6).
 *
 * `/devside` is noindex by header rather than by `robots.txt`: a `Disallow` line
 * would print the path in a file anybody can read, which is the one thing §12.1
 * forbids. `no-store` rides along so a console page can never come back from a
 * proxy with the previous admin's leads on it.
 *
 * The CSP allows inline script. Next writes the hydration bootstrap inline, and the
 * public pages are prerendered, so a nonce would have to be minted per request and
 * the pages could no longer be static. Every other directive is pinned; the
 * remaining hole is inline injection, not an external script host.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/devside/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
