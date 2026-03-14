export default function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900 ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}

