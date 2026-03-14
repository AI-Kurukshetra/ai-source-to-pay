import { redirect } from "next/navigation";
import Link from "next/link";

import { getSession } from "@/lib/auth/getSession";

export default async function Home() {
  const { session, role } = await getSession();

  if (session && role) {
    const destination =
      role === "admin"
        ? "/admin/dashboard"
        : role === "employee"
          ? "/employee/requisitions"
          : "/supplier/dashboard";
    redirect(destination);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-16 lg:px-10">
        <header className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
              AI-Powered Source-to-Pay Procurement Platform
            </div>
            <Link
              href="/login"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400"
            >
              Sign in
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Supplier onboarding and RFQs, streamlined.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Register suppliers, collect compliance documents, approve
                onboarding, publish RFQs, and capture quotes in one workflow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Supplier sign up
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-xs text-slate-500">
                Internal employees and admins sign in with provided accounts.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_25px_70px_-40px_rgba(56,189,248,0.7)]">
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  What you can do
                </div>
                <div className="grid gap-3">
                  {[
                    "Supplier self-registration and approval",
                    "Secure compliance document uploads",
                    "RFQ creation and quote submission",
                    "Purchase requisitions and approvals",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Onboard suppliers",
              description:
                "Collect company details, tax IDs, categories, and bank details in a guided flow.",
            },
            {
              title: "Approve and comply",
              description:
                "Review submissions, verify documents, and approve suppliers with a clear status trail.",
            },
            {
              title: "Source with RFQs",
              description:
                "Create RFQs, invite suppliers, and compare quotes and messages in one place.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-100">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Ready to register as a supplier?
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Create your supplier account and submit your company details to
                start the approval process.
              </p>
            </div>
            <Link
              href="/register"
              className="rounded-lg bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Create supplier account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
