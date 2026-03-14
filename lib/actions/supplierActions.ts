"use server";

import { createClient } from "@/lib/supabase/server";

type SupplierProfileInput = {
  company_name: string;
  contact_person: string;
  phone: string;
  address: string;
  gst_number: string;
  business_type: string;
  product_categories: string[];
  bank_details: {
    account_name: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
  };
};

export async function createSupplierProfile(input: SupplierProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to submit this form." };
  }

  const email = user.email;
  if (!email) {
    return { error: "No email found for the current user." };
  }

  const { data: existingProfile } = await supabase
    .from("suppliers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile?.id) {
    return { error: "Supplier profile already exists for this account." };
  }

  const { error } = await supabase.from("suppliers").insert({
    user_id: user.id,
    email,
    company_name: input.company_name,
    contact_person: input.contact_person,
    phone: input.phone,
    address: input.address,
    gst_number: input.gst_number,
    business_type: input.business_type,
    product_categories: input.product_categories,
    bank_details: input.bank_details,
    approval_status: "pending",
  });

  if (error) {
    return {
      error: error.message ?? "Unable to submit supplier profile.",
    };
  }

  return { error: null };
}

export async function getSupplierDashboardData() {
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
    .select(
      "id, company_name, contact_person, phone, address, gst_number, business_type, product_categories, approval_status, created_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (supplierError || !supplier) {
    return { error: "Supplier profile not found.", data: null };
  }

  const [{ count: documentCount }, { count: openRfqCount }] = await Promise.all(
    [
      supabase
        .from("supplier_documents")
        .select("id", { count: "exact", head: true })
        .eq("supplier_id", supplier.id),
      supabase
        .from("rfqs")
        .select("id", { count: "exact", head: true }),
    ],
  );

  return {
    error: null,
    data: {
      supplier,
      documentCount: documentCount ?? 0,
      openRfqCount: openRfqCount ?? 0,
    },
  };
}

export async function getSupplierProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in.", data: null };
  }

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .select(
      "id, company_name, contact_person, phone, address, gst_number, business_type, product_categories, approval_status, created_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !supplier) {
    return { error: "Supplier profile not found.", data: null };
  }

  return { error: null, data: supplier };
}

export async function updateSupplierProfile(
  input: Omit<
    SupplierProfileInput,
    "bank_details"
  >,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("suppliers")
    .update({
      company_name: input.company_name,
      contact_person: input.contact_person,
      phone: input.phone,
      address: input.address,
      gst_number: input.gst_number,
      business_type: input.business_type,
      product_categories: input.product_categories,
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message ?? "Unable to update supplier profile." };
  }

  return { error: null };
}
