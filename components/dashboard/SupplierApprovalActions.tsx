"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  approveSupplierAction,
  rejectSupplierAction,
} from "@/lib/actions/adminActions";
import Spinner from "@/components/ui/Spinner";

function SubmitButton({
  variant,
  children,
}: {
  variant: "approve" | "reject";
  children: string;
}) {
  const { pending } = useFormStatus();

  if (variant === "approve") {
    return (
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <Spinner className="h-4 w-4 border-slate-950/20 border-t-slate-950" />
        ) : null}
        {pending ? "Approving..." : children}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Spinner className="h-4 w-4 border-rose-200/30 border-t-rose-200" /> : null}
      {pending ? "Rejecting..." : children}
    </button>
  );
}

export default function SupplierApprovalActions({
  supplierId,
  approvalStatus,
}: {
  supplierId: string;
  approvalStatus: "pending" | "approved" | "rejected";
}) {
  const [approveState, approveFormAction] = useActionState(approveSupplierAction, {
    error: null,
  });
  const [rejectState, rejectFormAction] = useActionState(rejectSupplierAction, {
    error: null,
  });

  const errorMessage = approveState.error ?? rejectState.error;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <form action={approveFormAction}>
          <input type="hidden" name="supplierId" value={supplierId} />
          <SubmitButton variant="approve">
            {approvalStatus === "approved" ? "Approved" : "Approve"}
          </SubmitButton>
        </form>
        <form action={rejectFormAction}>
          <input type="hidden" name="supplierId" value={supplierId} />
          <SubmitButton variant="reject">
            {approvalStatus === "rejected" ? "Rejected" : "Reject"}
          </SubmitButton>
        </form>
      </div>
      {errorMessage ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errorMessage}
        </p>
      ) : null}
      <p className="text-xs text-slate-500">
        Current status: <span className="text-slate-300">{approvalStatus}</span>
      </p>
    </div>
  );
}
