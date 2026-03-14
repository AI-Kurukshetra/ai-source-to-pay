import Link from "next/link";
import { redirect } from "next/navigation";

import ApprovalStatusBadge from "@/components/dashboard/ApprovalStatusBadge";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import SupplierApprovalActions from "@/components/dashboard/SupplierApprovalActions";
import { getSupplierDetail } from "@/lib/actions/adminActions";
import { getSession } from "@/lib/auth/getSession";

const documentLabels: Record<string, string> = {
  gst_certificate: "GST certificate",
  company_registration: "Company registration",
  bank_proof: "Bank proof",
};

function formatDateUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

export default async function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { session, role } = await getSession();

  if (!session || role !== "admin") {
    redirect("/login");
  }

  // Guard against bad links like `/admin/suppliers/undefined`.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      resolvedParams.id,
    );
  if (!isUuid) {
    redirect("/admin/suppliers");
  }

  const { data, error } = await getSupplierDetail(resolvedParams.id);

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error ?? "Unable to load supplier."}
        </p>
      </main>
    );
  }

  const { supplier, documents } = data;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Supplier detail
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              {supplier.company_name}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Joined {formatDateUtc(supplier.created_at)}
            </p>
          </div>
          <ApprovalStatusBadge status={supplier.approval_status} />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Supplier profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-500">Contact person</p>
              <p className="text-sm text-slate-200">{supplier.contact_person}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Email</p>
              <p className="text-sm text-slate-200">{supplier.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Phone</p>
              <p className="text-sm text-slate-200">{supplier.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">GST</p>
              <p className="text-sm text-slate-200">{supplier.gst_number}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Business type</p>
              <p className="text-sm text-slate-200">{supplier.business_type}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Address</p>
              <p className="text-sm text-slate-200">{supplier.address}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase text-slate-500">
              Product categories
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {supplier.product_categories.map((category: string) => (
                <span
                  key={category}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Uploaded documents</h2>
            <SupplierApprovalActions
              supplierId={supplier.id}
              approvalStatus={supplier.approval_status}
            />
          </div>
          {documents.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Uploaded</th>
                    <th className="px-4 py-3">File</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">
                        {documentLabels[doc.document_type] ?? doc.document_type}
                      </td>
                      <td className="px-4 py-3">
                        {formatDateUtc(doc.uploaded_at)}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={doc.file_url}
                          className="text-cyan-300 hover:text-cyan-200"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No documents uploaded.
            </p>
          )}
          <div className="mt-6">
            <Link
              href="/admin/suppliers"
              className="text-sm text-slate-300 hover:text-slate-100"
            >
              Back to suppliers
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
