type StatusBadgeProps = {
  status: "draft" | "pending" | "approved" | "rejected";
};

const styles: Record<StatusBadgeProps["status"], string> = {
  draft: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  pending:
    "border-amber-400/40 bg-amber-400/10 text-amber-200 shadow-[0_0_20px_-14px_rgba(251,191,36,0.8)]",
  approved:
    "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 shadow-[0_0_20px_-14px_rgba(52,211,153,0.8)]",
  rejected:
    "border-rose-400/40 bg-rose-400/10 text-rose-200 shadow-[0_0_20px_-14px_rgba(251,113,133,0.8)]",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

