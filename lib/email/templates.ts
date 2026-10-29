import type { ContactInput, QuoteInput } from "@/lib/validation/forms";
import { BRAND } from "@/content/site";
import { meetingPlatformLabel } from "@/lib/site/meetings";
import { getSiteSettings } from "@/lib/site/settings";

/**
 * Plain HTML, built from the same validated values the database received, so an
 * owner reading email and an owner reading `/devside` see one version of the
 * request. Every interpolated value is escaped: the body is somebody's textarea.
 */
export type EmailMessage = { subject: string; html: string; text: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(heading: string, rows: [string, string][], paragraphs: string[] = []): string {
  const table = rows
    .filter(([, value]) => value.trim().length > 0)
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 16px 6px 0;font:600 13px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#4b5563;vertical-align:top;white-space:nowrap">${escapeHtml(
          label,
        )}</th><td style="padding:6px 0;font:400 14px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111827;white-space:pre-wrap">${escapeHtml(
          value,
        )}</td></tr>`,
    )
    .join("");

  const body = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font:400 14px/1.65 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111827">${escapeHtml(
          paragraph,
        )}</p>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f7f9fc;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e9f0;border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;font:700 11px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#1f6feb">${escapeHtml(
      BRAND.name,
    )}</p>
    <h1 style="margin:0 0 18px;font:700 21px/1.25 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a1220">${escapeHtml(
      heading,
    )}</h1>
    ${body}
    <table role="presentation" style="border-collapse:collapse;width:100%">${table}</table>
  </div>
</body></html>`;
}

function textLayout(heading: string, rows: [string, string][]): string {
  const lines = rows
    .filter(([, value]) => value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value}`);
  return [`${BRAND.name} — ${heading}`, "", ...lines].join("\n");
}

export function ownerQuoteEmail(input: QuoteInput, slotLabel: string): EmailMessage {
  const rows: [string, string][] = [
    ["Name", input.fullName],
    ["Business", input.businessName],
    ["Email", input.email],
    ["Phone", input.phone ?? ""],
    ["Role", input.role ?? ""],
    ["Country", input.country],
    ["Project type", input.projectType],
    ["Users", input.expectedUsers],
    ["Timeline", input.timeline],
    ["Budget", input.budget],
    ["Requested slot", slotLabel],
    ["Their timezone", input.timezone],
    ["Platform", meetingPlatformLabel(input.meetingPlatform)],
    ["Campaign", [input.utmSource, input.utmMedium, input.utmCampaign].filter(Boolean).join(" / ")],
    ["What they want to solve", input.description],
  ];
  return {
    subject: `New quote request: ${input.businessName}`,
    html: layout("New quote request", rows),
    text: textLayout("New quote request", rows),
  };
}

export function visitorQuoteEmail(input: QuoteInput, slotLabel: string): EmailMessage {
  const settings = getSiteSettings();
  const paragraphs = [
    `Hello ${input.fullName},`,
    `Thank you for telling us about ${input.businessName}. We have your request and will reply within 1 business day.`,
    `You asked to meet on ${slotLabel} (${input.timezone}). We will confirm the time by email, or offer the nearest one that works.`,
    `If anything changes, reply to this message or write to ${settings.email}.`,
  ];
  const rows: [string, string][] = [["Requested slot", slotLabel]];
  return {
    subject: `We have your request — ${BRAND.name}`,
    html: layout("We have your request", rows, paragraphs),
    text: [
      ...paragraphs,
      "",
      `Requested slot: ${slotLabel}`,
      "",
      `${BRAND.name} · ${settings.hours}`,
    ].join("\n"),
  };
}

export function ownerContactEmail(input: ContactInput): EmailMessage {
  const rows: [string, string][] = [
    ["Name", input.name],
    ["Email", input.email],
    ["Message", input.message],
  ];
  return {
    subject: `New contact message from ${input.name}`,
    html: layout("New contact message", rows),
    text: textLayout("New contact message", rows),
  };
}

export function visitorContactEmail(input: ContactInput): EmailMessage {
  const settings = getSiteSettings();
  const paragraphs = [
    `Hello ${input.name},`,
    "Thank you for writing. We have your message and will reply within 1 business day.",
    `If you would rather add something, reply to this email or write to ${settings.email}.`,
  ];
  return {
    subject: `We have your message — ${BRAND.name}`,
    html: layout("We have your message", [], paragraphs),
    text: paragraphs.join("\n\n"),
  };
}
