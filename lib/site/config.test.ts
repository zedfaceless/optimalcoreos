import { describe, expect, it } from "vitest";
import { absoluteUrl, resolveSiteUrl, siteUrl } from "@/lib/site/config";

describe("resolveSiteUrl", () => {
  it("falls back to the dev server when nothing is set, rather than inventing a domain", () => {
    expect(resolveSiteUrl(undefined)).toBe("http://localhost:3000");
  });

  it("treats empty as unset, because .env.example ships it that way", () => {
    // The regression this exists for: `??` let "" through, and `new URL("")` in
    // app/layout.tsx made `next build` fail on a fresh checkout — the opposite of
    // what .env.example and docs/PLACEHOLDERS.md promise for an empty key.
    expect(resolveSiteUrl("")).toBe("http://localhost:3000");
  });

  it("treats whitespace as unset too, because a dashboard box can hold a space", () => {
    expect(resolveSiteUrl("   ")).toBe("http://localhost:3000");
    expect(resolveSiteUrl("\n\t")).toBe("http://localhost:3000");
  });

  it("keeps a real origin, trimmed", () => {
    expect(resolveSiteUrl("https://optimalcoreos.com")).toBe("https://optimalcoreos.com");
    expect(resolveSiteUrl("  https://optimalcoreos.com  ")).toBe("https://optimalcoreos.com");
  });

  it("strips every trailing slash, so a canonical link never ends in one", () => {
    expect(resolveSiteUrl("https://optimalcoreos.com/")).toBe("https://optimalcoreos.com");
    expect(resolveSiteUrl("https://optimalcoreos.com///")).toBe("https://optimalcoreos.com");
  });

  it("leaves a path alone: a preview deploy links to itself", () => {
    expect(resolveSiteUrl("https://preview.example.com/run-42")).toBe(
      "https://preview.example.com/run-42",
    );
  });
});

describe("absoluteUrl", () => {
  it("joins with exactly one slash", () => {
    const had = "NEXT_PUBLIC_SITE_URL" in process.env;
    const was = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://optimalcoreos.com/";
    try {
      expect(absoluteUrl("/sitemap.xml")).toBe("https://optimalcoreos.com/sitemap.xml");
      expect(absoluteUrl("sitemap.xml")).toBe("https://optimalcoreos.com/sitemap.xml");
      expect(siteUrl()).toBe("https://optimalcoreos.com");
    } finally {
      // `delete` rather than assigning `undefined`, which would leave the string
      // "undefined" behind for every test that runs after this one.
      if (had && was !== undefined) process.env.NEXT_PUBLIC_SITE_URL = was;
      else delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });
});
