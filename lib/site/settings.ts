import "server-only";

/**
 * Every value the PRD marks `[PLACEHOLDER]` is read from the environment, never
 * typed into a component (§0.4). The fallbacks exist so a fresh clone renders a
 * complete site; each one is listed in `docs/PLACEHOLDERS.md` with what to replace
 * it with before launch.
 */
export type SiteSettings = {
  email: string;
  phone: string | null;
  hours: string;
  timezone: string;
  responsePromise: string;
  retentionMonths: number;
  meetingHours: { start: number; end: number; slotMinutes: number };
};

export function getSiteSettings(): SiteSettings {
  return {
    email: process.env.CONTACT_PUBLIC_EMAIL ?? "hello@optimalcoreos.com",
    phone: process.env.CONTACT_PUBLIC_PHONE ?? null,
    hours: process.env.CONTACT_PUBLIC_HOURS ?? "Monday to Friday, 09:00–17:00 (Asia/Manila)",
    timezone: "Asia/Manila",
    responsePromise: "We reply within 1 business day.",
    retentionMonths: Number(process.env.DATA_RETENTION_MONTHS ?? 24),
    meetingHours: { start: 9, end: 17, slotMinutes: 30 },
  };
}

export function ownerNotifyEmails(): string[] {
  return (process.env.OWNER_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
