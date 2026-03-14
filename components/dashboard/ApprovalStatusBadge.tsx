type ApprovalStatusBadgeProps = {
  status: "pending" | "approved" | "rejected";
};

const statusStyles: Record<ApprovalStatusBadgeProps["status"], string> = {
  pending:
    "border-amber-400/40 bg-amber-400/10 text-amber-200 shadow-[0_0_20px_-14px_rgba(251,191,36,0.8)]",
  approved:
    "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 shadow-[0_0_20px_-14px_rgba(52,211,153,0.8)]",
  rejected:
    "border-rose-400/40 bg-rose-400/10 text-rose-200 shadow-[0_0_20px_-14px_rgba(251,113,133,0.8)]",
};

const statusLabels: Record<ApprovalStatusBadgeProps["status"], string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ApprovalStatusBadge({
  status,
}: ApprovalStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
