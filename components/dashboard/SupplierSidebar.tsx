"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/supplier/dashboard", label: "Dashboard" },
  { href: "/supplier/profile", label: "Profile" },
  { href: "/supplier/documents", label: "Documents" },
  { href: "/supplier/rfqs", label: "RFQs" },
];

export default function SupplierSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="flex h-full flex-col justify-between gap-8 border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-8 text-slate-100">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Supplier Portal
          </p>
          <h2 className="mt-3 text-lg font-semibold">Workspace</h2>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300">
          <p className="font-semibold text-slate-200">Status center</p>
          <p className="mt-2 text-slate-400">
            Track onboarding and RFQ updates in one place.
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 text-sm">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl border px-3 py-2 transition ${
                isActive
                  ? "border-cyan-400/50 bg-slate-900 text-white shadow-[0_0_20px_-12px_rgba(34,211,238,0.8)]"
                  : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300">
          <p className="font-semibold text-slate-200">Need help?</p>
          <p className="mt-2 text-slate-400">
            Email procurement for account support.
          </p>
        </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg border border-slate-700 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-rose-400/60 hover:bg-rose-500/10 hover:text-rose-200"
      >
        Sign out
      </button>
      </div>
    </aside>
  );
}
