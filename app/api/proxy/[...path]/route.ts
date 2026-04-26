import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  buildBackendSessionCookieHeader,
  clearSessionCookies,
  readBackendSessionCookies,
  writeSessionCookies,
} from "@/lib/auth/session-cookies";

function getBackendApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
}

function buildForwardHeaders(
  request: NextRequest,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const requestId = request.headers.get("x-request-id");
  const accessToken = cookieStore.get("pms_access_token")?.value ?? null;
  const cookieHeader = buildBackendSessionCookieHeader((name) =>
    cookieStore.get(name)?.value ?? null,
  );

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  if (requestId) {
    headers.set("x-request-id", requestId);
  }

  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  return headers;
}

async function handleProxy(
  request: NextRequest,
  pathSegments: string[] | undefined,
) {
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

  const cookieStore = await cookies();
  const path = pathSegments?.join("/") ?? "";
  const search = request.nextUrl.search || "";
  const backendUrl = `${apiBaseUrl}/${path}${search}`;
  const method = request.method;
  const headers = buildForwardHeaders(request, cookieStore);

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const payload = await request.arrayBuffer();
    if (payload.byteLength > 0) {
      body = payload;
    }
  }

  const backendResponse = await fetch(backendUrl, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const responseText = await backendResponse.text();
  const response = new NextResponse(responseText, {
    status: backendResponse.status,
    headers: {
      ...(backendResponse.headers.get("content-type")
        ? { "content-type": backendResponse.headers.get("content-type")! }
        : {}),
      ...(backendResponse.headers.get("x-request-id")
        ? { "x-request-id": backendResponse.headers.get("x-request-id")! }
        : {}),
    },
  });

  writeSessionCookies(response, readBackendSessionCookies(backendResponse.headers));

  if (backendResponse.status === 401) {
    clearSessionCookies(response);
  }

  return response;
}

type ProxyRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(request: NextRequest, context: ProxyRouteContext) {
  const { path } = await context.params;
  return handleProxy(request, path);
}

export async function POST(request: NextRequest, context: ProxyRouteContext) {
  const { path } = await context.params;
  return handleProxy(request, path);
}

export async function PATCH(request: NextRequest, context: ProxyRouteContext) {
  const { path } = await context.params;
  return handleProxy(request, path);
}

export async function PUT(request: NextRequest, context: ProxyRouteContext) {
  const { path } = await context.params;
  return handleProxy(request, path);
}

export async function DELETE(request: NextRequest, context: ProxyRouteContext) {
  const { path } = await context.params;
  return handleProxy(request, path);
}
