"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  BUDGET_RANGES,
  EXPECTED_USERS,
  MEETING_PLATFORMS,
  PROJECT_TYPES,
  TIMELINE_PREFS,
  quotePage,
} from "@/content/quote";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/form";
import { DEFAULT_COUNTRY, countries } from "@/lib/site/countries";
import {
  clockLabelForSlot,
  dateLabel,
  labelForSlot,
  meetingPlatformLabel,
  selectableDates,
  slotOptions,
} from "@/lib/site/meetings";
import { cn } from "@/lib/utils";
import { fieldErrors, quoteSchema } from "@/lib/validation/forms";

/**
 * The three-step wizard (§10.3). Every answer lives in one object, so a step is
 * checked against the full schema and only that step's errors are shown; the route
 * handler checks the whole thing again. Times are stored on the studio's clock and
 * shown on the visitor's, and the zone that produced the label travels with the
 * request.
 */
type Values = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  role: string;
  country: string;
  projectType: string;
  description: string;
  expectedUsers: string;
  timeline: string;
  budget: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  meetingPlatform: string;
  consent: boolean;
  website: string;
};

const STEP_FIELDS = [
  ["fullName", "businessName", "email", "phone", "role", "country"],
  ["projectType", "description", "expectedUsers", "timeline", "budget"],
  ["preferredDate", "preferredTime", "timezone", "meetingPlatform", "consent"],
] as const;

/** The browser's zone, or the studio's while the server renders. */
function detectedTimezone(): string {
  if (typeof window === "undefined") return quotePage.defaultTimezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || quotePage.defaultTimezone;
}

