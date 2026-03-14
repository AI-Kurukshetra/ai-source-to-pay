"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type RfqInput = {
  title: string;
  description: string;
  product_requirements: string;
  quantity: number;
  deadline: string; // ISO string
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

export async function createRFQ(input: RfqInput) {
  const { error, supabase, user } = await requireAdmin();
  if (error || !supabase || !user) {
    return { error };
  }

  const { error: insertError } = await supabase.from("rfqs").insert({
    title: input.title,
    description: input.description,
    product_requirements: input.product_requirements,
    quantity: input.quantity,
    deadline: input.deadline,
    created_by: user.id,
  });

  if (insertError) {
    return { error: insertError.message ?? "Unable to create RFQ." };
  }

  revalidatePath("/admin/rfqs");
  revalidatePath("/admin/dashboard");
  return { error: null };
}

export async function getRFQs() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error, data: null };
  }

  const { data, error: fetchError } = await supabase
    .from("rfqs")
    .select(
      "id, title, description, quantity, deadline, created_at, rfq_responses(count)",
    )
    .order("created_at", { ascending: false });

  if (fetchError) {
    return { error: fetchError.message ?? "Unable to load RFQs.", data: null };
  }

  const normalized =
    (data ?? []).map((rfq: any) => {
      const countEntry = Array.isArray(rfq.rfq_responses)
        ? rfq.rfq_responses[0]
        : null;
      const responseCount =
        typeof countEntry?.count === "number" ? countEntry.count : 0;
      return { ...rfq, responseCount };
    }) ?? [];

  return { error: null, data: normalized };
}

export async function getRFQById(id: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error, data: null };
  }

  const { data, error: fetchError } = await supabase
    .from("rfqs")
    .select(
      "id, title, description, product_requirements, quantity, deadline, created_at",
    )
    .eq("id", id)
    .single();

  if (fetchError || !data) {
    return { error: fetchError?.message ?? "RFQ not found.", data: null };
  }

  return { error: null, data };
}

export async function getRFQResponses(rfqId: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) {
    return { error, data: null };
  }

  const { data, error: fetchError } = await supabase
    .from("rfq_responses")
    .select(
      "id, quote_price, message, created_at, suppliers(company_name, contact_person)",
    )
    .eq("rfq_id", rfqId)
    .order("created_at", { ascending: false });

  if (fetchError) {
    return {
      error: fetchError.message ?? "Unable to load RFQ responses.",
      data: null,
    };
  }

  return { error: null, data: data ?? [] };
}

