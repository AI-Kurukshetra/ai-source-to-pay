import Link from "next/link";
import { redirect } from "next/navigation";

import SupplierSidebar from "@/components/dashboard/SupplierSidebar";
import RFQResponseForm from "@/components/forms/RFQResponseForm";
import { getRFQDetailForSupplier } from "@/lib/actions/rfqResponseActions";

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

export default async function SupplierRFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      resolvedParams.id,
    );

  if (!isUuid) {
    redirect("/supplier/rfqs");
  }

  const { data, error } = await getRFQDetailForSupplier(resolvedParams.id);

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error ?? "Unable to load RFQ."}
        </p>
      </main>
    );
  }

  const { rfq, existingResponse, supplierStatus } = data;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <SupplierSidebar />
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
            href="/supplier/rfqs"
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
          <h2 className="text-lg font-semibold">Submit your quote</h2>
          <RFQResponseForm
            rfqId={rfq.id}
            supplierStatus={supplierStatus}
            existingResponse={existingResponse}
          />
          {existingResponse ? (
            <p className="mt-4 text-xs text-slate-500">
              Submitted {formatDateUtc(existingResponse.created_at)}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

