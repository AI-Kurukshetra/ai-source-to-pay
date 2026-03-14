import Link from "next/link";
import { redirect } from "next/navigation";

import ApprovalStatusBadge from "@/components/dashboard/ApprovalStatusBadge";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { getSuppliers } from "@/lib/actions/adminActions";
import { getSession } from "@/lib/auth/getSession";

type AdminSuppliersPageProps = {
  searchParams?: {
    query?: string;
    status?: "pending" | "approved" | "rejected" | "all";
    sort?: "newest" | "oldest" | "name_asc" | "name_desc";
  };
};

export default async function AdminSuppliersPage({
  searchParams,
}: AdminSuppliersPageProps) {
  const { session, role } = await getSession();

  if (!session || role !== "admin") {
    redirect("/login");
  }

  const { data, error } = await getSuppliers({
    query: searchParams?.query,
    status: searchParams?.status,
    sort: searchParams?.sort,
  });
  const statusValue = searchParams?.status ?? "all";
  const sortValue = searchParams?.sort ?? "newest";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Supplier management
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Suppliers</h1>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <form className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
            <input
              type="text"
              name="query"
              defaultValue={searchParams?.query ?? ""}
              placeholder="Search by company, contact, GST, or email"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            />
            <select
              name="status"
              defaultValue={statusValue}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              name="sort"
              defaultValue={sortValue}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Apply
            </button>
          </form>
          {error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : data && data.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Company name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">GST</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((supplier) => (
                    <tr key={supplier.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-100">
                          {supplier.company_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Joined {new Date(supplier.created_at).toISOString().slice(0, 10)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-200">
                          {supplier.contact_person}
                        </div>
                        <div className="text-xs text-slate-400">
                          {supplier.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">{supplier.gst_number}</td>
                      <td className="px-4 py-3">
                        <ApprovalStatusBadge status={supplier.approval_status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/suppliers/${supplier.id}`}
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
            <p className="text-sm text-slate-400">No suppliers yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
