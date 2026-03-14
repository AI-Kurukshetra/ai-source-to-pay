import { redirect } from "next/navigation";

import LoginForm from "@/app/login/LoginForm";
import { getSession } from "@/lib/auth/getSession";

export default async function LoginPage() {
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

  return <LoginForm />;
}
