import { z } from "zod";
import { BUDGET_RANGES, EXPECTED_USERS, MEETING_PLATFORMS, PROJECT_TYPES, TIMELINE_PREFS } from "@/content/quote";
import { countries } from "@/lib/site/countries";
import { slotOptions } from "@/lib/site/meetings";

/**
 * The one description of what a valid submission looks like (§10.4). The wizard
 * validates with these on the client for fast feedback, and the route handler
 * validates with the same objects again — the browser is never the authority on
 * what reaches the database.
 */

const isoCountryCodes = new Set(countries().map((country) => country.code));
const platformValues = new Set<string>(MEETING_PLATFORMS.map((platform) => platform.value));
const slotValues = new Set(slotOptions());

const name = z
  .string()
  .trim()
  .min(2, "Please tell us your name.")
  .max(120, "That name is longer than we can store. Please shorten it.");

const email = z
  .string()
  .trim()
  .min(1, "We need an email address to reply to.")
  .max(254, "That email address is too long.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "That email address does not look right.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "That is longer than we can store. Please shorten it.")
    .optional()
    .transform((value) => (value === "" ? undefined : value));

/** A campaign parameter, kept short and never trusted as HTML. */
const attribution = z.string().trim().max(200).optional();

export const contactSchema = z.object({
  name,
  email,
  message: z
    .string()
    .trim()
    .min(10, "Please write a sentence or two so we can reply usefully.")
    .max(4000, "That message is longer than we can store. Please shorten it."),
});

export type ContactInput = z.infer<typeof contactSchema>;

const oneOf = <T extends readonly string[]>(options: T, message: string) =>
  z.string().refine((value): value is T[number] => (options as readonly string[]).includes(value), message);

export const quoteSchema = z.object({
  fullName: name,
  businessName: z
    .string()
    .trim()
    .min(2, "Please tell us the business name.")
    .max(160, "That business name is longer than we can store."),
  email,
  phone: optionalText(40),
  /** Their role in the business: owner, manager, staff. Free text, optional. */
  role: optionalText(80),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .refine((code) => isoCountryCodes.has(code), "Please choose a country from the list."),
  projectType: oneOf(PROJECT_TYPES, "Please choose the closest match."),
  description: z
    .string()
    .trim()
    .min(20, "A couple of sentences is enough — what is slow, and what would a good result look like?")
    .max(5000, "That description is longer than we can store. Please shorten it."),
  expectedUsers: oneOf(EXPECTED_USERS, "Please choose an option from the list."),
  timeline: oneOf(TIMELINE_PREFS, "Please choose an option from the list."),
  budget: oneOf(BUDGET_RANGES, "Please choose an option from the list."),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date for the call."),
  /** `HH:MM` on the studio's clock; the zone travels beside it. */
  preferredTime: z
    .string()
    .refine((value) => slotValues.has(value), "Please choose one of the listed times."),
  timezone: z
    .string()
    .trim()
    .max(64)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en-GB", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Please choose a timezone from the list."),
  meetingPlatform: z
    .string()
    .refine((value) => platformValues.has(value), "Please choose how you would like to meet."),
  consent: z.literal(true, { error: "We need your agreement before we can contact you." }),
  utmSource: attribution,
  utmMedium: attribution,
  utmCampaign: attribution,
  utmTerm: attribution,
  utmContent: attribution,
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** Turns a failed parse into `{ field: message }` for the wizard. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
