import { describe, expect, it } from "vitest";
import { vercelAnalyticsEnabled } from "@/lib/site/analytics";

describe("vercelAnalyticsEnabled", () => {
  it("is on when nothing is set, because both packages are inert off Vercel", () => {
    expect(vercelAnalyticsEnabled(undefined)).toBe(true);
    expect(vercelAnalyticsEnabled("")).toBe(true);
  });

  it("is on when it is explicitly asked for", () => {
    expect(vercelAnalyticsEnabled("on")).toBe(true);
    expect(vercelAnalyticsEnabled("true")).toBe(true);
    expect(vercelAnalyticsEnabled("1")).toBe(true);
  });

  it("is off for each way somebody writes off", () => {
    for (const value of ["off", "OFF", " false ", "0", "No"]) {
      expect(vercelAnalyticsEnabled(value), value).toBe(false);
    }
  });

  it("stays on for a value nobody meant, rather than silently turning telemetry off", () => {
    expect(vercelAnalyticsEnabled("yes")).toBe(true);
    expect(vercelAnalyticsEnabled("ofl")).toBe(true);
  });
});
