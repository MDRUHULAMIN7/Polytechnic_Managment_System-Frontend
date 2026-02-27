import type {
  AcademicDepartment,
  AcademicDepartmentInput,
  AcademicDepartmentListParams,
  AcademicDepartmentListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-department";
import { buildAcademicDepartmentQuery } from "@/utils/dashboard/admin/academic-department/query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_COOKIE = "pms_access_token";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
}

function authHeaders(): HeadersInit {
  const token = readCookie(ACCESS_TOKEN_COOKIE);
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

function ensureApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in environment.");
  }
}

export async function getAcademicDepartments(
  params: AcademicDepartmentListParams
): Promise<AcademicDepartmentListPayload> {
  ensureApiBaseUrl();

  const query = buildAcademicDepartmentQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/academic-department?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      credentials: "include",
    }
  );

  const payload =
    (await response.json()) as ApiResponse<AcademicDepartmentListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic departments.");
  }

  return payload.data;
}

export async function getAcademicDepartment(
  id: string
): Promise<AcademicDepartment> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-department/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<AcademicDepartment>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic department.");
  }

  return payload.data;
}

export async function createAcademicDepartment(
  input: AcademicDepartmentInput
): Promise<AcademicDepartment> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/academic-department/create-academic-department`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(input),
    }
  );

  const payload = (await response.json()) as ApiResponse<AcademicDepartment>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create academic department.");
  }

  return payload.data;
}

export async function updateAcademicDepartment(
  id: string,
  input: AcademicDepartmentInput
): Promise<AcademicDepartment> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-department/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<AcademicDepartment>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic department.");
  }

  return payload.data;
}
