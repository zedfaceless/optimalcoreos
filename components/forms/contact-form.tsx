"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { contactSchema, fieldErrors } from "@/lib/validation/forms";

/**
 * The contact form (§7.7). It validates with the same schema the route handler
 * does, announces errors in place, keeps what the visitor typed when the request
 * fails, and never reports success it did not see. No CAPTCHA: the hidden field, the
 * three-second floor, the throwaway-domain list, the link count and the server
 * throttle are what this form has instead (§15.5).
 */
const empty = { name: "", email: "", message: "", website: "" };

export function ContactForm({ contactEmail }: { contactEmail: string }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [failure, setFailure] = useState("");

  /* Sent and never rendered, so a value that exists only in the browser is right;
     see the same ref in the quote wizard for why a missing one drops nothing. */
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (key: keyof typeof empty) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => (current[key] ? { ...current, [key]: "" } : current));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setStatus("sending");
    setFailure("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, formStartedAt: startedAt.current }),
      });
      const payload: { ok?: boolean; message?: string; fields?: Record<string, string> } = await response
        .json()
        .catch(() => ({}));
      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setFailure(payload.message ?? `We could not send that. Please email ${contactEmail}.`);
        setStatus("failed");
        return;
      }
      setValues(empty);
      setStatus("done");
    } catch {
      setFailure(`We could not reach the server. Please email ${contactEmail}.`);
      setStatus("failed");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-card border border-gray-200 bg-white p-6 shadow-card md:p-8">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
          <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-navy-950">Message sent</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-600">
          Thank you. We have your message and will reply within 1 business day. A confirmation is on its way to your
          inbox.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-card border border-gray-200 bg-white p-6 shadow-card md:p-8">
      <div className="space-y-5">
        <Field id="contact-name" label="Your name" error={errors.name}>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={describedBy("contact-name", undefined, errors.name)}
          />
        </Field>

        <Field id="contact-email" label="Email address" error={errors.email}>
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={describedBy("contact-email", undefined, errors.email)}
          />
        </Field>

        <Field
          id="contact-message"
          label="How can we help?"
          hint="A sentence or two is plenty. What is slow, and what would a good result look like?"
          error={errors.message}
        >
          <Textarea
            id="contact-message"
            name="message"
            value={values.message}
            onChange={set("message")}
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={describedBy("contact-message", "hint", errors.message)}
          />
        </Field>

        {/* Hidden from people, tempting to bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </div>
      </div>

      {status === "failed" && failure ? (
        <p role="alert" className="mt-5 rounded-lg bg-danger-600/5 px-4 py-3 text-[0.875rem] font-medium text-danger-600">
          {failure}
        </p>
      ) : null}

      <div className="mt-6">
        <Button type="submit" size="lg" loading={status === "sending"} className="w-full sm:w-auto">
          Send message
        </Button>
        <p className="mt-3 text-[0.8125rem] text-gray-600">
          We reply within 1 business day. We never share your details.
        </p>
      </div>
    </form>
  );
}
