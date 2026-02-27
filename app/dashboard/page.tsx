import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("pms_role")?.value;

  if (role === "student") {
    redirect("/dashboard/student");
  }

  if (role === "instructor") {
    redirect("/dashboard/instructor");
  }

  if (role === "admin" || role === "superAdmin") {
    redirect("/dashboard/admin");
  }

  redirect("/login");
}
