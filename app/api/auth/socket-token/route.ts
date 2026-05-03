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
  const apiBaseUrl = getBackendApiBaseUrl();

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing NEXT_PUBLIC_API_BASE_URL in environment.",
      },
      { status: 500 },
    );
  }

  try {
    const backendResponse = await fetch(`${apiBaseUrl}/auth/socket-token`, {
      method: "GET",
      headers: {
        cookie: buildBackendSessionCookieHeader((name) =>
          cookieStore.get(name)?.value ?? null,
        ),
      },
      cache: "no-store",
    });

    const payload = (await backendResponse.json()) as {
      success?: boolean;
      message?: string;
      data?: {
        socketToken?: string;
      };
    };
    const response = NextResponse.json(payload, { status: backendResponse.status });

    writeSessionCookies(response, readBackendSessionCookies(backendResponse.headers));

    if (backendResponse.status === 401) {
      clearSessionCookies(response);
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to issue a realtime session token right now.",
      },
      { status: 503 },
    );
  }
}
