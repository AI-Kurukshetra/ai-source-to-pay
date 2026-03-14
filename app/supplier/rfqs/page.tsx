import Link from "next/link";

import SupplierSidebar from "@/components/dashboard/SupplierSidebar";
import { getOpenRFQsForSupplier } from "@/lib/actions/rfqResponseActions";

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

export default async function SupplierRFQsPage() {
  const { data, error } = await getOpenRFQsForSupplier();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <SupplierSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              RFQs
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Open RFQs</h1>
            <p className="mt-2 text-sm text-slate-400">
              Review RFQs and submit your quote before the deadline.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          {error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : data && data.supplierStatus !== "approved" ? (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Your account is {data.supplierStatus}. RFQs are visible only after
              approval.
            </p>
          ) : data && data.rfqs.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rfqs.map((rfq) => (
                    <tr key={rfq.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-100">
                          {rfq.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          Created {formatDateUtc(rfq.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">{rfq.quantity}</td>
                      <td className="px-4 py-3">
                        {formatDateUtc(rfq.deadline)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/supplier/rfqs/${rfq.id}`}
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
            <div className="space-y-2 text-sm text-slate-400">
              <p>No open RFQs available right now.</p>
              {data && data.totalVisible > 0 ? (
                <p className="text-xs text-slate-500">
                  {data.closedCount} RFQ(s) are closed (deadline passed).
                </p>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
