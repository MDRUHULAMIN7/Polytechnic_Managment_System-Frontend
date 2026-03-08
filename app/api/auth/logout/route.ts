import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookies } from "@/lib/auth/session-cookies";

type LogoutRouteResponse = {
  success?: boolean;
  message?: string;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
}

function buildBackendCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return ["pms_access_token", "pms_role", "refreshToken"]
    .map((name) => {
      const value = cookieStore.get(name)?.value;
      return value ? `${name}=${encodeURIComponent(value)}` : null;
    })
    .filter((value): value is string => Boolean(value))
    .join("; ");
}

export async function POST() {
  const cookieStore = await cookies();
  const apiBaseUrl = getApiBaseUrl();

  let payload: LogoutRouteResponse = {
    success: true,
    message: "User is logged out successfully!",
  };
  let status = 200;

  if (apiBaseUrl) {
    try {
      const backendResponse = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          ...(buildBackendCookieHeader(cookieStore)
            ? { Cookie: buildBackendCookieHeader(cookieStore) }
            : {}),
        },
        cache: "no-store",
      });

      status = backendResponse.status;
      payload = (await backendResponse.json()) as LogoutRouteResponse;
    } catch {
      payload = {
        success: true,
        message: "User is logged out locally.",
      };
      status = 200;
    }
  }

  const response = NextResponse.json(payload, { status });
  clearSessionCookies(response);
  return response;
}
