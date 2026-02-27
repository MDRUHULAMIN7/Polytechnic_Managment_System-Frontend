import type { AuthRole, AuthTokenPayload } from "@/lib/type/auth/login";

function isAuthRole(role: unknown): role is AuthRole {
  return (
    role === "admin" ||
    role === "superAdmin" ||
    role === "instructor" ||
    role === "student"
  );
}

export function parseTokenRole(token: string): AuthRole | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(atob(padded)) as AuthTokenPayload;

    return isAuthRole(decodedPayload.role) ? decodedPayload.role : null;
  } catch {
    return null;
  }
}

export function dashboardPathByRole(role: AuthRole): string {
  if (role === "student") {
    return "/dashboard/student";
  }

  if (role === "instructor") {
    return "/dashboard/instructor";
  }

  if (role === "admin" || role === "superAdmin") {
    return "/dashboard/admin";
  }

  return "/dashboard";
}
