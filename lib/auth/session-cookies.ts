import type { NextResponse } from "next/server";

export const SESSION_COOKIE_NAMES = [
  "pms_access_token",
  "pms_role",
  "refreshToken",
] as const;

export const FORWARDED_SESSION_COOKIE_NAMES = SESSION_COOKIE_NAMES;

type SessionCookieName = (typeof SESSION_COOKIE_NAMES)[number];

type SessionCookies = {
  accessToken?: string | null;
  role?: string | null;
  refreshToken?: string | null;
};

const secure = process.env.NODE_ENV === "production";

function splitSetCookieHeader(header: string | null) {
  if (!header) {
    return [];
  }

  return header.split(/,(?=\s*[^;,\s]+=)/);
}

function getSetCookieHeaders(headers: Headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  return splitSetCookieHeader(headers.get("set-cookie"));
}

function extractCookieValue(headers: Headers, name: SessionCookieName) {
  const prefix = `${name}=`;

  for (const entry of getSetCookieHeaders(headers)) {
    const trimmed = entry.trim();
    if (!trimmed.startsWith(prefix)) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(";");
    const rawValue =
      separatorIndex === -1
        ? trimmed.slice(prefix.length)
        : trimmed.slice(prefix.length, separatorIndex);

    return decodeURIComponent(rawValue);
  }

  return null;
}

export function readBackendSessionCookies(headers: Headers): SessionCookies {
  return {
    accessToken: extractCookieValue(headers, "pms_access_token"),
    role: extractCookieValue(headers, "pms_role"),
    refreshToken: extractCookieValue(headers, "refreshToken"),
  };
}

export function writeSessionCookies(
  response: NextResponse,
  session: SessionCookies,
) {
  if (session.accessToken) {
    response.cookies.set({
      name: "pms_access_token",
      value: session.accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
    });
  }

  if (session.role) {
    response.cookies.set({
      name: "pms_role",
      value: session.role,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
    });
  }

  if (session.refreshToken) {
    response.cookies.set({
      name: "refreshToken",
      value: session.refreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
    });
  }
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  }
}

export function buildBackendSessionCookieHeader(
  readCookie: (name: SessionCookieName) => string | null | undefined,
) {
  return FORWARDED_SESSION_COOKIE_NAMES.map((name) => {
    const value = readCookie(name);
    return value ? `${name}=${encodeURIComponent(value)}` : null;
  })
    .filter((value): value is string => Boolean(value))
    .join("; ");
}
