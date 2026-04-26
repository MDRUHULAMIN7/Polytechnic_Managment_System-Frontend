import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildBackendSessionCookieHeader,
  clearSessionCookies,
  readBackendSessionCookies,
  writeSessionCookies,
} from "@/lib/auth/session-cookies";

function getBackendApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
}

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value ?? null;
  const accessToken = cookieStore.get("pms_access_token")?.value ?? null;
  const apiBaseUrl = getBackendApiBaseUrl();

  if (refreshToken && apiBaseUrl) {
    try {
      const backendResponse = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          cookie: buildBackendSessionCookieHeader((name) =>
            cookieStore.get(name)?.value ?? null,
          ),
        },
        cache: "no-store",
      });

      const session = readBackendSessionCookies(backendResponse.headers);
      if (backendResponse.ok && session.accessToken) {
        const response = NextResponse.json({
          success: true,
          data: { accessToken: session.accessToken },
        });
        writeSessionCookies(response, session);
        return response;
      }

      if (backendResponse.status === 401) {
        const response = NextResponse.json(
          {
            success: false,
            message: "Authentication expired.",
          },
          { status: 401 },
        );
        clearSessionCookies(response);
        return response;
      }
    } catch {
      // Fall back to the current access token when refresh is temporarily unavailable.
    }
  }

  if (accessToken) {
    return NextResponse.json({
      success: true,
      data: { accessToken },
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: "Authentication required.",
    },
    { status: 401 },
  );
}
