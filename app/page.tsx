import { redirect } from "next/navigation";

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

  redirect("/login");
}
