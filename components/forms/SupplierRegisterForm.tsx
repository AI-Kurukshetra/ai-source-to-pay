"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createSupplierProfile } from "@/lib/actions/supplierActions";
import Spinner from "@/components/ui/Spinner";

// Validation schema for supplier registration details.
const supplierRegisterSchema = z.object({
  company_name: z.string().min(2, "Company name is required."),
  contact_person: z.string().min(2, "Contact person is required."),
  phone: z.string().min(7, "Phone number is required."),
  address: z.string().min(5, "Address is required."),
  gst_number: z.string().min(5, "GST / Tax ID is required."),
  business_type: z.string().min(2, "Business type is required."),
  product_categories: z
    .string()
    .min(2, "Add at least one product category."),
  bank_account_name: z.string().min(2, "Account name is required."),
  bank_account_number: z.string().min(6, "Account number is required."),
  bank_ifsc: z.string().min(4, "IFSC / routing code is required."),
  bank_name: z.string().min(2, "Bank name is required."),
});

type SupplierRegisterFormValues = z.infer<typeof supplierRegisterSchema>;

function parseCategories(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<SupplierRegisterFormValues>>["setError"],
) {
  issues.forEach((issue) => {
    const field = issue.path[0];
    if (
      field === "company_name" ||
      field === "contact_person" ||
      field === "phone" ||
      field === "address" ||
      field === "gst_number" ||
      field === "business_type" ||
      field === "product_categories"
    ) {
      setError(field, { type: "manual", message: issue.message });
    }
  });
}

export default function SupplierRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SupplierRegisterFormValues>({
    defaultValues: {
      company_name: "",
      contact_person: "",
      phone: "",
      address: "",
      gst_number: "",
      business_type: "",
      product_categories: "",
      bank_account_name: "",
      bank_account_number: "",
      bank_ifsc: "",
      bank_name: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError("root", { message: "" });

    const parsed = supplierRegisterSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(parsed.error.issues, setError);
      setLoading(false);
      return;
    }

    const categories = parseCategories(parsed.data.product_categories);
    if (categories.length === 0) {
      setError("product_categories", {
        type: "manual",
        message: "Add at least one product category.",
      });
      setLoading(false);
      return;
    }

    const result = await createSupplierProfile({
      company_name: parsed.data.company_name,
      contact_person: parsed.data.contact_person,
      phone: parsed.data.phone,
      address: parsed.data.address,
      gst_number: parsed.data.gst_number,
      business_type: parsed.data.business_type,
      product_categories: categories,
      bank_details: {
        account_name: parsed.data.bank_account_name,
        account_number: parsed.data.bank_account_number,
        ifsc: parsed.data.bank_ifsc,
        bank_name: parsed.data.bank_name,
      },
    });

    if (result?.error) {
      setError("root", { message: result.error });
      setLoading(false);
      return;
    }

    router.push("/supplier/dashboard");
  });

  return (
    <form className="mt-8 space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">
            Company name
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="Acme Manufacturing Pvt Ltd"
            {...register("company_name")}
          />
          {errors.company_name?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.company_name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">
            Contact person
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="Anita Sharma"
            {...register("contact_person")}
          />
          {errors.contact_person?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.contact_person.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">Phone</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="+91 90000 00000"
            {...register("phone")}
          />
          {errors.phone?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">
            GST / Tax ID
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="29ABCDE1234F2Z5"
            {...register("gst_number")}
          />
          {errors.gst_number?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.gst_number.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Company address
        </label>
        <textarea
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          placeholder="Street, city, state, postal code"
          {...register("address")}
        />
        {errors.address?.message ? (
          <p className="mt-2 text-xs text-rose-400">{errors.address.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">
            Business type
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="Manufacturer / Distributor"
            {...register("business_type")}
          />
          {errors.business_type?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.business_type.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">
            Product categories
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="Steel, Fasteners, Packaging"
            {...register("product_categories")}
          />
          {errors.product_categories?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.product_categories.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <h3 className="text-sm font-semibold text-slate-200">Bank details</h3>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-200">
              Account name
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              placeholder="Company current account"
              {...register("bank_account_name")}
            />
            {errors.bank_account_name?.message ? (
              <p className="mt-2 text-xs text-rose-400">
                {errors.bank_account_name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              Account number
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              placeholder="000123456789"
              {...register("bank_account_number")}
            />
            {errors.bank_account_number?.message ? (
              <p className="mt-2 text-xs text-rose-400">
                {errors.bank_account_number.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              IFSC / Routing code
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              placeholder="HDFC0001234"
              {...register("bank_ifsc")}
            />
            {errors.bank_ifsc?.message ? (
              <p className="mt-2 text-xs text-rose-400">
                {errors.bank_ifsc.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              Bank name
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              placeholder="HDFC Bank"
              {...register("bank_name")}
            />
            {errors.bank_name?.message ? (
              <p className="mt-2 text-xs text-rose-400">
                {errors.bank_name.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {errors.root?.message ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errors.root.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Spinner className="h-4 w-4 border-slate-950/20 border-t-slate-950" />
        ) : null}
        {loading ? "Submitting..." : "Submit registration"}
      </button>
    </form>
  );
}
