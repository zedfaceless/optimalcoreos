/**
 * What the audit table means, in one place.
 *
 * `admin_audit_log` stores an `action` and a small `detail` object; the sentence a
 * person reads is built here, so the shape of that `detail` is described by code a
 * test can pin rather than by a comment a writer can drift from. Anything unknown —
 * a row written by a newer deploy, an action this build has never heard of — renders
 * as the action name, because a trail with a blank in it is worse than a trail with a
 * code in it.
 */

export const AUDIT_ACTIONS = [
  "lead.update",
  "message.update",
  "admin.invite",
  "admin.activate",
  "admin.deactivate",
  "admin.role",
  "admin.password",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown> | null;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** `{ from, to }`, or null when the row does not carry both. */
function transition(detail: Record<string, unknown> | null): { from: string; to: string } | null {
  const from = text(detail?.from);
  const to = text(detail?.to);
  return from && to ? { from, to } : null;
}

export function describeAudit(row: {
  action: string;
  detail?: Record<string, unknown> | null;
}): string {
  const detail = row.detail ?? {};

  switch (row.action) {
    case "lead.update":
    case "message.update": {
      const move = transition(detail);
      const notes = detail.notes === true;
      if (move && notes) return `changed status ${move.from} → ${move.to} and edited the notes`;
      if (move) {
        return move.from === move.to
          ? `had not changed the status (${move.to})`
          : `changed status ${move.from} → ${move.to}`;
      }
      if (notes) return "edited the internal notes";
      return "saved without a change";
    }
    case "admin.invite": {
      const email = text(detail.email);
      const role = text(detail.role);
      if (email && role) return `invited ${email} as ${role}`;
      if (email) return `invited ${email}`;
      return "sent an invitation";
    }
    case "admin.activate": {
      const email = text(detail.email);
      return email ? `reactivated ${email}` : "reactivated an admin";
    }
    case "admin.deactivate": {
      const email = text(detail.email);
      return email ? `deactivated ${email}` : "deactivated an admin";
    }
    case "admin.role": {
      const move = transition(detail);
      const email = text(detail.email);
      if (email && move) return `made ${email} ${move.to} (was ${move.from})`;
      return "changed an admin's role";
    }
    case "admin.password":
      return "set a new password";
    default:
      return row.action;
  }
}

/** Grouped label for the audit page's column. */
export function auditActionLabel(action: string): string {
  switch (action) {
    case "lead.update":
      return "Lead";
    case "message.update":
      return "Message";
    case "admin.invite":
      return "Invite";
    case "admin.activate":
    case "admin.deactivate":
    case "admin.role":
      return "Team";
    case "admin.password":
      return "Account";
    default:
      return "Other";
  }
}

/** True when the row is a lead or message change, which the console links back to. */
export function auditHref(row: { entity: string; entity_id: string | null }): string | null {
  if (!row.entity_id) return null;
  if (row.entity === "quote_request") return `/devside/leads/${row.entity_id}`;
  return null;
}
