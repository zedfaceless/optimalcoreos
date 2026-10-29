import { dateLabel, labelForSlot, MEETING_TIMEZONE } from "@/lib/site/meetings";

/**
 * The console's labels. Pure functions, so they live outside the page components
 * and can be unit-tested without a database.
 */

export const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
};

export const MESSAGE_STATUSES = ["new", "replied", "archived", "spam"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

const MESSAGE_STATUS_LABELS: Record<string, string> = {
  new: "Unread",
  replied: "Replied",
  archived: "Archived",
  spam: "Spam",
};

export function messageStatusLabel(status: string): string {
  return MESSAGE_STATUS_LABELS[status] ?? status;
}

/** The slot as the studio reads it: the wall clock is already Manila's. */
export function slotLabelManila(isoDate: string, time: string | null): string {
  const day = dateLabel(isoDate);
  return time ? `${day}, ${time} (Manila)` : `${day} (time not set)`;
}

/** "Fri, 6 Nov 2026 09:00" in the visitor's own zone. */
export function slotLabelVisitor(isoDate: string, time: string | null, timeZone: string): string {
  if (!time) return dateLabel(isoDate);
  try {
    return labelForSlot(isoDate, time, timeZone);
  } catch {
    /* An unknown zone string throws inside Intl; the Manila label above still
       answers the question, so a bad row never takes the page down. */
    return slotLabelManila(isoDate, time);
  }
}

export function formatInManila(instant: string | null): string {
  if (!instant) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MEETING_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(instant));
}

/**
 * "3 hours ago". Deliberately coarse: the console answers "where is this lead in
 * its week", and a stopwatch reading would be noise.
 */
export function relativeTime(instant: string, now: number = Date.now()): string {
  const then = new Date(instant).getTime();
  if (!Number.isFinite(then)) return "—";

  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatInManila(instant);
}
