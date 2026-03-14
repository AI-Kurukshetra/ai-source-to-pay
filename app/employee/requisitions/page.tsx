import Link from "next/link";
import { redirect } from "next/navigation";

import EmployeeSidebar from "@/components/dashboard/EmployeeSidebar";
import StatusBadge from "@/components/ui/StatusBadge";
import { getPurchaseRequisitions } from "@/lib/actions/requisitionActions";
import { getSession } from "@/lib/auth/getSession";

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export default async function EmployeeRequisitionsPage() {
  const { session, role } = await getSession();
  if (!session || role !== "employee") redirect("/login");

  const { data, error } = await getPurchaseRequisitions();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <EmployeeSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Purchase requisitions
            </p>
            <h1 className="mt-3 text-2xl font-semibold">My requisitions</h1>
          </div>
          <Link
            href="/employee/requisitions/create"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            Create PR
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          {error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : data && data.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Urgency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((pr: any) => (
                    <tr key={pr.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-100">
                          {pr.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          Created {formatDateUtc(pr.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">{pr.item_name}</td>
                      <td className="px-4 py-3">{pr.quantity}</td>
                      <td className="px-4 py-3">{pr.estimated_budget}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                          {pr.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pr.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/employee/requisitions/${pr.id}`}
                          className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No requisitions yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

