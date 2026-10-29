import Link from "next/link";
import { inviteAdmin, setAdminActive, setAdminRole } from "@/app/devside/actions";
import { requireOwner } from "@/lib/devside/auth";
import { formatInManila } from "@/lib/devside/format";
import { TEAM_ERRORS } from "@/lib/devside/team";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * `/devside/team` — the allowlist, as a page (§12.6).
 *
 * Until this existed, adding an admin meant a SQL insert in Studio, which is the step
 * a second person in the business should never have to ask a developer for. The page
 * invites, promotes, demotes and deactivates; the two rules that keep it from locking
 * itself out are in `lib/devside/team.ts` and are enforced again inside every action,
 * because this page is a convenience and the action is the gate.
 */
export const metadata = { title: "Team" };

const PANEL = "rounded-card border border-gray-200 bg-white shadow-card";

const INPUT =
  "mt-1.5 w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20";

const SMALL_BUTTON =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm text-gray-700 transition-colors hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40";

type Member = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  invited_by: string | null;
  created_at: string;
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invited?: string; saved?: string }>;
}) {
  const admin = await requireOwner();
  const { error, invited, saved } = await searchParams;

  const service = adminSupabase();
  if (!service) {
    return (
      <p className={`${PANEL} p-6 text-sm text-gray-600`}>
        The database is not configured on this deployment.
      </p>
    );
  }

  const { data, error: readError } = await service
    .from("admin_users")
    .select("id, email, display_name, role, is_active, invited_by, created_at")
    .order("created_at", { ascending: true });

  if (readError) {
    return (
      <p className="rounded-card border border-danger-600/30 bg-white p-6 text-sm text-danger-600">
        Could not read the team: {readError.message}
      </p>
    );
  }

  const members = (data ?? []) as Member[];
  const activeOwners = members.filter((member) => member.role === "owner" && member.is_active).length;
  const message = error ? (TEAM_ERRORS[error] ?? TEAM_ERRORS.save) : "";
  const notice = invited
    ? "Invitation sent. They set their password from the link."
    : saved
      ? "Saved."
      : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Team</h1>
        <p className="mt-1 text-sm text-gray-600">
          Who can sign in to this console. A Supabase account alone is not enough: this list is what
          the console checks on every request.
        </p>
      </div>

      {message ? (
        <p
          role="alert"
          className="rounded-[10px] border border-danger-600/30 bg-danger-600/5 px-3.5 py-3 text-sm text-danger-600"
        >
          {message}
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-600"
        >
          {notice}
        </p>
      ) : null}

      <section className={`${PANEL} p-5`}>
        <h2 className="font-display text-base font-semibold text-navy-900">Invite somebody</h2>
        <p className="mt-1 text-sm text-gray-600">
          They get an email with a link that sets their password. Owners manage this page; staff work
          the leads and nothing else.
        </p>
        <form action={inviteAdmin} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-900">
              Email
            </label>
            <input id="invite-email" name="email" type="email" required className={INPUT} />
          </div>
          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-gray-900">
              Role
            </label>
            <select id="invite-role" name="role" defaultValue="staff" className={INPUT}>
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Send invitation
          </button>
        </form>
      </section>

      <section className={`${PANEL} overflow-hidden`}>
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-display text-base font-semibold text-navy-900">
            {members.length} {members.length === 1 ? "person" : "people"}
          </h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {members.map((member) => {
            const isSelf = member.email.toLowerCase() === admin.email.toLowerCase();
            const lastOwner = member.role === "owner" && activeOwners <= 1;
            return (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {member.display_name ? `${member.display_name} · ` : ""}
                    {member.email}
                    {isSelf ? <span className="ml-2 text-xs text-gray-400">(you)</span> : null}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {member.is_active ? "Active" : "Deactivated"} · added{" "}
                    {formatInManila(member.created_at)}
                    {member.invited_by ? ` · invited by ${member.invited_by}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={setAdminRole} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={member.id} />
                    <label htmlFor={`role-${member.id}`} className="sr-only">
                      Role for {member.email}
                    </label>
                    <select
                      id={`role-${member.id}`}
                      name="role"
                      defaultValue={member.role}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button type="submit" className={SMALL_BUTTON}>
                      Set
                    </button>
                  </form>

                  {/* The button is disabled for the same two cases the action refuses,
                      so the page does not offer a click whose only outcome is an error. */}
                  <form action={setAdminActive}>
                    <input type="hidden" name="id" value={member.id} />
                    <input type="hidden" name="active" value={member.is_active ? "0" : "1"} />
                    <button
                      type="submit"
                      className={SMALL_BUTTON}
                      disabled={isSelf || (member.is_active && lastOwner)}
                    >
                      {member.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-sm text-gray-600">
        Every change here is recorded in the{" "}
        <Link href="/devside/audit" className="text-brand-600 hover:underline">
          audit trail
        </Link>
        . A deactivated admin keeps their Supabase account and loses the console: every page redirects
        and the export answers 401 the moment <code>is_active</code> is false.
      </p>
    </div>
  );
}
