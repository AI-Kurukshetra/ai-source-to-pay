"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/ui/Spinner";
import { createRequisition } from "@/lib/actions/requisitionActions";

const requisitionSchema = z.object({
  title: z.string().min(3, "Title is required."),
  item_name: z.string().min(2, "Item name is required."),
  description: z.string().min(10, "Description is required."),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
  estimated_budget: z.coerce.number().nonnegative("Budget must be 0 or more."),
  category: z.string().min(2, "Category is required."),
  urgency: z.enum(["low", "medium", "high"], { message: "Select urgency." }),
});

type RequisitionFormValues = z.infer<typeof requisitionSchema>;

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<RequisitionFormValues>>["setError"],
) {
  issues.forEach((issue) => {
    const field = issue.path[0];
    if (
      field === "title" ||
      field === "item_name" ||
      field === "description" ||
      field === "quantity" ||
      field === "estimated_budget" ||
      field === "category" ||
      field === "urgency"
    ) {
      setError(field, { type: "manual", message: issue.message });
    }
  });
}

export default function RequisitionForm({
  redirectTo = "/admin/requisitions",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RequisitionFormValues>({
    defaultValues: {
      title: "",
      item_name: "",
      description: "",
      quantity: 1,
      estimated_budget: 0,
      category: "",
      urgency: "medium",
    },
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError("root", { message: "" });

    const parsed = requisitionSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(parsed.error.issues, setError);
      setLoading(false);
      return;
    }

    const result = await createRequisition(parsed.data);
    if (result?.error) {
      setError("root", { message: result.error });
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  });

  return (
    <form className="mt-8 space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">Title</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="IT laptops for engineering"
            {...register("title")}
          />
          {errors.title?.message ? (
            <p className="mt-2 text-xs text-rose-400">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">Item name</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="Laptop"
            {...register("item_name")}
          />
          {errors.item_name?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.item_name.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Description</label>
        <textarea
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          placeholder="Business justification, specs, timeline..."
          {...register("description")}
        />
        {errors.description?.message ? (
          <p className="mt-2 text-xs text-rose-400">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-200">Quantity</label>
          <input
            type="number"
            min={1}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            {...register("quantity")}
          />
          {errors.quantity?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.quantity.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">
            Estimated budget
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            {...register("estimated_budget")}
          />
          {errors.estimated_budget?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.estimated_budget.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">Urgency</label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            {...register("urgency")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.urgency?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.urgency.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">Category</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            placeholder="IT / Capex"
            {...register("category")}
          />
          {errors.category?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.category.message}
            </p>
          ) : null}
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
        className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Spinner className="h-4 w-4" /> : null}
        {loading ? "Creating..." : "Create requisition"}
      </button>
    </form>
  );
}
