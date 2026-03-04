import { cookies } from "next/headers";
import type {
  ApiResponse,
  Subject,
  SubjectInput,
  SubjectInstructor,
  SubjectListParams,
  SubjectListPayload,
} from "@/lib/type/dashboard/admin/subject";
import { buildSubjectQuery } from "@/utils/dashboard/admin/subject/query";
import {
  SUBJECTS_TAG,
  subjectInstructorTag,
  subjectTag,
} from "@/lib/api/dashboard/admin/subject/tags";
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

async function fetchSubjectsCached(
  params: SubjectListParams,
  token: string | null
): Promise<SubjectListPayload> {
  ensureApiBaseUrl();

  const query = buildSubjectQuery(params);
  const response = await fetch(`${API_BASE_URL}/subjects?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [SUBJECTS_TAG],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<SubjectListPayload>>(
    response,
    "Failed to load subjects."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load subjects.");
  }

  return payload.data;
}

async function fetchSubjectCached(id: string, token: string | null): Promise<Subject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [subjectTag(id)],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to load subject."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load subject.");
  }

  return payload.data;
}

export async function getSubjectsServer(
  params: SubjectListParams
): Promise<SubjectListPayload> {
  const token = await readAccessToken();
  return fetchSubjectsCached(params, token);
}

export async function getSubjectServer(id: string): Promise<Subject> {
  const token = await readAccessToken();
  return fetchSubjectCached(id, token);
}

export async function updateSubjectServer(
  id: string,
  input: Partial<SubjectInput>
): Promise<Subject> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to update subject."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update subject.");
  }

  return payload.data;
}

export async function createSubjectServer(
  input: SubjectInput
): Promise<Subject> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/subjects/create-subject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to create subject."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create subject.");
  }

  return payload.data;
}

export async function deleteSubjectServer(id: string): Promise<Subject> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to delete subject."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete subject.");
  }

  return payload.data ?? ({} as Subject);
}

export async function assignInstructorsServer(
  subjectId: string,
  instructors: string[]
): Promise<SubjectInstructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/assign-instructors`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ instructors }),
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SubjectInstructor>>(
    response,
    "Failed to assign instructors."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to assign instructors.");
  }

  return payload.data ?? ({ instructors: [] } as SubjectInstructor);
}

export async function removeInstructorsServer(
  subjectId: string,
  instructors: string[]
): Promise<SubjectInstructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/remove-instructors`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ instructors }),
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SubjectInstructor>>(
    response,
    "Failed to remove instructors."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to remove instructors.");
  }

  return payload.data ?? ({ instructors: [] } as SubjectInstructor);
}

export async function getSubjectInstructorsServer(
  subjectId: string
): Promise<SubjectInstructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/get-instructor`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [subjectInstructorTag(subjectId)],
      },
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SubjectInstructor>>(
    response,
    "Failed to load subject instructors."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to load subject instructors.");
  }

  if (!payload.data) {
    return { subject: subjectId, instructors: [] };
  }

  return payload.data;
}

export { SUBJECTS_TAG, subjectInstructorTag, subjectTag };

