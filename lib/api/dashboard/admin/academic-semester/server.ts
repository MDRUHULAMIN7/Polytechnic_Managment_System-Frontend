import { cookies } from "next/headers";
import type {
  AcademicSemester,
  AcademicSemesterInput,
  AcademicSemesterListParams,
  AcademicSemesterListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-semester";
import { buildAcademicSemesterQuery } from "@/utils/dashboard/admin/academic-semester/query";
import {
  ACADEMIC_SEMESTERS_TAG,
  academicSemesterTag,
} from "@/lib/api/dashboard/admin/academic-semester/tags";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_COOKIE = "pms_access_token";

function ensureApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in environment.");
  }
}

async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

function authHeaders(token: string | null): HeadersInit {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<ApiResponse<T>> {
  const text = await response.text();

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    const preview = text.slice(0, 180).replace(/\s+/g, " ").trim();
    throw new Error(
      preview
        ? `${fallbackMessage} Received: ${preview}`
        : `${fallbackMessage} Invalid JSON response.`
    );
  }
}

async function fetchAcademicSemestersCached(
  params: AcademicSemesterListParams,
  token: string | null
): Promise<AcademicSemesterListPayload> {
  "use cache";
  ensureApiBaseUrl();

  const query = buildAcademicSemesterQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/academic-semester?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [ACADEMIC_SEMESTERS_TAG],
      },
    }
  );

  const payload = await parseJsonResponse<AcademicSemesterListPayload>(
    response,
    "Failed to load academic semesters."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic semesters.");
  }

  return payload.data;
}

async function fetchAcademicSemesterCached(
  id: string,
  token: string | null
): Promise<AcademicSemester> {
  "use cache";
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-semester/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [academicSemesterTag(id)],
    },
  });

  const payload = await parseJsonResponse<AcademicSemester>(
    response,
    "Failed to load academic semester."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic semester.");
  }

  return payload.data;
}

export async function getAcademicSemestersServer(
  params: AcademicSemesterListParams
): Promise<AcademicSemesterListPayload> {
  const token = await readAccessToken();
  return fetchAcademicSemestersCached(params, token);
}

export async function getAcademicSemesterServer(
  id: string
): Promise<AcademicSemester> {
  const token = await readAccessToken();
  return fetchAcademicSemesterCached(id, token);
}

export async function createAcademicSemesterServer(
  input: AcademicSemesterInput
): Promise<AcademicSemester> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/academic-semester/create-academic-semester`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(input),
    }
  );

  const payload = await parseJsonResponse<AcademicSemester>(
    response,
    "Failed to create academic semester."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create academic semester.");
  }

  return payload.data;
}

export async function updateAcademicSemesterServer(
  id: string,
  input: AcademicSemesterInput
): Promise<AcademicSemester> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/academic-semester/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<AcademicSemester>(
    response,
    "Failed to update academic semester."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic semester.");
  }

  return payload.data;
}
