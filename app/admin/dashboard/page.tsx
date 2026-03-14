import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { getAdminDashboardStats } from "@/lib/actions/adminActions";
import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const { session, role } = await getSession();

  if (!session || role !== "admin") {
    redirect("/login");
  }

  const { data, error } = await getAdminDashboardStats();

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error ?? "Unable to load dashboard."}
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
              Admin dashboard
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Overview</h1>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_50px_-40px_rgba(56,189,248,0.6)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Total suppliers
            </p>
            <div className="mt-6 text-4xl font-semibold text-cyan-200">
              {data.totalSuppliers}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Registered suppliers in the system.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_50px_-40px_rgba(251,191,36,0.6)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Pending approvals
            </p>
            <div className="mt-6 text-4xl font-semibold text-amber-200">
              {data.pendingSuppliers}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Suppliers awaiting review.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_50px_-40px_rgba(52,211,153,0.6)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Approved suppliers
            </p>
            <div className="mt-6 text-4xl font-semibold text-emerald-200">
              {data.approvedSuppliers}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Active suppliers ready for RFQs.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
