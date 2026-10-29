import { describe, expect, it } from "vitest";
import {
  countLinks,
  elapsedMs,
  isDisposableEmail,
  isTooFast,
  MAX_LINKS,
  MIN_FILL_MS,
  spamReason,
} from "@/lib/validation/spam";

const NOON = new Date("2026-10-29T04:00:00Z").getTime();

describe("elapsedMs", () => {
  it("reads a number and a numeric string the same way", () => {
    expect(elapsedMs(NOON - 5000, NOON)).toBe(5000);
    expect(elapsedMs(String(NOON - 5000), NOON)).toBe(5000);
  });

  it("answers null for anything it cannot read, which drops nothing", () => {
    for (const value of [undefined, null, "", "  ", "soon", true, [], {}, "1e", "abc"]) {
      expect(elapsedMs(value, NOON), JSON.stringify(value) ?? String(value)).toBeNull();
    }
  });

  it("answers null for a clock that is ahead of ours", () => {
    expect(elapsedMs(NOON + 60_000, NOON)).toBeNull();
  });

  it("answers null for a form that claims to have been open for a day", () => {
    expect(elapsedMs(NOON - 24 * 60 * 60_000, NOON)).toBeNull();
  });
});

describe("isTooFast", () => {
  it("trips below the floor", () => {
    expect(isTooFast(NOON - 1, NOON)).toBe(true);
    expect(isTooFast(NOON - (MIN_FILL_MS - 1), NOON)).toBe(true);
  });

  it("stays quiet exactly at the floor and beyond", () => {
    expect(isTooFast(NOON - MIN_FILL_MS, NOON)).toBe(false);
    expect(isTooFast(NOON - 10 * 60_000, NOON)).toBe(false);
  });

  it("stays quiet when the browser sent no timestamp at all", () => {
    expect(isTooFast(undefined, NOON)).toBe(false);
    expect(isTooFast("", NOON)).toBe(false);
  });
});

describe("isDisposableEmail", () => {
  it("catches the providers a script reaches for", () => {
    expect(isDisposableEmail("someone@mailinator.com")).toBe(true);
    expect(isDisposableEmail("someone@yopmail.com")).toBe(true);
    expect(isDisposableEmail("someone@temp-mail.org")).toBe(true);
  });

  it("ignores case and a trailing dot", () => {
    expect(isDisposableEmail("Someone@Mailinator.COM")).toBe(true);
    expect(isDisposableEmail("someone@mailinator.com.")).toBe(true);
  });

  it("catches a subdomain of one", () => {
    expect(isDisposableEmail("someone@inbox.mailinator.com")).toBe(true);
  });

  it("leaves a real business alone, including one with mail in its name", () => {
    expect(isDisposableEmail("owner@gmail.com")).toBe(false);
    expect(isDisposableEmail("owner@notmailinator.com")).toBe(false);
    expect(isDisposableEmail("owner@mailchimp.com")).toBe(false);
    expect(isDisposableEmail("owner@smb.com.ph")).toBe(false);
  });

  it("says no for something that is not an address", () => {
    expect(isDisposableEmail("")).toBe(false);
    expect(isDisposableEmail("@mailinator.com")).toBe(false);
    expect(isDisposableEmail("mailinator.com")).toBe(false);
    expect(isDisposableEmail("someone@")).toBe(false);
  });
});

describe("countLinks", () => {
  it("counts http, https and www links", () => {
    expect(countLinks("look at https://a.example and http://b.example and www.c.example")).toBe(3);
  });

  it("does not count a bare domain or an email address", () => {
    expect(countLinks("we sell on shopee.ph and email owner@a.example")).toBe(0);
  });

  it("is case-insensitive about the scheme", () => {
    expect(countLinks("HTTPS://A.EXAMPLE")).toBe(1);
  });
});

describe("spamReason", () => {
  const now = NOON;
  const slow = { formStartedAt: now - 60_000, now };

  it("returns null for an ordinary submission", () => {
    expect(
      spamReason({ ...slow, email: "owner@smb.com.ph", text: "Our stock count is in a notebook." }),
    ).toBeNull();
  });

  it("names the earliest signal that fired", () => {
    expect(
      spamReason({
        formStartedAt: now - 10,
        now,
        email: "someone@mailinator.com",
        text: "https://a.example https://b.example https://c.example https://d.example",
      }),
    ).toBe("too-fast");
  });

  it("catches a slow-but-throwaway submission", () => {
    expect(
      spamReason({ ...slow, email: "someone@mailinator.com", text: "A real-sounding message." }),
    ).toBe("disposable-domain");
  });

  it("catches a link drop one link past the limit", () => {
    const links = (count: number) =>
      Array.from({ length: count }, (_, index) => `https://spam.example/${index}`).join(" ");
    expect(spamReason({ ...slow, email: "owner@smb.com.ph", text: links(MAX_LINKS) })).toBeNull();
    expect(spamReason({ ...slow, email: "owner@smb.com.ph", text: links(MAX_LINKS + 1) })).toBe(
      "too-many-links",
    );
  });

  it("drops nothing when the timestamp is missing", () => {
    expect(spamReason({ now, email: "owner@smb.com.ph", text: "A real request." })).toBeNull();
  });
});
