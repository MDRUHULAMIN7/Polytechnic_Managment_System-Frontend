import {
  AcademicInstructor,
  AcademicInstructorInput,
  AcademicInstructorListParams,
  AcademicInstructorListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-instructor";
import { buildAcademicInstructorQuery } from "@/utils/dashboard/admin/academic-instructor/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";

export async function getAcademicInstructors(
  params: AcademicInstructorListParams
): Promise<AcademicInstructorListPayload> {
  ensureApiBaseUrl();

  const query = buildAcademicInstructorQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/academic-instructor?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    }
  );

  const payload =
    (await response.json()) as ApiResponse<AcademicInstructorListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic instructors.");
  }

  return payload.data;
}

export async function getAcademicInstructor(
  id: string
): Promise<AcademicInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-instructor/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<AcademicInstructor>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load academic instructor.");
  }

  return payload.data;
}

export async function createAcademicInstructor(
  input: AcademicInstructorInput
): Promise<AcademicInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/academic-instructor/create-academic-instructor`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
      body: JSON.stringify(input),
    }
  );

  const payload = (await response.json()) as ApiResponse<AcademicInstructor>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create academic instructor.");
  }

  return payload.data;
}

export async function updateAcademicInstructor(
  id: string,
  input: AcademicInstructorInput
): Promise<AcademicInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-instructor/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<AcademicInstructor>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update academic instructor.");
  }

  return payload.data;
}
