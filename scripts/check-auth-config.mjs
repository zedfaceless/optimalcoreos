#!/usr/bin/env node
/**
 * Asserts the Auth settings this repository is built around.
 *
 * Two of them cannot be checked from here — a hosted project's password floor and its
 * signup switch live in the dashboard, and `supabase/config.toml` only describes the local
 * stack. What this script can do is stop the file from drifting away from what the app
 * assumes, and print the two values a person has to match by hand, so the mismatch is
 * something a CI run names rather than something a reviewer remembers.
 *
 * It is not a TOML parser. It reads the top-level `[section]` header and `key = value`
 * lines it cares about, which is the whole file's shape today; a nested table inside one of
 * those sections would need `smol-toml` or a rewrite, and the check says so if a section it
 * needs goes missing.
 *
 * Run with `pnpm check:config` (also part of `pnpm check`).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "supabase", "config.toml");

let source;
try {
  source = readFileSync(configPath, "utf8");
} catch {
  console.error(`check-auth-config: cannot read ${configPath}`);
  process.exit(1);
}

/** Section header → { key: rawValue }. Comments and blank lines are dropped. */
function parse(text) {
  const out = new Map();
  const lines = text.split(/\r?\n/);
  let section = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith("#")) continue;

    const header = /^\[([^\]]+)\]$/.exec(line);
    if (header) {
      section = header[1];
      if (!out.has(section)) out.set(section, new Map());
      continue;
    }

    const assignment = /^([A-Za-z0-9_]+)\s*=\s*(.+)$/.exec(line);
    if (!assignment || !section) continue;

    /* A value can span lines: `additional_redirect_urls` is written as one URL per line so
       a reader can see them. Keep reading until the bracket that opened the value closes. */
    let raw = assignment[2].replace(/\s+#.*$/, "").trim();
    if (raw.startsWith("[") && !raw.includes("]")) {
      while (index + 1 < lines.length && !raw.includes("]")) {
        index += 1;
        const next = lines[index].trim().replace(/\s+#.*$/, "");
        if (!next || next.startsWith("#")) continue;
        raw += ` ${next}`;
      }
    }

    if (!out.has(section)) out.set(section, new Map());
    out.get(section).set(assignment[1], raw);
  }
  return out;
}

const toml = parse(source);

const failures = [];
const passes = [];

function check(label, actual, expected) {
  if (actual === expected) {
    passes.push(`${label} = ${actual}`);
  } else {
    failures.push(`${label}: expected ${expected}, found ${actual ?? "(missing)"}`);
  }
}

function value(section, key) {
  return toml.get(section)?.get(key);
}

/* Signups shut, password floor twelve, and the email provider still on — the two
   separate switches that read alike and mean different things. */
check("[auth] enable_signup", value("auth", "enable_signup"), "false");
check("[auth] minimum_password_length", value("auth", "minimum_password_length"), "12");
check("[auth] password_requirements", value("auth", "password_requirements"), '"letters_digits"');
check("[auth.email] enable_signup", value("auth.email", "enable_signup"), "true");
check("[auth.email] enable_confirmations", value("auth.email", "enable_confirmations"), "false");

/* The recovery and invitation flow needs this exact redirect target. */
const redirects = value("auth", "additional_redirect_urls") ?? "";
if (redirects.includes("/devside/auth/confirm")) {
  passes.push('redirect allow-list includes /devside/auth/confirm');
} else {
  failures.push('redirect allow-list is missing "/devside/auth/confirm"');
}

/* Every branded template is wired and its file is where the path says. */
for (const name of ["invite", "recovery", "confirmation", "magic_link"]) {
  const section = `auth.email.template.${name}`;
  const subject = value(section, "subject");
  const contentPath = value(section, "content_path");
  if (!subject) {
    failures.push(`${section} has no subject`);
    continue;
  }
  if (!contentPath) {
    failures.push(`${section} has no content_path`);
    continue;
  }
  const file = join(root, contentPath.replace(/^"|"$/g, ""));
  if (existsSync(file)) {
    passes.push(`${name} template → ${contentPath.replace(/^"|"$/g, "")}`);
  } else {
    failures.push(`${name} template file is missing: ${contentPath}`);
  }
}

for (const line of passes) console.log(`  ok   ${line}`);
for (const line of failures) console.error(`  FAIL ${line}`);

console.log(
  [
    "",
    "Hosted projects have to match by hand (dashboard → Authentication):",
    "  · Minimum password length: 12",
    "  · Allow new users to sign up: off",
    "  · Redirect URLs: https://<site>/devside/auth/confirm",
    "  · The four emails in supabase/templates/ pasted into Emails → Templates",
    "docs/PLACEHOLDERS.md carries the same list beside what each one costs.",
  ].join("\n"),
);

if (failures.length > 0) {
  console.error(`\ncheck-auth-config: ${failures.length} problem(s).`);
  process.exit(1);
}
console.log(`\ncheck-auth-config: ${passes.length} checks passed.`);
