/**
 * The two rules that keep the console's allowlist from locking itself out.
 *
 * Both are pure so both are testable: the action calls the guard, then writes. They
 * return a reason instead of throwing, because every caller turns the reason into the
 * same kind of `?error=` slug the rest of `/devside` already uses.
 *
 * "Last owner" counts *active* owners. A store of one owner who deactivates their own
 * row has no way back in through the console — the recovery path would be Studio and a
 * SQL insert, which is exactly the manual step this table exists to remove.
 */

export type AdminRole = "owner" | "staff";

export type DeactivateCheck = {
  actorEmail: string;
  targetEmail: string;
  targetActive: boolean;
  targetRole: AdminRole;
  activeOwnerCount: number;
};

export function deactivationRefusal(check: DeactivateCheck): string | null {
  if (!check.targetActive) return "already-inactive";
  if (check.actorEmail.toLowerCase() === check.targetEmail.toLowerCase()) return "self";
  if (check.targetRole === "owner" && check.activeOwnerCount <= 1) return "last-owner";
  return null;
}

export type RoleCheck = {
  actorEmail: string;
  targetEmail: string;
  targetActive: boolean;
  targetRole: AdminRole;
  nextRole: AdminRole;
  activeOwnerCount: number;
};

export function roleChangeRefusal(check: RoleCheck): string | null {
  if (check.targetRole === check.nextRole) return "unchanged";
  if (check.actorEmail.toLowerCase() === check.targetEmail.toLowerCase()) return "self";
  /* Only the loss of `owner` is dangerous, and only while the target is the last one
     holding it. Promoting a staff member never needs a guard. */
  if (
    check.targetActive &&
    check.targetRole === "owner" &&
    check.targetRole !== check.nextRole &&
    check.activeOwnerCount <= 1
  ) {
    return "last-owner";
  }
  return null;
}

/** The sentence the team page shows for each refusal slug. */
export const TEAM_ERRORS: Record<string, string> = {
  self: "You cannot change your own access here.",
  "last-owner": "There has to be one active owner. Invite or promote somebody first.",
  "already-inactive": "That account is already deactivated.",
  unchanged: "Nothing to change.",
  duplicate: "That address is already on the list.",
  invite: "The invitation could not be sent. Check the Auth settings and try again.",
  invalid: "That does not look like an email address.",
  unconfigured: "The console is not configured on this deployment.",
  save: "Could not save that change.",
  forbidden: "Only an owner can manage the team.",
};
