import type { PrivilegedRole } from "@/lib/constants";

type SessionData = {
  role: PrivilegedRole;
  userId: string;
};

// Keys for non-sensitive session UI data only — the access token is NEVER stored here
const ROLE_KEY = "rms_role";
const USER_ID_KEY = "rms_user_id";

function inBrowser() {
  return typeof window !== "undefined";
}

/**
 * Persists only non-sensitive UI data (role, userId) to localStorage.
 * The access token is stored exclusively as an httpOnly cookie
 * set by the /api/auth/login server route — never accessible to client JS.
 */
export function persistSession(data: SessionData) {
  if (!inBrowser()) return;
  localStorage.setItem(ROLE_KEY, data.role);
  localStorage.setItem(USER_ID_KEY, data.userId);
}

/**
 * Clears localStorage UI data and calls the logout API route to clear httpOnly cookies.
 */
export async function clearSession() {
  if (!inBrowser()) return;
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);

  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
}

export function readSessionRole(): PrivilegedRole | null {
  if (!inBrowser()) return null;
  const role = localStorage.getItem(ROLE_KEY);
  if (
    role === "admin" ||
    role === "superAdmin" ||
    role === "instructor" ||
    role === "student"
  ) {
    return role;
  }
  return null;
}

export function readSessionUserId(): string | null {
  if (!inBrowser()) return null;
  return localStorage.getItem(USER_ID_KEY);
}
