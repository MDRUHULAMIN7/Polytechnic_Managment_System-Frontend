import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const role = readRole(cookieStore.get("rms_role")?.value);

  if (!role) {
    redirect("/login");
  }

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
