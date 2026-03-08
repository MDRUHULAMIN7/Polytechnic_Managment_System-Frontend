import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  readBackendSessionCookies,
  writeSessionCookies,
} from "@/lib/auth/session-cookies";

type LoginRouteResponse = {
  success?: boolean;
  message?: string;
  data?: {
    role?: string;
    needsPasswordChange?: boolean;
  };
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
}

export async function POST(request: Request) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing NEXT_PUBLIC_API_BASE_URL in environment.",
      },
      { status: 500 },
    );
  }

  const body = await request.text();
  const backendResponse = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const payload = (await backendResponse.json()) as LoginRouteResponse;
  const response = NextResponse.json(payload, { status: backendResponse.status });

  clearSessionCookies(response);

  if (backendResponse.ok && payload.success) {
    writeSessionCookies(response, readBackendSessionCookies(backendResponse.headers));
  }

  return response;
}
