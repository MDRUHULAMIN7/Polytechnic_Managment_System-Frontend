import { cookies } from "next/headers";
import type {
  AcademicDepartment,
  AcademicDepartmentInput,
  AcademicDepartmentListParams,
  AcademicDepartmentListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-department";
import { buildAcademicDepartmentQuery } from "@/utils/dashboard/admin/academic-department/query";
import {
  ACADEMIC_DEPARTMENTS_TAG,
  academicDepartmentTag,
} from "@/lib/api/dashboard/admin/academic-department/tags";

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

async function fetchAcademicDepartmentsCached(
  params: AcademicDepartmentListParams,
  token: string | null
): Promise<AcademicDepartmentListPayload> {
  "use cache";
  ensureApiBaseUrl();

  const query = buildAcademicDepartmentQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/academic-department?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [ACADEMIC_DEPARTMENTS_TAG],
      },
    }
  );

  const payload = await parseJsonResponse<AcademicDepartmentListPayload>(
    response,
    "Failed to load academic departments."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic departments.");
  }

  return payload.data;
}

async function fetchAcademicDepartmentCached(
  id: string,
  token: string | null
): Promise<AcademicDepartment> {
  "use cache";
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-department/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [academicDepartmentTag(id)],
    },
  });

  const payload = await parseJsonResponse<AcademicDepartment>(
    response,
    "Failed to load academic department."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic department.");
  }

  return payload.data;
}

export async function getAcademicDepartmentsServer(
  params: AcademicDepartmentListParams
): Promise<AcademicDepartmentListPayload> {
  const token = await readAccessToken();
  return fetchAcademicDepartmentsCached(params, token);
}

export async function getAcademicDepartmentServer(
  id: string
): Promise<AcademicDepartment> {
  const token = await readAccessToken();
  return fetchAcademicDepartmentCached(id, token);
}

export async function createAcademicDepartmentServer(
  input: AcademicDepartmentInput
): Promise<AcademicDepartment> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/academic-department/create-academic-department`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(input),
    }
  );

  const payload = await parseJsonResponse<AcademicDepartment>(
    response,
    "Failed to create academic department."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create academic department.");
  }

  return payload.data;
}

export async function updateAcademicDepartmentServer(
  id: string,
  input: AcademicDepartmentInput
): Promise<AcademicDepartment> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/academic-department/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<AcademicDepartment>(
    response,
    "Failed to update academic department."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic department.");
  }

  return payload.data;
}
