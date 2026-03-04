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
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  authHeaders,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

async function fetchAcademicDepartmentsCached(
  params: AcademicDepartmentListParams,
  token: string | null
): Promise<AcademicDepartmentListPayload> {
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

  const payload = await parseJsonResponse<ApiResponse<AcademicDepartmentListPayload>>(
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

  const payload = await parseJsonResponse<ApiResponse<AcademicDepartment>>(
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

  const payload = await parseJsonResponse<ApiResponse<AcademicDepartment>>(
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

  const payload = await parseJsonResponse<ApiResponse<AcademicDepartment>>(
    response,
    "Failed to update academic department."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic department.");
  }

  return payload.data;
}

