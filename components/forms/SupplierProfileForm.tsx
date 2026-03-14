"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/ui/Spinner";
import { updateSupplierProfile } from "@/lib/actions/supplierActions";

const supplierProfileSchema = z.object({
  company_name: z.string().min(2, "Company name is required."),
  contact_person: z.string().min(2, "Contact person is required."),
  phone: z.string().min(7, "Phone number is required."),
  address: z.string().min(5, "Address is required."),
  gst_number: z.string().min(5, "GST / Tax ID is required."),
  business_type: z.string().min(2, "Business type is required."),
  product_categories: z.string().min(2, "Add at least one product category."),
});

type SupplierProfileFormValues = z.infer<typeof supplierProfileSchema>;

function parseCategories(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<SupplierProfileFormValues>>["setError"],
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

export default function SupplierProfileForm({
  initialValues,
}: {
  initialValues: {
    company_name: string;
    contact_person: string;
    phone: string;
    address: string;
    gst_number: string;
    business_type: string;
    product_categories: string[];
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const defaultValues = useMemo(
    () => ({
      company_name: initialValues.company_name,
      contact_person: initialValues.contact_person,
      phone: initialValues.phone,
      address: initialValues.address,
      gst_number: initialValues.gst_number,
      business_type: initialValues.business_type,
      product_categories: initialValues.product_categories.join(", "),
    }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<SupplierProfileFormValues>({
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setSaved(false);
    setError("root", { message: "" });

    const parsed = supplierProfileSchema.safeParse(values);
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

    const result = await updateSupplierProfile({
      company_name: parsed.data.company_name,
      contact_person: parsed.data.contact_person,
      phone: parsed.data.phone,
      address: parsed.data.address,
      gst_number: parsed.data.gst_number,
      business_type: parsed.data.business_type,
      product_categories: categories,
    });

    if (result?.error) {
      setError("root", { message: result.error });
      setLoading(false);
      return;
    }

    setSaved(true);
    reset(values);
    setLoading(false);
    router.refresh();
  });

  return (
    <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-200">Company name</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          {...register("company_name")}
        />
        {errors.company_name?.message ? (
          <p className="mt-2 text-xs text-rose-400">{errors.company_name.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Contact person</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          {...register("contact_person")}
        />
        {errors.contact_person?.message ? (
          <p className="mt-2 text-xs text-rose-400">
            {errors.contact_person.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Phone</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          {...register("phone")}
        />
        {errors.phone?.message ? (
          <p className="mt-2 text-xs text-rose-400">{errors.phone.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">GST / Tax ID</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          {...register("gst_number")}
        />
        {errors.gst_number?.message ? (
          <p className="mt-2 text-xs text-rose-400">{errors.gst_number.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Business type</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
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
          {...register("product_categories")}
        />
        {errors.product_categories?.message ? (
          <p className="mt-2 text-xs text-rose-400">
            {errors.product_categories.message}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-slate-200">Address</label>
        <textarea
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          {...register("address")}
        />
        {errors.address?.message ? (
          <p className="mt-2 text-xs text-rose-400">{errors.address.message}</p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <p className="md:col-span-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errors.root.message}
        </p>
      ) : null}

      {saved ? (
        <p className="md:col-span-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          Saved.
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
