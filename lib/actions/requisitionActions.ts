"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type RequisitionUrgency = "low" | "medium" | "high";
export type RequisitionStatus = "draft" | "pending" | "approved" | "rejected";

type RequisitionInput = {
  title: string;
  item_name: string;
  description: string;
  quantity: number;
  estimated_budget: number;
  category: string;
  urgency: RequisitionUrgency;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in.", supabase: null, user: null };
  }

  const role = user.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Unauthorized.", supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

async function requireEmployeeOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in.",
      supabase: null,
      user: null,
      role: null as "admin" | "employee" | null,
    };
  }

  const role = user.user_metadata?.role;
  if (role !== "admin" && role !== "employee") {
    return {
      error: "Unauthorized.",
      supabase: null,
      user: null,
      role: null as "admin" | "employee" | null,
    };
  }

  return { error: null, supabase, user, role };
}

export async function createRequisition(input: RequisitionInput) {
  const { error, supabase, user } = await requireEmployeeOrAdmin();
  if (error || !supabase || !user) {
    return { error };
  }

  const { error: insertError } = await supabase
    .from("purchase_requisitions")
    .insert({
      title: input.title,
      item_name: input.item_name,
      description: input.description,
      quantity: input.quantity,
      estimated_budget: input.estimated_budget,
      category: input.category,
      urgency: input.urgency,
      status: "pending",
      created_by: user.id,
    });

  if (insertError) {
    return { error: insertError.message ?? "Unable to create requisition." };
  }

  revalidatePath("/admin/requisitions");
  revalidatePath("/admin/dashboard");
  return { error: null };
}

export async function getPurchaseRequisitions() {
  const { error, supabase, user, role } = await requireEmployeeOrAdmin();
  if (error || !supabase || !user) {
    return { error, data: null };
  }

  let query = supabase
    .from("purchase_requisitions")
    .select(
      "id, title, item_name, quantity, estimated_budget, urgency, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (role === "employee") {
    query = query.eq("created_by", user.id);
  }

  const { data, error: fetchError } = await query;

  if (fetchError) {
    return {
      error: fetchError.message ?? "Unable to load purchase requisitions.",
      data: null,
    };
  }

  return { error: null, data: data ?? [] };
}

export async function getRequisitionById(id: string) {
  const { error, supabase, user, role } = await requireEmployeeOrAdmin();
  if (error || !supabase || !user) {
    return { error, data: null };
  }

  let query = supabase
    .from("purchase_requisitions")
    .select(
      "id, title, item_name, description, quantity, estimated_budget, category, urgency, status, created_by, created_at",
    )
    .eq("id", id);

  if (role === "employee") {
    query = query.eq("created_by", user.id);
  }

  const { data, error: fetchError } = await query.single();

  if (fetchError || !data) {
    return { error: fetchError?.message ?? "Requisition not found.", data: null };
  }

  return { error: null, data };
}

export async function approveRequisition(id: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("purchase_requisitions")
    .update({ status: "approved" })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message ?? "Unable to approve requisition." };
  }

  revalidatePath("/admin/requisitions");
  revalidatePath(`/admin/requisitions/${id}`);
  return { error: null };
}

export async function rejectRequisition(id: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("purchase_requisitions")
    .update({ status: "rejected" })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message ?? "Unable to reject requisition." };
  }

  revalidatePath("/admin/requisitions");
  revalidatePath(`/admin/requisitions/${id}`);
  return { error: null };
}

type ActionState = { error: string | null };

export async function approveRequisitionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requisitionId = String(formData.get("id") ?? "");
  if (!requisitionId) {
    return { error: "Missing requisition id." };
  }
  const result = await approveRequisition(requisitionId);
  return { error: result.error ?? null };
}

export async function rejectRequisitionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requisitionId = String(formData.get("id") ?? "");
  if (!requisitionId) {
    return { error: "Missing requisition id." };
  }
  const result = await rejectRequisition(requisitionId);
  return { error: result.error ?? null };
}
