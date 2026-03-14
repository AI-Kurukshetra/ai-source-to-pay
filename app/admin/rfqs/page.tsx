import Link from "next/link";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { getRFQs } from "@/lib/actions/rfqActions";
import { getSession } from "@/lib/auth/getSession";

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

function getStatus(deadline: string) {
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) {
    return "Open";
  }
  return date.getTime() > Date.now() ? "Open" : "Closed";
}

export default async function AdminRFQsPage() {
  const { session, role } = await getSession();

  if (!session || role !== "admin") {
    redirect("/login");
  }

  const { data, error } = await getRFQs();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              RFQ management
            </p>
            <h1 className="mt-3 text-2xl font-semibold">RFQs</h1>
          </div>
          <Link
            href="/admin/rfqs/create"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            Create RFQ
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
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Responses</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((rfq: any) => (
                    <tr key={rfq.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-100">
                          {rfq.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          Created {formatDateUtc(rfq.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                          {getStatus(rfq.deadline)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDateUtc(rfq.deadline)}</td>
                      <td className="px-4 py-3">{rfq.responseCount ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/rfqs/${rfq.id}`}
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
            <p className="text-sm text-slate-400">No RFQs created yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

