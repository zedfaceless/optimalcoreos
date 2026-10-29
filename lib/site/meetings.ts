/**
 * Meeting-time arithmetic.
 *
 * The rule (§10.3) is: the owner works 09:00–17:00 Asia/Manila, Monday to Friday;
 * the visitor is shown those same instants in their own timezone; the database
 * stores UTC. Everything here is pure, so the weekend rule, the 45-day horizon and
 * the timezone conversion are unit-tested instead of trusted.
 */

export const MEETING_TIMEZONE = "Asia/Manila";
export const SLOT_START_HOUR = 9;
export const SLOT_END_HOUR = 17;
export const SLOT_MINUTES = 30;
export const MAX_DAYS_AHEAD = 45;

/** `YYYY-MM-DD` for a Date in the given zone (not the machine's zone). */
export function isoDateInZone(date: Date, timeZone = MEETING_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

/** 0 = Sunday … 6 = Saturday, as seen in the zone. */
export function weekdayInZone(date: Date, timeZone = MEETING_TIMEZONE): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export function isBusinessDay(isoDate: string): boolean {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return false;
  // Noon UTC keeps the date away from either edge of the day.
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
  return weekday >= 1 && weekday <= 5;
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days, 12));
  return next.toISOString().slice(0, 10);
}

/** The earliest date a visitor may pick: the next weekday after today in Manila. */
export function firstSelectableDate(now: Date = new Date()): string {
  let candidate = addDays(isoDateInZone(now), 1);
  while (!isBusinessDay(candidate)) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

export function lastSelectableDate(now: Date = new Date()): string {
  return addDays(isoDateInZone(now), MAX_DAYS_AHEAD);
}

export function isSelectableDate(isoDate: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  if (!isBusinessDay(isoDate)) return false;
  return isoDate >= firstSelectableDate(now) && isoDate <= lastSelectableDate(now);
}

/** 30-minute slots, 09:00 through 16:30, as `HH:MM` in Manila. */
export function slotOptions(): string[] {
  const slots: string[] = [];
  for (let minutes = SLOT_START_HOUR * 60; minutes < SLOT_END_HOUR * 60; minutes += SLOT_MINUTES) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
  return slots;
}

/** How far the zone is ahead of UTC at a given instant, in milliseconds. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(pick("year"), pick("month") - 1, pick("day"), pick("hour"), pick("minute"), pick("second"));
  return asUtc - instant.getTime();
}

/**
 * A wall-clock date and time in a zone, as the UTC instant it names. Two passes,
 * because the first guess can land on the other side of a daylight-saving change.
 */
export function zonedWallTimeToUtc(
  isoDate: string,
  time: string,
  timeZone: string = MEETING_TIMEZONE,
): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const guess = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0);
  const firstPass = guess - zoneOffsetMs(new Date(guess), timeZone);
  const secondPass = guess - zoneOffsetMs(new Date(firstPass), timeZone);
  return new Date(secondPass);
}

export function formatInZone(instant: Date | string, timeZone: string): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** "Fri, 6 Nov 2026 09:00" in the visitor's zone. */
export function labelForSlot(isoDate: string, time: string, timeZone: string): string {
  return formatInZone(zonedWallTimeToUtc(isoDate, time, MEETING_TIMEZONE), timeZone);
}

/** "09:00" — the wall clock in a zone, with no date attached. */
export function clockInZone(instant: Date | string, timeZone: string): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * The same 09:00 slot read on the visitor's clock: "09:00" for somebody in Manila,
 * "01:00" for somebody in London. The chips in the wizard show this, never the
 * studio's clock, so nobody books a time they cannot attend.
 */
export function clockLabelForSlot(isoDate: string, time: string, timeZone: string): string {
  return clockInZone(zonedWallTimeToUtc(isoDate, time, MEETING_TIMEZONE), timeZone);
}

/** "Mon, 9 Nov 2026" for a `YYYY-MM-DD`, read at noon UTC so no zone moves the day. */
export function dateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const noon = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(noon);
}

/** Every selectable weekday between tomorrow and the 45-day horizon. */
export function selectableDates(now: Date = new Date()): string[] {
  const dates: string[] = [];
  const last = lastSelectableDate(now);
  let candidate = firstSelectableDate(now);
  while (candidate <= last) {
    if (isBusinessDay(candidate)) dates.push(candidate);
    candidate = addDays(candidate, 1);
  }
  return dates;
}

export function meetingPlatformLabel(platform: string): string {
  switch (platform) {
    case "google_meet":
      return "Google Meet";
    case "zoom":
      return "Zoom";
    case "teams":
      return "Microsoft Teams";
    default:
      return "Any / you choose";
  }
}
