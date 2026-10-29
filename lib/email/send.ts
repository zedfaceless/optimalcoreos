import "server-only";
import { Resend } from "resend";
import type { EmailMessage } from "@/lib/email/templates";
import { ownerNotifyEmails } from "@/lib/site/settings";

/**
 * Email is a notification, not the record: the row is written first and survives a
 * failed send. So a missing key, a bad address or a Resend outage returns `false`
 * and is logged; nothing throws into the route handler and no visitor sees a
 * stack trace because an API key expired.
 */
type SendArgs = {
  to: string | string[];
  message: EmailMessage;
  replyTo?: string;
};

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "Optimal Core OS <onboarding@resend.dev>";
}

export async function sendEmail({ to, message, replyTo }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!key || recipients.length === 0) {
    console.warn("[email] skipped: no RESEND_API_KEY or no recipient", message.subject);
    return false;
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: recipients,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[email] Resend refused the message", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}

/** Notify the owners; a no-op when nobody is configured to be notified. */
export async function notifyOwners(message: EmailMessage, replyTo?: string): Promise<boolean> {
  const owners = ownerNotifyEmails();
  if (owners.length === 0) {
    console.warn("[email] skipped: OWNER_NOTIFY_EMAIL is empty", message.subject);
    return false;
  }
  return sendEmail({ to: owners, message, replyTo });
}
