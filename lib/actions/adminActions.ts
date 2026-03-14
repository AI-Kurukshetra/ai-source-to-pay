"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in.", supabase: null };
  }

  const role = user.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Unauthorized.", supabase: null };
  }

  return { error: null, supabase };
}

export async function approveSupplier(id: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("suppliers")
    .update({ approval_status: "approved" })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message ?? "Unable to approve supplier." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
  return { error: null };
}

export async function rejectSupplier(id: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("suppliers")
    .update({ approval_status: "rejected" })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message ?? "Unable to reject supplier." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
  return { error: null };
}

type ActionState = { error: string | null };

export async function approveSupplierAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supplierId = String(formData.get("supplierId") ?? "");
  if (!supplierId) {
    return { error: "Missing supplier id." };
  }
  const result = await approveSupplier(supplierId);
  return { error: result.error ?? null };
}

export async function rejectSupplierAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supplierId = String(formData.get("supplierId") ?? "");
  if (!supplierId) {
    return { error: "Missing supplier id." };
  }
  const result = await rejectSupplier(supplierId);
  return { error: result.error ?? null };
}

export async function getAdminDashboardStats() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error, data: null };
  }

  const [totalSuppliers, pendingSuppliers, approvedSuppliers] =
    await Promise.all([
      supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "pending"),
      supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "approved"),
    ]);

  return {
    error: null,
    data: {
      totalSuppliers: totalSuppliers.count ?? 0,
      pendingSuppliers: pendingSuppliers.count ?? 0,
      approvedSuppliers: approvedSuppliers.count ?? 0,
    },
  };
}

export async function getSuppliers(params?: {
  query?: string;
  status?: "pending" | "approved" | "rejected" | "all";
  sort?: "newest" | "oldest" | "name_asc" | "name_desc";
}) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error, data: null };
  }

  let queryBuilder = supabase
    .from("suppliers")
    .select(
      "id, company_name, contact_person, gst_number, approval_status, created_at, email",
    );

  const normalizedQuery = params?.query?.trim();
  if (normalizedQuery) {
    queryBuilder = queryBuilder.or(
      `company_name.ilike.%${normalizedQuery}%,contact_person.ilike.%${normalizedQuery}%,gst_number.ilike.%${normalizedQuery}%,email.ilike.%${normalizedQuery}%`,
    );
  }

  if (params?.status && params.status !== "all") {
    queryBuilder = queryBuilder.eq("approval_status", params.status);
  }

  switch (params?.sort) {
    case "oldest":
      queryBuilder = queryBuilder.order("created_at", { ascending: true });
      break;
    case "name_asc":
      queryBuilder = queryBuilder.order("company_name", { ascending: true });
      break;
    case "name_desc":
      queryBuilder = queryBuilder.order("company_name", { ascending: false });
      break;
    case "newest":
    default:
      queryBuilder = queryBuilder.order("created_at", { ascending: false });
      break;
  }

  const { data, error: fetchError } = await queryBuilder;

  if (fetchError) {
    return { error: fetchError.message ?? "Unable to load suppliers.", data: null };
  }

  return { error: null, data: data ?? [] };
}

export async function getSupplierDetail(id: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error, data: null };
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select(
      "id, company_name, contact_person, phone, address, gst_number, business_type, product_categories, approval_status, created_at, email",
    )
    .eq("id", id)
    .single();

  if (supplierError || !supplier) {
    return {
      error: supplierError?.message ?? "Supplier not found.",
      data: null,
    };
  }

  const { data: documents, error: documentsError } = await supabase
    .from("supplier_documents")
    .select("id, document_type, file_url, uploaded_at")
    .eq("supplier_id", supplier.id)
    .order("uploaded_at", { ascending: false });

  if (documentsError) {
    return {
      error: documentsError.message ?? "Unable to load supplier documents.",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      supplier,
      documents: documents ?? [],
    },
  };
}
