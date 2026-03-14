import ApprovalStatusBadge from "@/components/dashboard/ApprovalStatusBadge";
import SupplierSidebar from "@/components/dashboard/SupplierSidebar";
import SupplierProfileForm from "@/components/forms/SupplierProfileForm";
import { getSupplierProfile } from "@/lib/actions/supplierActions";

export default async function SupplierProfilePage() {
  const { data: supplier, error } = await getSupplierProfile();

  if (error || !supplier) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error ?? "Unable to load profile."}
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <SupplierSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Supplier profile
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              {supplier.company_name}
            </h1>
          </div>
          <ApprovalStatusBadge status={supplier.approval_status} />
        </div>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-300">
            Review and update your supplier information.
          </p>
          <SupplierProfileForm
            initialValues={{
              company_name: supplier.company_name,
              contact_person: supplier.contact_person,
              phone: supplier.phone,
              address: supplier.address,
              gst_number: supplier.gst_number,
              business_type: supplier.business_type,
              product_categories: supplier.product_categories,
            }}
          />
        </section>
      </main>
    </div>
  );
}
