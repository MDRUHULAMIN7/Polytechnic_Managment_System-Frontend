import { cookies } from "next/headers";
import { PublicNavbar, type DashboardRole } from "./public-navbar";

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

export async function PublicNavbarServer() {
  const cookieStore = await cookies();
  const role = parseRole(cookieStore.get("pms_role")?.value);

  return <PublicNavbar initialRole={role} />;
}
