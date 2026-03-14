import SupplierRegisterForm from "@/components/forms/SupplierRegisterForm";

export default function SupplierRegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.6)]">
          <h1 className="text-2xl font-semibold">
            Supplier self-registration
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Tell us about your company to begin the approval process.
          </p>
          <SupplierRegisterForm />
        </div>
      </div>
    </main>
  );
}
