export type AppRole = "admin" | "superAdmin" | "student" | "instructor" | string;

type JwtPayload = {
  exp?: number;
  iat?: number;
  role?: AppRole;
  userId?: string;
};

function decodeBase64(value: string): string {
  if (typeof atob === "function") {
    return atob(value);
  }

  return Buffer.from(value, "base64").toString("utf-8");
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    return JSON.parse(decodeBase64(normalized)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isPrivilegedRole(
  role: string | undefined | null,
): role is "admin" | "superAdmin" | "instructor" | "student" {
  return (
    role === "admin" ||
    role === "superAdmin" ||
    role === "instructor" ||
    role === "student"
  );
}