export function QuoteWizard({
  initialProjectType,
  contactEmail,
}: {
  initialProjectType?: string;
  contactEmail: string;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(() => ({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    role: "",
    country: DEFAULT_COUNTRY,
    projectType: projectTypeFromTopic(initialProjectType),
    description: "",
    expectedUsers: EXPECTED_USERS[0],
    timeline: TIMELINE_PREFS[0],
    budget: BUDGET_RANGES[0],
    preferredDate: selectableDates()[0] ?? "",
    preferredTime: "",
    timezone: detectedTimezone(),
    meetingPlatform: MEETING_PLATFORMS[0].value,
    consent: false,
    website: "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [failure, setFailure] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  /* Days and zones depend on the clock and on the visitor's machine. They are
     derived during render rather than set from an effect, and they are only ever
     painted on the third step, so the first render is the same markup on both
     sides and nothing can mismatch during hydration. */
  const dates = useMemo(() => selectableDates(), []);
  const timezones = useMemo(() => {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    const zones = supported ? supported("timeZone") : [];
    return zones.length > 0 ? zones : [quotePage.defaultTimezone];
  }, []);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  const set =
    <K extends keyof Values>(key: K) =>
    (value: Values[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setErrors((current) => (current[key] ? { ...current, [key]: "" } : current));
    };

  const countryOptions = countries();
  const times = slotOptions();

  function validateStep(index: number): boolean {
    const parsed = quoteSchema.safeParse(values);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const all = fieldErrors(parsed.error);
    const scoped: Record<string, string> = {};
    for (const key of STEP_FIELDS[index] ?? []) {
      if (all[key]) scoped[key] = all[key];
    }
    setErrors(scoped);
    return Object.keys(scoped).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((current) => Math.min(current + 1, 2));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(2)) return;

    setStatus("sending");
    setFailure("");
    /* The campaign parameters are read here rather than at mount: the URL the
       visitor actually submitted from is the one worth recording. */
    const params = new URLSearchParams(window.location.search);
    const payload = {
      ...values,
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      utmTerm: params.get("utm_term") ?? "",
      utmContent: params.get("utm_content") ?? "",
    };
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: { ok?: boolean; message?: string; fields?: Record<string, string> } = await response
        .json()
        .catch(() => ({}));
      if (!response.ok || !result.ok) {
        setErrors(result.fields ?? {});
        setFailure(result.message ?? `We could not send that. Please email ${contactEmail}.`);
        setStatus("failed");
        return;
      }
      setStatus("done");
    } catch {
      setFailure(`We could not reach the server. Please email ${contactEmail}.`);
      setStatus("failed");
    }
  }

  const slotLabel = values.preferredDate
    ? labelForSlot(values.preferredDate, values.preferredTime || "09:00", values.timezone)
    : "";

  if (status === "done") {
    return (
      <div role="status" className="rounded-card border border-gray-200 bg-white p-6 shadow-card md:p-8">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
          <CheckCircle2 className="size-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-navy-950">{quotePage.successHeading}</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-600">
          Thank you. We have your request and will reply within 1 business day. A confirmation is on its way to your
          inbox.
        </p>
        {slotLabel ? (
          <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-[0.9375rem] text-navy-950">
            <span className="font-semibold">You asked to meet: </span>
            {slotLabel} ({values.timezone})
          </p>
        ) : null}
        <p className="mt-4 text-[0.8125rem] text-gray-600">
          We will confirm the meeting time by email, or offer the nearest slot that works.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-gray-200 bg-white shadow-card">
      <ol className="flex gap-1 border-b border-gray-200 p-4 sm:p-5">
        {quotePage.steps.map((label, index) => {
          const state = index === step ? "current" : index < step ? "done" : "todo";
          return (
            <li key={label} className="flex-1">
              <div
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-[0.8125rem] font-semibold",
                  state === "current" ? "bg-brand-50 text-brand-700" : "text-gray-600",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold",
                    state === "current"
                      ? "bg-brand-600 text-white"
                      : state === "done"
                        ? "bg-accent-500 text-white"
                        : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200",
                  )}
                >
                  {state === "done" ? "✓" : index + 1}
                </span>
                <span className="sr-only sm:not-sr-only">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="p-5 sm:p-7">
        <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-navy-950 outline-none sm:text-xl">
          {quotePage.steps[step]}
        </h2>
        {step === 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field id="fullName" label="Your name" error={errors.fullName}>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={values.fullName}
                onChange={(event) => set("fullName")(event.target.value)}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={describedBy("fullName", undefined, errors.fullName)}
              />
            </Field>
            <Field id="businessName" label="Business name" error={errors.businessName}>
              <Input
                id="businessName"
                name="businessName"
                autoComplete="organization"
                value={values.businessName}
                onChange={(event) => set("businessName")(event.target.value)}
                aria-invalid={Boolean(errors.businessName)}
                aria-describedby={describedBy("businessName", undefined, errors.businessName)}
              />
            </Field>
            <Field id="email" label="Work email" error={errors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => set("email")(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy("email", undefined, errors.email)}
              />
            </Field>
            <Field id="phone" label="Phone or mobile" hint="Optional, but it is the fastest way to reach you." error={errors.phone} optional>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => set("phone")(event.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy("phone", "hint", errors.phone)}
              />
            </Field>
            <Field id="role" label="Your role" hint="For example: owner, operations manager, IT lead." error={errors.role} optional>
              <Input
                id="role"
                name="role"
                autoComplete="organization-title"
                value={values.role}
                onChange={(event) => set("role")(event.target.value)}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={describedBy("role", "hint", errors.role)}
              />
            </Field>
            <Field id="country" label="Country" error={errors.country}>
              <Select
                id="country"
                name="country"
                autoComplete="country"
                value={values.country}
                onChange={(event) => set("country")(event.target.value)}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={describedBy("country", undefined, errors.country)}
              >
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="mt-5 space-y-6">
            <fieldset>
              <legend className="text-sm font-medium text-gray-900">What do you need?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {PROJECT_TYPES.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-[0.9375rem] transition-colors",
                      values.projectType === option
                        ? "border-brand-600 bg-brand-50 text-navy-950 ring-1 ring-inset ring-brand-600"
                        : "border-gray-200 text-gray-900 hover:border-gray-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="projectType"
                      value={option}
                      checked={values.projectType === option}
                      onChange={() => set("projectType")(option)}
                      className="size-4 shrink-0 accent-brand-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.projectType ? (
                <p id="projectType-error" className="mt-1.5 text-[0.8125rem] font-medium text-danger-600">
                  {errors.projectType}
                </p>
              ) : null}
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="expectedUsers" label="How many people will use it?" error={errors.expectedUsers}>
                <Select
                  id="expectedUsers"
                  name="expectedUsers"
                  value={values.expectedUsers}
                  onChange={(event) => set("expectedUsers")(event.target.value)}
                  aria-invalid={Boolean(errors.expectedUsers)}
                  aria-describedby={describedBy("expectedUsers", undefined, errors.expectedUsers)}
                >
                  {EXPECTED_USERS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="timeline" label="When would you like to start?" error={errors.timeline}>
                <Select
                  id="timeline"
                  name="timeline"
                  value={values.timeline}
                  onChange={(event) => set("timeline")(event.target.value)}
                  aria-invalid={Boolean(errors.timeline)}
                  aria-describedby={describedBy("timeline", undefined, errors.timeline)}
                >
                  {TIMELINE_PREFS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                id="budget"
                label="Budget range"
                hint={quotePage.budgetHint}
                error={errors.budget}
                className="sm:col-span-2"
              >
                <Select
                  id="budget"
                  name="budget"
                  value={values.budget}
                  onChange={(event) => set("budget")(event.target.value)}
                  aria-invalid={Boolean(errors.budget)}
                  aria-describedby={describedBy("budget", "hint", errors.budget)}
                >
                  {BUDGET_RANGES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              id="description"
              label="What are you trying to fix?"
              hint={quotePage.descriptionHint}
              error={errors.description}
            >
              <Textarea
                id="description"
                name="description"
                rows={5}
                value={values.description}
                onChange={(event) => set("description")(event.target.value)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={describedBy("description", "hint", errors.description)}
              />
            </Field>

            <div aria-hidden="true" className="hidden">
              <label htmlFor="company-website">Company website</label>
              <input
                id="company-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(event) => set("website")(event.target.value)}
              />
            </div>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="mt-5 space-y-6">
            <Field
              id="preferredDate"
              label="Preferred day"
              hint={quotePage.meetingHoursNote}
              error={errors.preferredDate}
            >
              <Select
                id="preferredDate"
                name="preferredDate"
                value={values.preferredDate}
                onChange={(event) => set("preferredDate")(event.target.value)}
                aria-invalid={Boolean(errors.preferredDate)}
                aria-describedby={describedBy("preferredDate", "hint", errors.preferredDate)}
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {dateLabel(date)}
                  </option>
                ))}
              </Select>
            </Field>

            <fieldset>
              <legend className="text-sm font-medium text-gray-900">Preferred time</legend>
              <p className="mt-1 text-[0.8125rem] text-gray-600">{quotePage.timezoneNote}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Preferred time">
                {times.map((time) => {
                  const label = values.preferredDate
                    ? clockLabelForSlot(values.preferredDate, time, values.timezone)
                    : time;
                  const checked = values.preferredTime === time;
                  return (
                    <label
                      key={time}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border px-2 text-sm font-semibold tabular-nums transition-colors",
                        checked
                          ? "border-brand-600 bg-brand-50 text-navy-950 ring-1 ring-inset ring-brand-600"
                          : "border-gray-200 text-gray-900 hover:border-gray-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="preferredTime"
                        value={time}
                        checked={checked}
                        onChange={() => set("preferredTime")(time)}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
              {errors.preferredTime ? (
                <p id="preferredTime-error" className="mt-1.5 text-[0.8125rem] font-medium text-danger-600">
                  {errors.preferredTime}
                </p>
              ) : null}
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="timezone" label="Your timezone" hint={quotePage.timezoneNote} error={errors.timezone}>
                <Select
                  id="timezone"
                  name="timezone"
                  value={values.timezone}
                  onChange={(event) => set("timezone")(event.target.value)}
                  aria-invalid={Boolean(errors.timezone)}
                  aria-describedby={describedBy("timezone", "hint", errors.timezone)}
                >
                  {timezones.includes(values.timezone) ? null : (
                    <option value={values.timezone}>{values.timezone}</option>
                  )}
                  {timezones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </Field>

              <fieldset>
                <legend className="text-sm font-medium text-gray-900">Where should we meet?</legend>
                <div className="mt-2 space-y-2">
                  {MEETING_PLATFORMS.map((platform) => (
                    <label
                      key={platform.value}
                      className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-gray-900"
                    >
                      <input
                        type="radio"
                        name="meetingPlatform"
                        value={platform.value}
                        checked={values.meetingPlatform === platform.value}
                        onChange={() => set("meetingPlatform")(platform.value)}
                        className="size-4 accent-brand-600"
                      />
                      {platform.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div>
              <label htmlFor="consent" className="flex cursor-pointer items-start gap-2.5 text-[0.9375rem] text-gray-900">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={values.consent}
                  onChange={(event) => set("consent")(event.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={describedBy("consent", undefined, errors.consent)}
                  className="mt-0.5 size-4 shrink-0 accent-brand-600"
                />
                {quotePage.consentLabel}
              </label>
              {errors.consent ? (
                <p id="consent-error" className="mt-1.5 text-[0.8125rem] font-medium text-danger-600">
                  {errors.consent}
                </p>
              ) : null}
            </div>

            {slotLabel ? (
              <p className="rounded-[10px] bg-brand-50 px-4 py-3 text-[0.875rem] text-navy-950">
                <span className="font-semibold">You asked for </span>
                {slotLabel}
                {values.timezone ? ` (${values.timezone})` : ""} on {meetingPlatformLabel(values.meetingPlatform)}.
                We will confirm by email.
              </p>
            ) : null}

          </div>
        ) : null}



      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-gray-600 hover:text-navy-950"
          >
            <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
            Back
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}

        {step < 2 ? (
          <Button type="button" size="lg" onClick={next} className="w-full sm:w-auto">
            Continue
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" size="lg" loading={status === "sending"} className="w-full sm:w-auto">
            {quotePage.submitLabel}
          </Button>
        )}
      </div>

      {status === "failed" && failure ? (
        <p role="alert" className="px-5 pb-5 text-[0.875rem] font-medium text-danger-600 sm:px-6">
          {failure}
        </p>
      ) : null}
    </form>
  );
}


function projectTypeFromTopic(topic: string | undefined): string {
  if (!topic) return "Not sure yet";
  const value = topic.toLowerCase();
  if (value.includes("inventory") || value.includes("pos")) return "Inventory / POS";
  if (value.includes("booking") || value.includes("order")) return "Booking / order management";
  if (value.includes("report") || value.includes("dashboard")) return "Reporting & dashboards";
  if (value.includes("website") || value.includes("platform")) return "Business website";
  if (value.includes("app") || value.includes("pwa") || value.includes("mobile")) return "Mobile-ready app (PWA)";
  if (value.includes("system")) return "Custom business system";
  return "Not sure yet";
}
