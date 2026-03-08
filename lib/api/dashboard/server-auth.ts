import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, authHeaders } from "@/lib/api/dashboard/api";

const FORWARDED_COOKIE_NAMES = [
  ACCESS_TOKEN_COOKIE,
  "refreshToken",
  "pms_role",
];

export async function getServerAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const cookieHeader = FORWARDED_COOKIE_NAMES.map((name) => {
    const value = cookieStore.get(name)?.value;
    return value ? `${name}=${encodeURIComponent(value)}` : null;
  })
    .filter((value): value is string => Boolean(value))
    .join("; ");

  return {
    ...authHeaders(accessToken),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}
