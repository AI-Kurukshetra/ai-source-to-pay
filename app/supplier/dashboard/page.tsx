import ApprovalStatusBadge from "@/components/dashboard/ApprovalStatusBadge";
import SupplierSidebar from "@/components/dashboard/SupplierSidebar";
import { getSupplierDashboardData } from "@/lib/actions/supplierActions";

export default async function SupplierDashboardPage() {
  const { data, error } = await getSupplierDashboardData();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 md:grid md:grid-cols-[260px_1fr]">
        <SupplierSidebar />
        <main className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-200">
            <p className="text-base font-semibold">Complete your profile</p>
            <p className="mt-2 text-slate-400">
              We could not find your supplier profile yet. Submit your company
              details to continue.
            </p>
            <a
              href="/supplier/register"
              className="mt-4 inline-flex rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Go to registration
            </a>
          </div>
        </main>
      </div>
    );
  }

  const { supplier, documentCount, openRfqCount } = data;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <SupplierSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Supplier dashboard
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              Welcome back, {supplier.contact_person}
            </h1>
          </div>
          <ApprovalStatusBadge status={supplier.approval_status} />
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_50px_-40px_rgba(56,189,248,0.6)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Profile summary
            </p>
            <h2 className="mt-3 text-lg font-semibold">{supplier.company_name}</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-300">
              <div>
                <dt className="text-xs uppercase text-slate-500">Contact</dt>
                <dd>{supplier.contact_person}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Phone</dt>
                <dd>{supplier.phone}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">
                  Business type
                </dt>
                <dd>{supplier.business_type}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_50px_-40px_rgba(16,185,129,0.6)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Documents uploaded
            </p>
            <div className="mt-6 text-4xl font-semibold text-emerald-200">
              {documentCount}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Upload compliance documents to complete verification.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_50px_-40px_rgba(34,211,238,0.6)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Open RFQs
            </p>
            <div className="mt-6 text-4xl font-semibold text-cyan-200">
              {openRfqCount}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Review active sourcing events and submit quotes.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold">Product categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {supplier.product_categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
              >
                {category}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
