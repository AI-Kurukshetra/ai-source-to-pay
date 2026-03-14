"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOpenRFQsForSupplier() {
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
    .select("id, approval_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found.", data: null };
  }

  // If not approved, RLS will already block RFQ reads, but we return a friendly message.
  if (supplier.approval_status !== "approved") {
    return {
      error: null,
      data: {
        supplierStatus: supplier.approval_status,
        rfqs: [],
        totalVisible: 0,
        closedCount: 0,
      },
    };
  }

  // Fetch all visible RFQs and filter "open" in code.
  // This avoids subtle DB type/format issues when comparing timestamps server-side.
  const { data: rfqs, error } = await supabase
    .from("rfqs")
    .select("id, title, description, quantity, deadline, created_at")
    .order("deadline", { ascending: true })
    .limit(200);

  if (error) {
    return { error: error.message ?? "Unable to load RFQs.", data: null };
  }

  const now = Date.now();
  const all = rfqs ?? [];
  const open = all.filter((rfq) => {
    const deadlineTime = new Date(rfq.deadline).getTime();
    if (Number.isNaN(deadlineTime)) {
      return true;
    }
    return deadlineTime > now;
  });
  const closedCount = all.length - open.length;

  return {
    error: null,
    data: {
      supplierStatus: supplier.approval_status,
      rfqs: open,
      totalVisible: all.length,
      closedCount,
    },
  };
}

export async function getRFQDetailForSupplier(rfqId: string) {
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
    .select("id, approval_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found.", data: null };
  }

  if (supplier.approval_status !== "approved") {
    return {
      error: "RFQs are visible only after approval.",
      data: null,
    };
  }

  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .select(
      "id, title, description, product_requirements, quantity, deadline, created_at",
    )
    .eq("id", rfqId)
    .single();

  if (rfqError || !rfq) {
    return { error: rfqError?.message ?? "RFQ not found.", data: null };
  }

  const { data: existingResponse } = await supabase
    .from("rfq_responses")
    .select("id, quote_price, message, created_at")
    .eq("rfq_id", rfqId)
    .eq("supplier_id", supplier.id)
    .maybeSingle();

  return {
    error: null,
    data: {
      supplierStatus: supplier.approval_status,
      supplierId: supplier.id,
      rfq,
      existingResponse: existingResponse ?? null,
    },
  };
}

export async function submitRFQResponse(input: {
  rfqId: string;
  quote_price: number;
  message: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to submit a quote." };
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id, approval_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found." };
  }

  if (supplier.approval_status !== "approved") {
    return { error: "Only approved suppliers can submit quotes." };
  }

  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .select("id, deadline")
    .eq("id", input.rfqId)
    .single();

  if (rfqError || !rfq) {
    return { error: rfqError?.message ?? "RFQ not found." };
  }

  if (new Date(rfq.deadline).getTime() <= Date.now()) {
    return { error: "RFQ deadline has passed." };
  }

  const { data: existingResponse } = await supabase
    .from("rfq_responses")
    .select("id")
    .eq("rfq_id", input.rfqId)
    .eq("supplier_id", supplier.id)
    .maybeSingle();

  if (existingResponse?.id) {
    return { error: "You already submitted a quote for this RFQ." };
  }

  const { error: insertError } = await supabase.from("rfq_responses").insert({
    rfq_id: input.rfqId,
    supplier_id: supplier.id,
    quote_price: input.quote_price,
    message: input.message,
  });

  if (insertError) {
    return { error: insertError.message ?? "Unable to submit quote." };
  }

  return { error: null };
}
