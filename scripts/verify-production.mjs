#!/usr/bin/env node
/**
 * Checks what a production deployment is actually serving, and exits non-zero when it
 * is not what this repository promises.
 *
 * This is `docs/deploy.md` §7 turned into a program. §7 is a block of curl commands a
 * person runs before calling a deploy good, and the two that matter most are the quiet
 * ones: `/devside` answering `X-Robots-Tag: noindex` (a header, not a `robots.txt`
 * line, so nothing else keeps the console out of an index) and `sitemap.xml` naming the
 * real origin (a build with `NEXT_PUBLIC_SITE_URL` unset publishes `http://localhost:3000`
 * to every crawler and looks perfectly healthy from the outside).
 *
 * Two more checks are here because they were pre-launch findings rather than
 * documentation: `/icon.jpeg` is guarded by size, because the file convention serves
 * the raster as-is and a 2048² master shipped 1.3 MB to every first-time visitor
 * before it was resized; and `/robots.txt` must not name `/devside`, because a
 * `Disallow` line is a public advertisement of the path.
 *
 * It holds no secret and writes nothing — GETs and header reads — which is what lets
 * `.github/workflows/verify-production.yml` run it on every push to `main` with the
 * default read-only token.
 *
 * Usage:
 *   node scripts/verify-production.mjs [url]          # check now
 *   node scripts/verify-production.mjs --wait-for-commit <sha>
 *                                                    # poll /api/version until that
 *                                                    # commit is live, then check
 *
 * The origin comes from the first `http…` argument, else `$PRODUCTION_URL`, else the
 * project's own `vercel.app` host. `--wait-seconds` (default 600) bounds the wait.
 */

const DEFAULT_URL = "https://optimalcoreos.vercel.app";
const ICON_BUDGET_BYTES = 200 * 1024;

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : (args[index + 1] ?? "");
};

const site = (
  args.find((arg) => arg.startsWith("http")) ??
  process.env.PRODUCTION_URL ??
  DEFAULT_URL
)
  .trim()
  .replace(/\/+$/, "");
const expectedCommit = (flag("--wait-for-commit") ?? process.env.EXPECT_COMMIT ?? "").trim();
const waitSeconds = Number(flag("--wait-seconds") ?? 600);

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
}

async function get(path, init) {
  return fetch(`${site}${path}`, { redirect: "follow", cache: "no-store", ...init });
}

/**
 * Vercel reports no completion back to this repository, so the wait is a poll of the
 * one endpoint that names the built commit. Fifteen seconds between attempts is the
 * build's own order of magnitude; a warm redeploy answers on the first try.
 */
