import { redirect } from "next/navigation";

import EmployeeSidebar from "@/components/dashboard/EmployeeSidebar";
import RequisitionForm from "@/components/forms/RequisitionForm";
import { getSession } from "@/lib/auth/getSession";

export default async function EmployeeCreateRequisitionPage() {
  const { session, role } = await getSession();
  if (!session || role !== "employee") redirect("/login");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <EmployeeSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Purchase requisitions
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Create PR</h1>
          <p className="mt-2 text-sm text-slate-400">
            Submit a purchase requisition for procurement review.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <RequisitionForm redirectTo="/employee/requisitions" />
        </section>
      </main>
    </div>
  );
}

