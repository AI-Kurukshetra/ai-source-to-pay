import Link from "next/link";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/dashboard/AdminSidebar";
import RequisitionDecisionActions from "@/components/dashboard/RequisitionDecisionActions";
import ConvertToPOModalButton from "@/components/dashboard/ConvertToPOModalButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { getRequisitionById } from "@/lib/actions/requisitionActions";
import { getSession } from "@/lib/auth/getSession";

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export default async function AdminRequisitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { session, role } = await getSession();
  if (!session || role !== "admin") redirect("/login");

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      resolvedParams.id,
    );
  if (!isUuid) redirect("/admin/requisitions");

  const { data, error } = await getRequisitionById(resolvedParams.id);

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error ?? "Unable to load requisition."}
        </p>
      </main>
    );
  }

  const canConvertToPo = data.status === "approved";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Requisition detail
            </p>
            <h1 className="mt-3 text-2xl font-semibold">{data.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Created {formatDateUtc(data.created_at)}
            </p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Requisition info</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-500">Item</p>
              <p className="text-sm text-slate-200">{data.item_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Category</p>
              <p className="text-sm text-slate-200">{data.category}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Quantity</p>
              <p className="text-sm text-slate-200">{data.quantity}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Estimated budget</p>
              <p className="text-sm text-slate-200">{data.estimated_budget}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Urgency</p>
              <p className="text-sm text-slate-200">{data.urgency}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase text-slate-500">Description</p>
            <p className="mt-2 text-sm text-slate-200">{data.description}</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Decision</h2>
            {canConvertToPo ? (
              <ConvertToPOModalButton />
            ) : null}
          </div>
          <div className="mt-4">
            <RequisitionDecisionActions requisitionId={data.id} status={data.status} />
          </div>
          <div className="mt-6">
            <Link
              href="/admin/requisitions"
              className="text-sm text-slate-300 hover:text-slate-100"
            >
              Back to requisitions
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
