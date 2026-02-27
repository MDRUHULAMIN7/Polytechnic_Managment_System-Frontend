import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard/sidebar/dashboard-shell";

type DashboardRole = "admin" | "superAdmin" | "instructor" | "student";

function parseRole(value: string | undefined): DashboardRole | undefined {
  if (
    value === "admin" ||
    value === "superAdmin" ||
    value === "instructor" ||
    value === "student"
  ) {
    return value;
  }

  return undefined;
}

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const role = parseRole(cookieStore.get("pms_role")?.value);

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
