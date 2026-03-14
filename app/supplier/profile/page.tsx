import ApprovalStatusBadge from "@/components/dashboard/ApprovalStatusBadge";
import SupplierSidebar from "@/components/dashboard/SupplierSidebar";
import { getSupplierProfile, updateSupplierProfile } from "@/lib/actions/supplierActions";

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
          <form
            action={async (formData) => {
              "use server";
              const productCategories = String(
                formData.get("product_categories") ?? "",
              )
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

              await updateSupplierProfile({
                company_name: String(formData.get("company_name") ?? ""),
                contact_person: String(formData.get("contact_person") ?? ""),
                phone: String(formData.get("phone") ?? ""),
                address: String(formData.get("address") ?? ""),
                gst_number: String(formData.get("gst_number") ?? ""),
                business_type: String(formData.get("business_type") ?? ""),
                product_categories: productCategories,
              });
            }}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="text-sm font-medium text-slate-200">
                Company name
              </label>
              <input
                name="company_name"
                defaultValue={supplier.company_name}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">
                Contact person
              </label>
              <input
                name="contact_person"
                defaultValue={supplier.contact_person}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">Phone</label>
              <input
                name="phone"
                defaultValue={supplier.phone}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">
                GST / Tax ID
              </label>
              <input
                name="gst_number"
                defaultValue={supplier.gst_number}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">
                Business type
              </label>
              <input
                name="business_type"
                defaultValue={supplier.business_type}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">
                Product categories
              </label>
              <input
                name="product_categories"
                defaultValue={supplier.product_categories.join(", ")}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-200">
                Address
              </label>
              <textarea
                name="address"
                defaultValue={supplier.address}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                Save changes
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
