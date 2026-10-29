/**
 * The three cheap bot signals from §15.5, as pure functions.
 *
 * All three are *heuristics*, so all three are advisory in one direction only: they
 * can end a submission, and they can never rescue one. The route handlers answer a
 * dropped submission exactly as they answer a saved one, because a bot that learns
 * which signal fired has been handed a test suite.
 *
 * The deliberate asymmetry is in `elapsedMs`: a missing or impossible timestamp
 * returns `null` and drops nothing. A bot can omit `formStartedAt` to skip the floor,
 * and it will — but the alternative is a real visitor whose clock is wrong or whose
 * JavaScript was still booting losing a lead they typed out by hand, and that is the
 * worse of the two failures. The floor only ends a submission when the browser
 * positively said it was too quick.
 */

/** A person cannot fill either form in less than this, and a script does it in one tick. */
export const MIN_FILL_MS = 3000;

/**
 * Anything older than this is a clock we cannot read rather than a submission that
 * took six hours. Without the ceiling, a machine set to 1970 would be dropped.
 */
const MAX_PLAUSIBLE_ELAPSED_MS = 6 * 60 * 60_000;

/**
 * A sample of the throwaway providers, not a subscription feed.
 *
 * It is a floor: the services rotate domains weekly, so this list catches the
 * lazy script and the person reusing a ten-minute inbox, and it will miss a
 * determined sender. Matched on the domain and its subdomains, never on the local
 * part, so `mailinator.com.evil.example` is not a match.
 */
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "anonbox.net",
  "burnermail.io",
  "discard.email",
  "discardmail.com",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "emailtemp.org",
  "fakeinbox.com",
  "fakemail.net",
  "filzmail.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "grr.la",
  "harakirimail.com",
  "inboxalias.com",
  "incognitomail.com",
  "jetable.org",
  "linshiyouxiang.net",
  "mail-temp.com",
  "mailcatch.com",
  "maildrop.cc",
  "mailexpire.com",
  "mailforspam.com",
  "mailinator.com",
  "mailinator.net",
  "mailinator2.com",
  "mailnesia.com",
  "mailnull.com",
  "mailsac.com",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "mvrht.net",
  "mytemp.email",
  "nada.email",
  "sharklasers.com",
  "spam4.me",
  "spambox.us",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spamhereplease.com",
  "temp-mail.io",
  "temp-mail.org",
  "tempail.com",
  "tempinbox.com",
  "tempmail.com",
  "tempmail.dev",
  "tempmail.net",
  "tempmailo.com",
  "tempr.email",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "trash-mail.com",
  "wegwerfemail.de",
  "wegwerfmail.de",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

/** More than this many links in a free-text field is a link drop, not a request. */
export const MAX_LINKS = 3;

export type SpamReason = "too-fast" | "disposable-domain" | "too-many-links";

/**
 * How long the browser says the form was open, or `null` when that cannot be known.
 *
 * A number, a numeric string and nothing else: the value arrives in a JSON body a
 * stranger writes, so `true`, `[]` and `"soon"` are all "unknown" rather than a
 * clever coercion.
 */
export function elapsedMs(startedAt: unknown, now: number = Date.now()): number | null {
  let started: number;
  if (typeof startedAt === "number") started = startedAt;
  else if (typeof startedAt === "string" && startedAt.trim() !== "") started = Number(startedAt);
  else return null;

  if (!Number.isFinite(started)) return null;
  const elapsed = now - started;
  if (elapsed < 0 || elapsed > MAX_PLAUSIBLE_ELAPSED_MS) return null;
  return elapsed;
}

/** True only when the browser said the form was completed faster than a person can. */
export function isTooFast(startedAt: unknown, now: number = Date.now()): boolean {
  const elapsed = elapsedMs(startedAt, now);
  return elapsed !== null && elapsed < MIN_FILL_MS;
}

/** The domain part, lowercased, or `null` for something that is not an address. */
function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  return email
    .slice(at + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
}

/**
 * Whether the address is at a throwaway provider, subdomains included.
 *
 * `mailinator.com` matches, `mx.mailinator.com` matches, and `notmailinator.com`
 * does not — the check is on label boundaries, so a business that happens to run
 * its own mail server is never caught by a substring.
 */
export function isDisposableEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  for (const candidate of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${candidate}`)) return true;
  }
  return false;
}

/** Counts `http(s)://` and `www.` links; a bare `example.com` is a mention, not a link. */
export function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/|www\./gi);
  return matches ? matches.length : 0;
}

/**
 * The one question the two route handlers ask. Returns why a submission is being
 * dropped, or `null` when nothing fired.
 *
 * Order matters only for the log line: the earliest signal is the cheapest to
 * explain, and one reason per submission is all a log needs.
 */
export function spamReason(input: {
  formStartedAt?: unknown;
  email: string;
  text: string;
  now?: number;
}): SpamReason | null {
  const now = input.now ?? Date.now();
  if (isTooFast(input.formStartedAt, now)) return "too-fast";
  if (isDisposableEmail(input.email)) return "disposable-domain";
  if (countLinks(input.text) > MAX_LINKS) return "too-many-links";
  return null;
}
