"use client";

import { useState, useTransition } from "react";

import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
import { deleteDocument, getSupplierDocuments } from "@/lib/actions/documentActions";

type DocumentItem = {
  id: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
};

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

type SupplierDocumentsSectionProps = {
  initialDocuments: DocumentItem[] | null;
  initialError: string | null;
};

export default function SupplierDocumentsSection({
  initialDocuments,
  initialError,
}: SupplierDocumentsSectionProps) {
  const [documents, setDocuments] = useState<DocumentItem[] | null>(
    initialDocuments,
  );
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDoc, setConfirmDoc] = useState<DocumentItem | null>(null);

  const refreshDocuments = () => {
    startTransition(async () => {
      const result = await getSupplierDocuments();
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setDocuments(result.data);
    });
  };

  return (
    <>
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold">Add new document</h2>
        <DocumentUploadForm onUploaded={refreshDocuments} />
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Uploaded documents</h2>
          {isPending ? (
            <span className="text-xs text-slate-400">Refreshing...</span>
          ) : null}
        </div>
        {error ? (
          <p className="mt-4 text-sm text-rose-300">{error}</p>
        ) : documents && documents.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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
                        className="text-emerald-300 hover:text-emerald-200"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={deleteId === doc.id}
                        onClick={() => {
                          setConfirmDoc(doc);
                        }}
                        className="text-xs font-semibold text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No documents uploaded yet.
          </p>
        )}
      </section>

      {confirmDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Delete document?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This will remove the document record and file. You can upload it
              again later if needed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDoc(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteId === confirmDoc.id}
                onClick={() => {
                  setDeleteId(confirmDoc.id);
                  startTransition(async () => {
                    const result = await deleteDocument({
                      documentId: confirmDoc.id,
                      fileUrl: confirmDoc.file_url,
                    });
                            if (result.error) {
                              setError(result.error);
                            } else {
                              setError(null);
                              setDocuments((prev) =>
                                prev
                                  ? prev.filter((item) => item.id !== confirmDoc.id)
                                  : prev,
                              );
                              refreshDocuments();
                            }
                            setDeleteId(null);
                            setConfirmDoc(null);
                          });
                }}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteId === confirmDoc.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
