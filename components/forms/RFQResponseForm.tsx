"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitRFQResponse } from "@/lib/actions/rfqResponseActions";
import Spinner from "@/components/ui/Spinner";

const responseSchema = z.object({
  quote_price: z.coerce
    .number()
    .positive("Quote price must be greater than 0."),
  message: z.string().min(5, "Message is required."),
});

type RFQResponseFormValues = z.infer<typeof responseSchema>;

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<RFQResponseFormValues>>["setError"],
) {
  issues.forEach((issue) => {
    const field = issue.path[0];
    if (field === "quote_price" || field === "message") {
      setError(field, { type: "manual", message: issue.message });
    }
  });
}

export default function RFQResponseForm({
  rfqId,
  supplierStatus,
  existingResponse,
}: {
  rfqId: string;
  supplierStatus: "pending" | "approved" | "rejected";
  existingResponse: {
    id: string;
    quote_price: number;
    message: string;
    created_at: string;
  } | null;
}) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(existingResponse);
  const disabled = supplierStatus !== "approved" || Boolean(submitted);

  const defaultValues = useMemo(
    () => ({
      quote_price: submitted?.quote_price ?? 0,
      message: submitted?.message ?? "",
    }),
    [submitted],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RFQResponseFormValues>({
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError("root", { message: "" });

    const parsed = responseSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(parsed.error.issues, setError);
      setLoading(false);
      return;
    }

    const result = await submitRFQResponse({
      rfqId,
      quote_price: parsed.data.quote_price,
      message: parsed.data.message,
    });

    if (result?.error) {
      setError("root", { message: result.error });
      setLoading(false);
      return;
    }

    setSubmitted({
      id: "submitted",
      quote_price: parsed.data.quote_price,
      message: parsed.data.message,
      created_at: new Date().toISOString(),
    });
    setLoading(false);
  });

  return (
    <form className="mt-6 space-y-5" onSubmit={onSubmit}>
      {supplierStatus !== "approved" ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Quote submission is available only after approval.
        </p>
      ) : null}

      {submitted ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Quote submitted.
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">
            Quote price
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            disabled={disabled}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:opacity-60"
            {...register("quote_price")}
          />
          {errors.quote_price?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.quote_price.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">Message</label>
          <textarea
            rows={4}
            disabled={disabled}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:opacity-60"
            placeholder="Delivery terms, lead time, comments..."
            {...register("message")}
          />
          {errors.message?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.message.message}
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
        disabled={disabled || loading}
        className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Spinner className="h-4 w-4 border-slate-950/20 border-t-slate-950" />
        ) : null}
        {loading ? "Submitting..." : submitted ? "Submitted" : "Submit quote"}
      </button>
    </form>
  );
}
