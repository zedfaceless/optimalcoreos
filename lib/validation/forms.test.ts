import { describe, expect, it } from "vitest";
import { BUDGET_RANGES, EXPECTED_USERS, PROJECT_TYPES, TIMELINE_PREFS } from "@/content/quote";
import { contactSchema, fieldErrors, quoteSchema, type QuoteInput } from "@/lib/validation/forms";

/** A submission the wizard could actually produce, so each case below changes one thing. */
function validQuote(overrides: Partial<Record<keyof QuoteInput, unknown>> = {}) {
  return {
    fullName: "Ana Cruz",
    businessName: "Cruz Trading",
    email: "ana@example.com",
    phone: "0917 555 0100",
    role: "Owner",
    country: "PH",
    projectType: PROJECT_TYPES[1],
    description: "We sell wholesale rice and every order still arrives by text message.",
    expectedUsers: EXPECTED_USERS[0],
    timeline: TIMELINE_PREFS[1],
    budget: BUDGET_RANGES[1],
    preferredDate: "2026-11-09",
    preferredTime: "09:00",
    timezone: "Asia/Manila",
    meetingPlatform: "zoom",
    consent: true,
    utmSource: "facebook",
    utmMedium: "social",
    utmCampaign: "q4",
    utmTerm: "",
    utmContent: "",
    ...overrides,
  };
}

describe("quoteSchema", () => {
  it("accepts a complete submission and normalises it", () => {
    const parsed = quoteSchema.safeParse(validQuote());
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.country).toBe("PH");
    expect(parsed.data.utmSource).toBe("facebook");
  });

  it("uppercases a country typed in lower case", () => {
    const parsed = quoteSchema.safeParse(validQuote({ country: "ph" }));
    expect(parsed.success && parsed.data.country).toBe("PH");
  });

  it("turns blank optional fields into undefined rather than empty strings", () => {
    const parsed = quoteSchema.safeParse(validQuote({ phone: "  ", role: "" }));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.phone).toBeUndefined();
    expect(parsed.data.role).toBeUndefined();
  });

  it("trims the free text", () => {
    const parsed = quoteSchema.safeParse(validQuote({ fullName: "  Ana Cruz  " }));
    expect(parsed.success && parsed.data.fullName).toBe("Ana Cruz");
  });

  it("refuses a country that is not on the list", () => {
    const parsed = quoteSchema.safeParse(validQuote({ country: "ZZ" }));
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).country).toBe("Please choose a country from the list.");
  });

  it("refuses an address with no domain", () => {
    for (const email of ["ana", "ana@", "ana@example", "ana cruz@example.com"]) {
      expect(quoteSchema.safeParse(validQuote({ email })).success, email).toBe(false);
    }
  });

  it("refuses a description too short to be useful", () => {
    const parsed = quoteSchema.safeParse(validQuote({ description: "Need a system." }));
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).description).toMatch(/couple of sentences/i);
  });

  it("refuses a project type off the list", () => {
    const parsed = quoteSchema.safeParse(validQuote({ projectType: "Blockchain" }));
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).projectType).toBe("Please choose the closest match.");
  });

  it("refuses a team size, timeline or budget off the list", () => {
    const parsed = quoteSchema.safeParse(
      validQuote({ expectedUsers: "A few", timeline: "Yesterday", budget: "Cheap" }),
    );
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = fieldErrors(parsed.error);
    for (const key of ["expectedUsers", "timeline", "budget"]) {
      expect(errors[key], key).toBe("Please choose an option from the list.");
    }
  });


  it("refuses a time that is not one of the slots", () => {
    for (const preferredTime of ["08:00", "17:00", "09:15", "nine"]) {
      expect(quoteSchema.safeParse(validQuote({ preferredTime })).success, preferredTime).toBe(false);
    }
  });

  it("refuses a date in the wrong shape", () => {
    const parsed = quoteSchema.safeParse(validQuote({ preferredDate: "9 November" }));
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).preferredDate).toBe("Please choose a date for the call.");
  });

  it("refuses a timezone the runtime does not know", () => {
    const parsed = quoteSchema.safeParse(validQuote({ timezone: "Mars/Olympus" }));
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).timezone).toBe("Please choose a timezone from the list.");
  });

  it("refuses a platform that is not offered", () => {
    expect(quoteSchema.safeParse(validQuote({ meetingPlatform: "fax" })).success).toBe(false);
  });

  it("requires consent to be exactly true", () => {
    const parsed = quoteSchema.safeParse(validQuote({ consent: false }));
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).consent).toBe("We need your agreement before we can contact you.");
  });

  it("caps a campaign parameter at 200 characters", () => {
    expect(quoteSchema.safeParse(validQuote({ utmCampaign: "x".repeat(201) })).success).toBe(false);
  });

  it("caps a name that is longer than the column", () => {
    expect(quoteSchema.safeParse(validQuote({ fullName: "a".repeat(121) })).success).toBe(false);
  });
});

describe("contactSchema", () => {
  const valid = {
    name: "Ana Cruz",
    email: "ana@example.com",
    message: "Do you build inventory systems for rice traders?",
  };

  it("accepts a short, complete message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses a message that is only a hello", () => {
    const parsed = contactSchema.safeParse({ ...valid, message: "hi there" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error).message).toMatch(/sentence or two/i);
  });

  it("refuses a one-letter name and a bad address", () => {
    const parsed = contactSchema.safeParse({ ...valid, name: "A", email: "nope" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = fieldErrors(parsed.error);
    expect(errors.name).toBe("Please tell us your name.");
    expect(errors.email).toBe("That email address does not look right.");
  });

  it("caps the message at 4000 characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(4001) }).success).toBe(false);
  });
});

describe("fieldErrors", () => {
  it("keeps one message per field", () => {
    const parsed = quoteSchema.safeParse({ ...validQuote(), fullName: "", email: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = fieldErrors(parsed.error);
    expect(Object.keys(errors).sort()).toEqual(["email", "fullName"]);
    expect(errors.fullName).toBe("Please tell us your name.");
  });

  it("reaches every field the wizard paints an error under", () => {
    const parsed = quoteSchema.safeParse({});
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = fieldErrors(parsed.error);
    for (const key of ["fullName", "businessName", "email", "country", "projectType", "description"]) {
      expect(errors[key], key).toBeTruthy();
    }
  });
});
