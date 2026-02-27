import type {
  AcademicSemester,
  AcademicSemesterInput,
  AcademicSemesterListParams,
  AcademicSemesterListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-semester";
import { buildAcademicSemesterQuery } from "@/utils/dashboard/admin/academic-semester/query";

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

export async function getAcademicSemesters(
  params: AcademicSemesterListParams
): Promise<AcademicSemesterListPayload> {
  ensureApiBaseUrl();

  const query = buildAcademicSemesterQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/academic-semester?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      credentials: "include",
    }
  );

  const payload = (await response.json()) as ApiResponse<AcademicSemesterListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic semesters.");
  }

  return payload.data;
}

export async function getAcademicSemester(
  id: string
): Promise<AcademicSemester> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-semester/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<AcademicSemester>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic semester.");
  }

  return payload.data;
}

export async function createAcademicSemester(
  input: AcademicSemesterInput
): Promise<AcademicSemester> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/academic-semester/create-academic-semester`,
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

  const payload = (await response.json()) as ApiResponse<AcademicSemester>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create academic semester.");
  }

  return payload.data;
}

export async function updateAcademicSemester(
  id: string,
  input: AcademicSemesterInput
): Promise<AcademicSemester> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-semester/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<AcademicSemester>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic semester.");
  }

  return payload.data;
}
