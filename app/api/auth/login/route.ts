import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

type JwtPayload = {
  role?: string;
  userId?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw.padEnd(raw.length + ((4 - (raw.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8")) as JwtPayload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await backendResponse.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      data?: { accessToken?: string; needsPasswordChange?: boolean };
      errorSources?: Array<{ message?: string }>;
    } | null;

    if (!backendResponse.ok || !json?.success) {
      const firstError = json?.errorSources?.find((s) => s.message)?.message;
      const message = firstError ?? json?.message ?? "Login failed.";
      return NextResponse.json({ success: false, message }, { status: backendResponse.status });
    }

    const accessToken = json.data?.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Login response did not include an access token." },
        { status: 500 },
      );
    }

    const payload = decodeJwtPayload(accessToken);
    const role = payload?.role ?? "";
    const userId = payload?.userId ?? "";

    // Calculate expiry from JWT exp claim, default 24h
    const maxAge = payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : 86400;

    const response = NextResponse.json({
      success: true,
      message: json.message ?? "Login successful.",
      data: {
        role,
        userId,
        needsPasswordChange: json.data?.needsPasswordChange ?? false,
      },
    });

    // Set httpOnly cookies — not readable by client-side JS (XSS-safe)
    response.cookies.set("rms_access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // rms_role is also set as httpOnly now (middleware reads it from request cookies, which works)
    response.cookies.set("rms_role", role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
