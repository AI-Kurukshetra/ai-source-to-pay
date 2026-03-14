"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import Spinner from "@/components/ui/Spinner";

// Validation schema for the login form.
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<LoginFormValues>>["setError"],
) {
  issues.forEach((issue) => {
    const field = issue.path[0];
    if (field === "email" || field === "password") {
      setError(field, { type: "manual", message: issue.message });
    }
  });
}

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError("root", { message: "" });

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(parsed.error.issues, setError);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error || !data.user) {
      setError("root", {
        message: error?.message ?? "Unable to sign in. Please try again.",
      });
      setLoading(false);
      return;
    }

    let role = data.user.user_metadata?.role as UserRole | undefined;

    if (!role) {
      const { data: updatedUser, error: updateError } =
        await supabase.auth.updateUser({
          data: { role: "supplier" },
        });

      if (updateError) {
        setError("root", {
          message:
            "Signed in, but unable to assign your role. Contact support.",
        });
        setLoading(false);
        return;
      }

      role = (updatedUser.user?.user_metadata?.role as UserRole | undefined) ??
        "supplier";
    }

    router.push(role === "admin" ? "/admin/dashboard" : "/supplier/dashboard");
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#0b1326_0%,_#05070f_50%,_#020305_100%)] px-4 py-16 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-[0_20px_60px_-40px_rgba(56,189,248,0.6)]">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Access your procurement workspace.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              placeholder="you@company.com"
              {...register("email")}
            />
            {errors.email?.message ? (
              <p className="mt-2 text-xs text-rose-400">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password?.message ? (
              <p className="mt-2 text-xs text-rose-400">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {errors.root?.message ? (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {errors.root.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Spinner className="h-4 w-4" /> : null}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
