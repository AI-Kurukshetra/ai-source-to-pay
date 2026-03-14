"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import Spinner from "@/components/ui/Spinner";
import {
  approveRequisitionAction,
  rejectRequisitionAction,
} from "@/lib/actions/requisitionActions";

function SubmitButton({
  variant,
  children,
}: {
  variant: "approve" | "reject";
  children: string;
}) {
  const { pending } = useFormStatus();
  const base = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  if (variant === "approve") {
    return (
      <button
        type="submit"
        disabled={pending}
        className={`${base} bg-emerald-400 text-slate-950 hover:bg-emerald-300`}
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
      className={`${base} border border-rose-500/40 text-rose-200 hover:border-rose-400 hover:bg-rose-500/10`}
    >
      {pending ? (
        <Spinner className="h-4 w-4 border-rose-200/30 border-t-rose-200" />
      ) : null}
      {pending ? "Rejecting..." : children}
    </button>
  );
}

export default function RequisitionDecisionActions({
  requisitionId,
  status,
}: {
  requisitionId: string;
  status: "draft" | "pending" | "approved" | "rejected";
}) {
  const [approveState, approveFormAction] = useActionState(
    approveRequisitionAction,
    { error: null },
  );
  const [rejectState, rejectFormAction] = useActionState(
    rejectRequisitionAction,
    { error: null },
  );
  const errorMessage = approveState.error ?? rejectState.error;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {status !== "approved" ? (
          <form action={approveFormAction}>
            <input type="hidden" name="id" value={requisitionId} />
            <SubmitButton variant="approve">
              Approve
            </SubmitButton>
          </form>
        ) : null}
        {status !== "approved" ? (
          <form action={rejectFormAction}>
            <input type="hidden" name="id" value={requisitionId} />
            <SubmitButton variant="reject">
              {status === "rejected" ? "Rejected" : "Reject"}
            </SubmitButton>
          </form>
        ) : null}
      </div>
      {errorMessage ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
