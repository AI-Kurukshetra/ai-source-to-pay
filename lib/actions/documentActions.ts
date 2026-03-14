"use server";

import { createClient } from "@/lib/supabase/server";
import type { SupplierDocumentType } from "@/types/database";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
const DOCUMENT_TYPES = [
  "gst_certificate",
  "company_registration",
  "bank_proof",
  "compliance_certificate",
] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function isAllowedType(type: string) {
  return ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number]);
}

function isDocumentType(value: string): value is SupplierDocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to upload documents." };
  }

  const documentType = String(formData.get("document_type") ?? "");
  const file = formData.get("file");

  if (!documentType) {
    return { error: "Document type is required." };
  }

  if (!isDocumentType(documentType)) {
    return { error: "Invalid document type." };
  }

  if (!(file instanceof File)) {
    return { error: "Document file is required." };
  }

  if (!isAllowedType(file.type)) {
    return { error: "Only PDF, JPG, or PNG files are allowed." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { error: "File size must be 5MB or less." };
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found." };
  }

  const { data: existingDocument } = await supabase
    .from("supplier_documents")
    .select("id")
    .eq("supplier_id", supplier.id)
    .maybeSingle();

  if (existingDocument?.id) {
    return { error: "Only one document is allowed. Delete the existing one first." };
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${user.id}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("supplier-documents")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError.message ?? "Unable to upload file." };
  }

  const { data: publicUrlData } = supabase.storage
    .from("supplier-documents")
    .getPublicUrl(filePath);

  const fileUrl = publicUrlData?.publicUrl ?? filePath;

  const { error: insertError } = await supabase
    .from("supplier_documents")
    .insert({
      supplier_id: supplier.id,
      document_type: documentType,
      file_url: fileUrl,
    });

  if (insertError) {
    return { error: insertError.message ?? "Unable to save document." };
  }

  return { error: null };
}

export async function getSupplierDocuments() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in.", data: null };
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found.", data: null };
  }

  const { data: documents, error } = await supabase
    .from("supplier_documents")
    .select("id, document_type, file_url, uploaded_at")
    .eq("supplier_id", supplier.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return { error: "Unable to load documents.", data: null };
  }

  const latest = documents?.[0] ? [documents[0]] : [];
  return { error: null, data: latest };
}

export async function deleteDocument(input: {
  documentId: string;
  fileUrl: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in.", ok: false };
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found.", ok: false };
  }

  const { data: deletedRows, error: deleteRowError } = await supabase
    .from("supplier_documents")
    .delete()
    .eq("id", input.documentId)
    .eq("supplier_id", supplier.id)
    .select("id");

  if (deleteRowError) {
    return { error: deleteRowError.message ?? "Unable to delete record.", ok: false };
  }

  if (!deletedRows || deletedRows.length === 0) {
    return { error: "No document was deleted. Check permissions.", ok: false };
  }

  let storagePath = input.fileUrl;
  const publicPrefix = "/storage/v1/object/public/supplier-documents/";
  const publicIndex = input.fileUrl.indexOf(publicPrefix);
  if (publicIndex !== -1) {
    storagePath = input.fileUrl.slice(publicIndex + publicPrefix.length);
  } else if (input.fileUrl.startsWith("http")) {
    return { error: null, ok: true };
  }

  if (storagePath) {
    const { error: deleteStorageError } = await supabase.storage
      .from("supplier-documents")
      .remove([storagePath]);

    if (deleteStorageError) {
      return {
        error: deleteStorageError.message ?? "Unable to delete file.",
        ok: false,
      };
    }
  }

  return { error: null, ok: true };
}