async function waitForCommit(commit) {
  if (!commit) return;
  const deadline = Date.now() + waitSeconds * 1000;
  let lastSeen = "no answer";
  process.stdout.write(`waiting for ${commit.slice(0, 12)} to be live at ${site}`);
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${site}/api/version`, { cache: "no-store" });
      if (res.ok) {
        const body = await res.json();
        lastSeen = typeof body?.commit === "string" && body.commit ? body.commit : "null commit";
        if (lastSeen === commit) {
          console.log(`\nlive: ${commit.slice(0, 12)}`);
          return;
        }
      } else {
        lastSeen = `HTTP ${res.status}`;
      }
    } catch {
      lastSeen = "connection failed";
    }
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
  console.log();
  record(
    "the pushed commit is live",
    false,
    `${waitSeconds}s elapsed; /api/version last answered "${lastSeen}", expected ${commit.slice(0, 12)}`,
  );
}

async function checkHome() {
  const res = await get("/");
  const body = await res.text();
  record("/ answers 200", res.status === 200, `status ${res.status}`);
  record(
    "/ is this site",
    body.includes("Optimal Core OS"),
    body.includes("Optimal Core OS") ? "" : "page did not name the product",
  );

  const csp = res.headers.get("content-security-policy") ?? "";
  record("CSP is sent", csp.length > 0, "no Content-Security-Policy header");
  record(
    "CSP has no unsafe-eval",
    csp.length > 0 && !csp.includes("unsafe-eval"),
    csp.includes("unsafe-eval") ? "unsafe-eval present — a development policy shipped" : "",
  );
  const header = (name) => res.headers.get(name) ?? "";
  record(
    "X-Content-Type-Options",
    header("x-content-type-options").toLowerCase() === "nosniff",
    header("x-content-type-options") || "missing",
  );
  record(
    "X-Frame-Options",
    header("x-frame-options").toUpperCase() === "DENY",
    header("x-frame-options") || "missing",
  );
  record(
    "Strict-Transport-Security",
    /max-age=\d+/.test(header("strict-transport-security")),
    header("strict-transport-security") || "missing",
  );
  record(
    "Referrer-Policy",
    header("referrer-policy") !== "",
    header("referrer-policy") || "missing",
  );
  record(
    "Permissions-Policy",
    header("permissions-policy") !== "",
    header("permissions-policy") || "missing",
  );
}

async function checkDevside() {
  const res = await get("/devside");
  const robots = (res.headers.get("x-robots-tag") ?? "").toLowerCase();
  record("/devside answers 200", res.status === 200, `status ${res.status}`);
  record(
    "/devside is noindex by header",
    robots.includes("noindex"),
    robots ? `X-Robots-Tag: ${robots}` : "no X-Robots-Tag header",
  );
}

async function checkIcons() {
  const icon = await get("/icon.jpeg");
  const bytes = icon.ok ? (await icon.arrayBuffer()).byteLength : 0;
  record("/icon.jpeg answers 200", icon.status === 200, `status ${icon.status}`);
  record(
    "/icon.jpeg is a jpeg",
    (icon.headers.get("content-type") ?? "").includes("image/jpeg"),
    icon.headers.get("content-type") ?? "missing content-type",
  );
  record(
    `/icon.jpeg is under ${Math.round(ICON_BUDGET_BYTES / 1024)} KB`,
    bytes > 0 && bytes <= ICON_BUDGET_BYTES,
    `${Math.round(bytes / 1024)} KB`,
  );

  const apple = await get("/apple-icon.jpeg");
  record("/apple-icon.jpeg answers 200", apple.status === 200, `status ${apple.status}`);
}

async function checkManifest() {
  const res = await get("/manifest.webmanifest");
  record("/manifest.webmanifest answers 200", res.status === 200, `status ${res.status}`);
  try {
    const manifest = await res.json();
    const icons = Array.isArray(manifest?.icons) ? manifest.icons : [];
    record(
      "manifest names icons",
      icons.length >= 2,
      `${icons.length} icon entr${icons.length === 1 ? "y" : "ies"}`,
    );
    record("manifest name", manifest?.name === "Optimal Core OS", String(manifest?.name));
  } catch {
    record("manifest parses as JSON", false, "not JSON");
  }
}

async function checkSitemapAndRobots() {
  const host = new URL(site).host;
  const sitemap = await get("/sitemap.xml");
  const sitemapBody = await sitemap.text();
  record("/sitemap.xml answers 200", sitemap.status === 200, `status ${sitemap.status}`);
  record(
    "sitemap names the real origin",
    !sitemapBody.includes("localhost"),
    sitemapBody.includes("localhost")
      ? "http://localhost:3000 — NEXT_PUBLIC_SITE_URL was unset at build"
      : "",
  );
  const namesHost = sitemapBody.includes(host);
  record("sitemap names this host", namesHost, namesHost ? "" : `no ${host} in the sitemap`);

  const robots = await get("/robots.txt");
  const robotsBody = await robots.text();
  record("/robots.txt answers 200", robots.status === 200, `status ${robots.status}`);
  const advertises = robotsBody.includes("/devside");
  record(
    "robots.txt does not advertise /devside",
    !advertises,
    advertises ? "a Disallow line names the console's path" : "",
  );
  const namesSitemap = robotsBody.includes(`${host}/sitemap.xml`);
  record(
    "robots.txt names the sitemap",
    namesSitemap,
    namesSitemap ? "" : `${host}/sitemap.xml is not in the file`,
  );
}

async function checkNotFound() {
  const res = await get("/this-page-does-not-exist-2f4b");
  record("an unknown path answers 404", res.status === 404, `status ${res.status}`);
}

/**
 * §7's first block: the pages answer with pages, not empty 200s. `/devside` is in its
 * own check because it is the one that must also be noindex.
 */
async function checkPages() {
  for (const path of ["/", "/contact", "/request-quote", "/solutions", "/how-we-work"]) {
    const res = await get(path);
    const type = res.headers.get("content-type") ?? "";
    record(
      `${path} answers 200 html`,
      res.status === 200 && type.includes("text/html"),
      `status ${res.status}, ${type || "no content-type"}`,
    );
  }
}

/**
 * §7's last block, side-effect-free half: an empty body is refused by validation, which
 * proves the route and the Supabase client are both wired. A 503 here is a missing key
 * and a 500 is a missing table, so this asserts the answer rather than accepting any
 * non-200.
 */
async function checkContactValidation() {
  try {
    const res = await get("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    record(
      "empty POST /api/contact is refused by validation",
      res.status === 422,
      `status ${res.status}${res.status === 503 ? " — a key is missing" : ""}${res.status === 500 ? " — a table is missing" : ""}`,
    );
  } catch (error) {
    record("empty POST /api/contact is refused by validation", false, String(error));
  }
}

async function checkVersion() {
  const res = await get("/api/version");
  record("/api/version answers 200", res.status === 200, `status ${res.status}`);
  try {
    const body = await res.json();
    record(
      "/api/version names a commit",
      typeof body?.commit === "string" && /^[0-9a-f]{7,40}$/.test(body.commit),
      `commit: ${body?.commit ?? "null"}`,
    );
  } catch {
    record("/api/version parses as JSON", false, "not JSON");
  }
}

async function main() {
  if (!/^https?:\/\//.test(site)) {
    console.error(`Not a URL: ${site}`);
    process.exit(2);
  }
  console.log(`Verifying ${site}${expectedCommit ? ` for ${expectedCommit.slice(0, 12)}` : ""}\n`);

  await waitForCommit(expectedCommit);
  await checkHome();
  await checkPages();
  await checkDevside();
  await checkIcons();
  await checkManifest();
  await checkSitemapAndRobots();
  await checkNotFound();
  await checkContactValidation();
  await checkVersion();

  for (const { name, ok, detail } of results) {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  }
  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    for (const { name } of failed) console.log(`::error title=Production check failed::${name}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
