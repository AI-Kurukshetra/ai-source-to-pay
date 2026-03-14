"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createRFQ } from "@/lib/actions/rfqActions";
import Spinner from "@/components/ui/Spinner";

const rfqSchema = z.object({
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  product_requirements: z.string().min(5, "Product requirements are required."),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
  deadline: z.string().min(1, "Deadline is required."),
});

type RFQFormValues = z.infer<typeof rfqSchema>;

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<RFQFormValues>>["setError"],
) {
  issues.forEach((issue) => {
    const field = issue.path[0];
    if (
      field === "title" ||
      field === "description" ||
      field === "product_requirements" ||
      field === "quantity" ||
      field === "deadline"
    ) {
      setError(field, { type: "manual", message: issue.message });
    }
  });
}

export default function RFQForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RFQFormValues>({
    defaultValues: {
      title: "",
      description: "",
      product_requirements: "",
      quantity: 1,
      deadline: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError("root", { message: "" });

    const parsed = rfqSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(parsed.error.issues, setError);
      setLoading(false);
      return;
    }

    // Normalize deadline into ISO.
    const deadlineIso = new Date(parsed.data.deadline).toISOString();

    const result = await createRFQ({
      title: parsed.data.title,
      description: parsed.data.description,
      product_requirements: parsed.data.product_requirements,
      quantity: parsed.data.quantity,
      deadline: deadlineIso,
    });

    if (result?.error) {
      setError("root", { message: result.error });
      setLoading(false);
      return;
    }

    router.push("/admin/rfqs");
  });

  return (
    <form className="mt-8 space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-200">Title</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          placeholder="Steel fasteners procurement"
          {...register("title")}
        />
        {errors.title?.message ? (
          <p className="mt-2 text-xs text-rose-400">{errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Description
        </label>
        <textarea
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          placeholder="Describe the sourcing event and evaluation criteria."
          {...register("description")}
        />
        {errors.description?.message ? (
          <p className="mt-2 text-xs text-rose-400">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Product requirements
        </label>
        <textarea
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
          placeholder="Specifications, grade, packaging, delivery terms."
          {...register("product_requirements")}
        />
        {errors.product_requirements?.message ? (
          <p className="mt-2 text-xs text-rose-400">
            {errors.product_requirements.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
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
          <label className="text-sm font-medium text-slate-200">Deadline</label>
          <input
            type="datetime-local"
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            {...register("deadline")}
          />
          {errors.deadline?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.deadline.message}
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
        {loading ? "Creating..." : "Create RFQ"}
      </button>
    </form>
  );
}
