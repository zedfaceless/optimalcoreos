import { describe, expect, it } from "vitest";
import {
  addDays,
  clockLabelForSlot,
  dateLabel,
  firstSelectableDate,
  isBusinessDay,
  isSelectableDate,
  labelForSlot,
  lastSelectableDate,
  meetingPlatformLabel,
  selectableDates,
  slotOptions,
  weekdayInZone,
  zonedWallTimeToUtc,
} from "@/lib/site/meetings";

/** 29 October 2026, 11:00 in Manila. Every "now" below is anchored here. */
const NOW = new Date("2026-10-29T03:00:00Z");

describe("slotOptions", () => {
  const slots = slotOptions();

  it("runs 09:00 to 16:30 in half hours, Manila time", () => {
    expect(slots).toHaveLength(16);
    expect(slots[0]).toBe("09:00");
    expect(slots.at(-1)).toBe("16:30");
  });

  it("never offers 17:00, because the day ends there", () => {
    expect(slots).not.toContain("17:00");
    expect(slots).not.toContain("08:30");
  });

  it("is all zero-padded HH:MM", () => {
    for (const slot of slots) expect(slot).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("isBusinessDay", () => {
  it("accepts Monday to Friday", () => {
    expect(isBusinessDay("2026-11-09")).toBe(true); // Monday
    expect(isBusinessDay("2026-11-13")).toBe(true); // Friday
  });

  it("refuses the weekend", () => {
    expect(isBusinessDay("2026-11-14")).toBe(false); // Saturday
    expect(isBusinessDay("2026-11-15")).toBe(false); // Sunday
  });

  it("refuses anything that is not a date", () => {
    expect(isBusinessDay("")).toBe(false);
    expect(isBusinessDay("tomorrow")).toBe(false);
    expect(isBusinessDay("2026-11")).toBe(false);
  });
});

describe("addDays and the zone helpers", () => {
  it("crosses a month and a year boundary", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29"); // leap year
  });

  it("reads the date in the zone, not on the machine", () => {
    // 2026-10-28 17:00 UTC is already the 29th in Manila.
    const instant = new Date("2026-10-28T17:00:00Z");
    expect(weekdayInZone(instant)).toBe(4); // Thursday in Manila
  });
});

describe("firstSelectableDate", () => {
  it("starts tomorrow", () => {
    expect(firstSelectableDate(NOW)).toBe("2026-10-30");
  });

  it("skips to Monday when tomorrow is a Saturday", () => {
    // Friday 30 October, 18:00 in Manila.
    expect(firstSelectableDate(new Date("2026-10-30T10:00:00Z"))).toBe("2026-11-02");
  });
});

describe("isSelectableDate", () => {
  it("accepts a weekday inside the horizon", () => {
    expect(isSelectableDate("2026-11-09", NOW)).toBe(true);
    expect(isSelectableDate(lastSelectableDate(NOW), NOW)).toBe(false); // Sunday 13 Dec
    expect(isSelectableDate("2026-12-11", NOW)).toBe(true); // the last Friday offered
  });

  it("refuses today, the past, weekends and the day after the horizon", () => {
    expect(isSelectableDate("2026-10-29", NOW)).toBe(false);
    expect(isSelectableDate("2026-01-05", NOW)).toBe(false);
    expect(isSelectableDate("2026-11-07", NOW)).toBe(false); // Saturday
    expect(isSelectableDate("2026-12-14", NOW)).toBe(false);
  });
});

describe("selectableDates", () => {
  const dates = selectableDates(NOW);

  it("offers the weekdays between tomorrow and the 45-day horizon", () => {
    expect(dates).toHaveLength(31);
    expect(dates[0]).toBe("2026-10-30");
    expect(dates.at(-1)).toBe("2026-12-11");
  });

  it("offers no weekend", () => {
    for (const date of dates) expect(isBusinessDay(date)).toBe(true);
  });
});

describe("zonedWallTimeToUtc", () => {
  it("names the instant a Manila wall clock means", () => {
    expect(zonedWallTimeToUtc("2026-11-09", "09:00").toISOString()).toBe("2026-11-09T01:00:00.000Z");
  });

  it("survives the second pass across a daylight-saving change", () => {
    // 09:00 in New York on the day the clocks go forward is EDT, not EST.
    expect(zonedWallTimeToUtc("2026-03-08", "09:00", "America/New_York").toISOString()).toBe(
      "2026-03-08T13:00:00.000Z",
    );
  });
});

describe("the visitor's clock", () => {
  it("reads the same slot differently in each zone", () => {
    expect(clockLabelForSlot("2026-11-09", "09:00", "Asia/Manila")).toBe("09:00");
    expect(clockLabelForSlot("2026-11-09", "09:00", "Europe/London")).toBe("01:00");
    expect(clockLabelForSlot("2026-11-09", "09:00", "America/New_York")).toBe("20:00");
    expect(clockLabelForSlot("2026-11-09", "09:00", "Australia/Sydney")).toBe("12:00");
  });

  it("puts the date on the confirmation, in the visitor's zone", () => {
    expect(labelForSlot("2026-11-09", "09:00", "Europe/London")).toBe("Mon, 9 Nov 2026, 01:00");
    expect(labelForSlot("2026-11-09", "09:00", "Asia/Manila")).toBe("Mon, 9 Nov 2026, 09:00");
  });

  it("labels a bare date without a zone shifting the day", () => {
    expect(dateLabel("2026-11-09")).toBe("Mon, 9 Nov 2026");
  });
});

describe("meetingPlatformLabel", () => {
  it("names the three platforms and falls back to the visitor's choice", () => {
    expect(meetingPlatformLabel("google_meet")).toBe("Google Meet");
    expect(meetingPlatformLabel("zoom")).toBe("Zoom");
    expect(meetingPlatformLabel("teams")).toBe("Microsoft Teams");
    expect(meetingPlatformLabel("any")).toBe("Any / you choose");
    expect(meetingPlatformLabel("carrier-pigeon")).toBe("Any / you choose");
  });
});
