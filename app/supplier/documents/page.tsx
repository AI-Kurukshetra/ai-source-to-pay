import SupplierDocumentsSection from "@/components/dashboard/SupplierDocumentsSection";
import SupplierSidebar from "@/components/dashboard/SupplierSidebar";
import { getSupplierDocuments } from "@/lib/actions/documentActions";

export default async function SupplierDocumentsPage() {
  const { data: documents, error } = await getSupplierDocuments();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <SupplierSidebar />
      <main className="px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Documents
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              Upload compliance documents
            </h1>
          </div>
        </div>

        <SupplierDocumentsSection
          initialDocuments={documents}
          initialError={error}
        />
      </main>
    </div>
  );
}
