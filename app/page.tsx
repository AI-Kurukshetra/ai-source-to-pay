import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/getSession";

export default async function Home() {
  const { session, role } = await getSession();

  if (session && role) {
    const destination =
      role === "admin" ? "/admin/dashboard" : "/supplier/dashboard";
    redirect(destination);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_55%,_#020305_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 lg:px-10">
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

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                AI-Powered Source-to-Pay Procurement Platform
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Streamline supplier self-registration, document compliance, and RFQ
                sourcing in a single workspace built for procurement teams.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Start supplier registration
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_25px_70px_-40px_rgba(56,189,248,0.7)]">
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Live workflow
                </div>
                <div className="space-y-3">
                  {[
                    "Supplier onboarding submissions",
                    "Compliance document review",
                    "RFQ event creation",
                    "Quote comparison dashboard",
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
              title: "Supplier self-registration",
              description:
                "Collect company data, tax IDs, product categories, and bank details in one guided workflow.",
            },
            {
              title: "Approval & compliance",
              description:
                "Review documents, approve suppliers, and keep an auditable trail for every decision.",
            },
            {
              title: "RFQ sourcing",
              description:
                "Create RFQs, collect responses, and compare quotes without switching tools.",
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
                Ready to onboard suppliers?
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Start supplier registration to begin the approval process and
                gain access to RFQ sourcing events.
              </p>
            </div>
            <Link
              href="/register"
              className="rounded-lg bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Register supplier
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
