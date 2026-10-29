import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clientIp,
  honeypotTripped,
  json,
  jsonError,
  rateLimit,
  readJsonObject,
  resetRateLimits,
} from "@/lib/api/guard";

const NOON = new Date("2026-10-29T04:00:00Z");

beforeEach(() => {
  resetRateLimits();
  vi.useFakeTimers();
  vi.setSystemTime(NOON);
});

afterEach(() => {
  vi.useRealTimers();
  resetRateLimits();
});

describe("rateLimit", () => {
  it("allows the limit and refuses the one after it", () => {
    for (let hit = 1; hit <= 5; hit += 1) {
      expect(rateLimit("1.2.3.4", 5, 60_000), `hit ${hit}`).toBe(true);
    }
    expect(rateLimit("1.2.3.4", 5, 60_000)).toBe(false);
  });

  it("keeps one key's flood away from another key", () => {
    for (let hit = 0; hit < 4; hit += 1) rateLimit("1.2.3.4", 3, 60_000);
    expect(rateLimit("1.2.3.4", 3, 60_000)).toBe(false);
    expect(rateLimit("5.6.7.8", 3, 60_000)).toBe(true);
  });

  it("forgets the window once it has passed", () => {
    for (let hit = 0; hit < 4; hit += 1) rateLimit("1.2.3.4", 3, 60_000);
    expect(rateLimit("1.2.3.4", 3, 60_000)).toBe(false);
    vi.setSystemTime(new Date(NOON.getTime() + 60_001));
    expect(rateLimit("1.2.3.4", 3, 60_000)).toBe(true);
  });

  it("counts a double-submit inside one window as two hits", () => {
    expect(rateLimit("1.2.3.4", 1, 60_000)).toBe(true);
    expect(rateLimit("1.2.3.4", 1, 60_000)).toBe(false);
  });
});

describe("clientIp", () => {
  const request = (headers: Record<string, string>) => new Request("https://example.test/api", { headers });

  it("takes the first address in x-forwarded-for", () => {
    expect(clientIp(request({ "x-forwarded-for": "203.0.113.9, 70.41.3.18" }))).toBe("203.0.113.9");
  });

  it("trims the address it takes", () => {
    expect(clientIp(request({ "x-forwarded-for": "  203.0.113.9  " }))).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip, then to nothing", () => {
    expect(clientIp(request({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
    expect(clientIp(request({}))).toBeNull();
  });

  it("prefers the forwarded chain over x-real-ip", () => {
    expect(clientIp(request({ "x-forwarded-for": "203.0.113.9", "x-real-ip": "198.51.100.7" }))).toBe("203.0.113.9");
  });
});

describe("honeypotTripped", () => {
  it("trips on anything a person would have left empty", () => {
    expect(honeypotTripped({ website: "http://spam.example" })).toBe(true);
    expect(honeypotTripped({ website: "x" })).toBe(true);
  });

  it("stays quiet for an empty or absent field, and for whitespace", () => {
    expect(honeypotTripped({})).toBe(false);
    expect(honeypotTripped({ website: "" })).toBe(false);
    expect(honeypotTripped({ website: "   " })).toBe(false);
    expect(honeypotTripped({ website: 42 })).toBe(false);
  });
});

describe("json and jsonError", () => {
  it("never lets a form reply be cached", () => {
    const response = json({ ok: true });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("carries a status and a message on failure", async () => {
    const response = jsonError(503, "Email us directly.");
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, message: "Email us directly." });
  });

  it("carries per-field errors when it has them", async () => {
    const response = jsonError(422, "Please check the form.", { email: "That email does not look right." });
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "Please check the form.",
      fields: { email: "That email does not look right." },
    });
  });
});

describe("readJsonObject", () => {
  const post = (body: string) =>
    new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

  it("reads an object", async () => {
    await expect(readJsonObject(post('{"email":"a@b.co"}'))).resolves.toEqual({ email: "a@b.co" });
  });

  it("refuses an array, a bare value, null and broken JSON", async () => {
    for (const body of ["[]", '"text"', "null", "{not json", ""]) {
      await expect(readJsonObject(post(body)), body).resolves.toBeNull();
    }
  });
});
