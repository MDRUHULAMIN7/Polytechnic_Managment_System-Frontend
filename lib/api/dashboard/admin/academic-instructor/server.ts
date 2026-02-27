import { cookies } from "next/headers";
import type {
  AcademicInstructor,
  AcademicInstructorInput,
  AcademicInstructorListParams,
  AcademicInstructorListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-instructor";
import { buildAcademicInstructorQuery } from "@/utils/dashboard/admin/academic-instructor/query";
import {
  ACADEMIC_INSTRUCTORS_TAG,
  academicInstructorTag,
} from "@/lib/api/dashboard/admin/academic-instructor/tags";

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

async function fetchAcademicInstructorsCached(
  params: AcademicInstructorListParams,
  token: string | null
): Promise<AcademicInstructorListPayload> {
  "use cache";
  ensureApiBaseUrl();

  const query = buildAcademicInstructorQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/academic-instructor?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [ACADEMIC_INSTRUCTORS_TAG],
      },
    }
  );

  const payload = await parseJsonResponse<AcademicInstructorListPayload>(
    response,
    "Failed to load academic instructors."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic instructors.");
  }

  return payload.data;
}

async function fetchAcademicInstructorCached(
  id: string,
  token: string | null
): Promise<AcademicInstructor> {
  "use cache";
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-instructor/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [academicInstructorTag(id)],
    },
  });

  const payload = await parseJsonResponse<AcademicInstructor>(
    response,
    "Failed to load academic instructor."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic instructor.");
  }

  return payload.data;
}

export async function getAcademicInstructorsServer(
  params: AcademicInstructorListParams
): Promise<AcademicInstructorListPayload> {
  const token = await readAccessToken();
  return fetchAcademicInstructorsCached(params, token);
}

export async function getAcademicInstructorServer(
  id: string
): Promise<AcademicInstructor> {
  const token = await readAccessToken();
  return fetchAcademicInstructorCached(id, token);
}

export async function createAcademicInstructorServer(
  input: AcademicInstructorInput
): Promise<AcademicInstructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/academic-instructor/create-academic-instructor`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(input),
    }
  );

  const payload = await parseJsonResponse<AcademicInstructor>(
    response,
    "Failed to create academic instructor."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create academic instructor.");
  }

  return payload.data;
}

export async function updateAcademicInstructorServer(
  id: string,
  input: AcademicInstructorInput
): Promise<AcademicInstructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/academic-instructor/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<AcademicInstructor>(
    response,
    "Failed to update academic instructor."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic instructor.");
  }

  return payload.data;
}
