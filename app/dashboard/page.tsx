import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { PrivilegedRole } from "@/lib/constants";

function readRole(value: string | undefined): PrivilegedRole | null {
  if (
    value === "admin" ||
    value === "superAdmin" ||
    value === "instructor" ||
    value === "student"
  ) {
    return value;
  }
  return null;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const role = readRole(cookieStore.get("rms_role")?.value);

  if (!role) {
    redirect("/login");
  }

  return <DashboardOverview role={role} />;
}
