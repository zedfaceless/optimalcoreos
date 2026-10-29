import { describe, expect, it } from "vitest";
import {
  formatInManila,
  messageStatusLabel,
  relativeTime,
  slotLabelManila,
  slotLabelVisitor,
} from "@/lib/devside/format";

const NOON_MANILA = new Date("2026-10-29T04:00:00Z").getTime();

describe("relativeTime", () => {
  it("is coarse on purpose, because the console answers a week-scale question", () => {
    expect(relativeTime(new Date(NOON_MANILA - 20_000).toISOString(), NOON_MANILA)).toBe("just now");
    expect(relativeTime(new Date(NOON_MANILA - 12 * 60_000).toISOString(), NOON_MANILA)).toBe(
      "12 min ago",
    );
    expect(relativeTime(new Date(NOON_MANILA - 5 * 60 * 60_000).toISOString(), NOON_MANILA)).toBe(
      "5 h ago",
    );
    expect(relativeTime(new Date(NOON_MANILA - 3 * 24 * 60 * 60_000).toISOString(), NOON_MANILA)).toBe(
      "3 d ago",
    );
  });

  it("switches to a date once a lead is a month old", () => {
    const label = relativeTime(new Date(NOON_MANILA - 45 * 24 * 60 * 60_000).toISOString(), NOON_MANILA);
    expect(label).toContain("2026");
    expect(label).not.toContain("ago");
  });

  it("does not print NaN for a value it cannot parse", () => {
    expect(relativeTime("not a date", NOON_MANILA)).toBe("—");
  });
});

describe("formatInManila", () => {
  it("prints the studio's clock, not the server's zone", () => {
    /* 04:00 UTC is noon in Manila. */
    expect(formatInManila("2026-10-29T04:00:00Z")).toBe("29 Oct 2026, 12:00");
  });

  it("prints a dash for a missing instant", () => {
    expect(formatInManila(null)).toBe("—");
  });
});

describe("slotLabelManila", () => {
  it("uses the wall clock the visitor was offered", () => {
    expect(slotLabelManila("2026-11-06", "09:00")).toContain("09:00");
    expect(slotLabelManila("2026-11-06", "09:00")).toContain("Manila");
  });

  it("says so when a row has no time", () => {
    expect(slotLabelManila("2026-11-06", null)).toBe("Fri, 6 Nov 2026 (time not set)");
  });
});

describe("slotLabelVisitor", () => {
  it("converts to the visitor's zone", () => {
    const label = slotLabelVisitor("2026-11-06", "09:00", "Asia/Tokyo");
    expect(label).toContain("10:00");
  });

  it("falls back to Manila when the stored zone is one Intl rejects", () => {
    expect(slotLabelVisitor("2026-11-06", "09:00", "Mars/Olympus")).toBe("Fri, 6 Nov 2026, 09:00 (Manila)");
  });

  it("falls back to the date when there is no time", () => {
    expect(slotLabelVisitor("2026-11-06", null, "Asia/Tokyo")).toBe("Fri, 6 Nov 2026");
  });
});

describe("messageStatusLabel", () => {
  it("names the four states the console uses", () => {
    expect(messageStatusLabel("new")).toBe("Unread");
    expect(messageStatusLabel("replied")).toBe("Replied");
    expect(messageStatusLabel("archived")).toBe("Archived");
    expect(messageStatusLabel("spam")).toBe("Spam");
  });

  it("passes an unknown value through rather than blanking a row", () => {
    expect(messageStatusLabel("pending")).toBe("pending");
  });
});
