import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

async function handleProxyRequest(request: NextRequest, path: string[]) {
  const token = request.cookies.get("rms_access_token")?.value;

  const backendPath = "/" + path.join("/");
  const search = request.nextUrl.search;
  const backendUrl = `${BACKEND_URL}${backendPath}${search}`;

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", token);
  }

  const contentType = request.headers.get("content-type");
  const isMultipart = contentType?.includes("multipart/form-data");

  // For non-multipart: read body as text and set Content-Type
  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (isMultipart) {
      body = await request.formData();
    } else {
      const text = await request.text();
      if (text) {
        body = text;
        headers.set("Content-Type", "application/json");
      }
    }
  }

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseBody = await backendResponse.text();

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}
