import { redirect } from "next/navigation";

import RegisterForm from "@/app/register/RegisterForm";
import { getSession } from "@/lib/auth/getSession";

export default async function RegisterPage() {
  const { session, role } = await getSession();

  if (session && role) {
    const destination =
      role === "admin" ? "/admin/dashboard" : "/supplier/dashboard";
    redirect(destination);
  }

  return <RegisterForm />;
}
