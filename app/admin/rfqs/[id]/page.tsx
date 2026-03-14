import Link from "next/link";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { getRFQById, getRFQResponses } from "@/lib/actions/rfqActions";
import { getSession } from "@/lib/auth/getSession";

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

export default async function AdminRFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { session, role } = await getSession();

  if (!session || role !== "admin") {
    redirect("/login");
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      resolvedParams.id,
    );
  if (!isUuid) {
    redirect("/admin/rfqs");
  }

  const [{ data: rfq, error: rfqError }, { data: responses, error: respError }] =
    await Promise.all([
      getRFQById(resolvedParams.id),
      getRFQResponses(resolvedParams.id),
    ]);

  if (rfqError || !rfq) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {rfqError ?? "RFQ not found."}
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              RFQ detail
            </p>
            <h1 className="mt-3 text-2xl font-semibold">{rfq.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Deadline {formatDateUtc(rfq.deadline)} • Quantity {rfq.quantity}
            </p>
          </div>
          <Link
            href="/admin/rfqs"
            className="text-sm text-slate-300 hover:text-slate-100"
          >
            Back to RFQs
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">RFQ details</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-500">Description</p>
              <p className="mt-2 text-sm text-slate-200">{rfq.description}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">
                Product requirements
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {rfq.product_requirements}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Supplier responses</h2>
          {respError ? (
            <p className="mt-4 text-sm text-rose-300">{respError}</p>
          ) : responses && responses.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Quote price</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((resp: any) => (
                    <tr key={resp.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-100">
                          {resp.suppliers?.company_name ?? "Unknown supplier"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {resp.suppliers?.contact_person ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">{resp.quote_price}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {resp.message}
                      </td>
                      <td className="px-4 py-3">
                        {formatDateUtc(resp.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No supplier responses yet.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

