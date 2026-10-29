import Link from "next/link";
import { requireOwner } from "@/lib/devside/auth";
import { auditActionLabel, auditHref, describeAudit, type AuditRow } from "@/lib/devside/audit";
import { formatInManila, relativeTime } from "@/lib/devside/format";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * `/devside/audit` — who changed what, newest first (§13's audit log).
 *
 * Owner-only, which is a decision rather than a default: the trail records who moved
 * which lead to `lost`, and a staff admin reading it is reading their colleagues'
 * work. Nothing here is editable — the table grants `select` and `insert` to the
 * service key and nothing else, so the only writer is an action, and there is no
 * update path for a mistake to be quietly corrected through.
 *
 * Two hundred rows is a page, not a history: the export and the lead page are how an
 * older event is found, and the count line says when the list is truncated rather
 * than letting the bottom of the page look like the beginning of time.
 */
export const metadata = { title: "Audit trail" };

const LIMIT = 200;

const PANEL = "rounded-card border border-gray-200 bg-white shadow-card";

export default async function AuditPage() {
  await requireOwner();

  const service = adminSupabase();
  if (!service) {
    return (
      <p className={`${PANEL} p-6 text-sm text-gray-600`}>
        The database is not configured on this deployment.
      </p>
    );
  }

  const { data, error } = await service
    .from("admin_audit_log")
    .select("id, created_at, actor_email, action, entity, entity_id, detail")
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (error) {
    return (
      <p className="rounded-card border border-danger-600/30 bg-white p-6 text-sm text-danger-600">
        Could not read the audit trail: {error.message}
      </p>
    );
  }

  const rows = (data ?? []) as AuditRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Audit trail</h1>
        <p className="mt-1 text-sm text-gray-600">
          Every console change, with the address that made it. Append-only: nothing here can be
          edited or deleted from the console.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className={`${PANEL} p-6 text-sm text-gray-600`}>
          Nothing recorded yet. Changing a lead&apos;s status or inviting somebody writes the first
          line.
        </p>
      ) : (
        <section className={`${PANEL} overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  When
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Who
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  What
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const href = auditHref(row);
                return (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3 align-top text-gray-600">
                      <span title={formatInManila(row.created_at)}>{relativeTime(row.created_at)}</span>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <span className="text-gray-900">{row.actor_email}</span>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <span className="mr-2 rounded-full bg-gray-100 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-600">
                        {auditActionLabel(row.action)}
                      </span>
                      {href ? (
                        <Link href={href} className="text-gray-900 hover:text-brand-700 hover:underline">
                          {describeAudit(row)}
                        </Link>
                      ) : (
                        <span className="text-gray-900">{describeAudit(row)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === LIMIT ? (
            <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-600">
              Showing the most recent {LIMIT} events. Older ones are on the lead or message they
              belong to.
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}
