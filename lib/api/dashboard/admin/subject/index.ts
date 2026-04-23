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
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import { getSafeApiErrorMessage } from "@/utils/common/api-error";

export async function getSubjects(
  params: SubjectListParams
): Promise<SubjectListPayload> {
  ensureApiBaseUrl();

  const query = buildSubjectQuery(params);
  const response = await fetch(`${API_BASE_URL}/subjects?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<SubjectListPayload>>(
    response,
    "Failed to load subjects.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to load subjects."));
  }

  return payload.data;
}

export async function getSubject(id: string): Promise<Subject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to load subject.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to load subject."));
  }

  return payload.data;
}

export async function updateSubject(
  id: string,
  input: Partial<SubjectInput>
): Promise<Subject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to update subject.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to update subject."));
  }

  return payload.data;
}

export async function deleteSubject(id: string): Promise<Subject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to delete subject.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to delete subject."));
  }

  return payload.data ?? ({} as Subject);
}

export async function assignInstructors(
  subjectId: string,
  instructors: string[]
): Promise<SubjectInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/assign-instructors`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
      body: JSON.stringify({ instructors }),
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SubjectInstructor>>(
    response,
    "Failed to assign instructors.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to assign instructors."));
  }

  return payload.data ?? ({ instructors: [] } as SubjectInstructor);
}

export async function removeInstructors(
  subjectId: string,
  instructors: string[]
): Promise<SubjectInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/remove-instructors`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
      body: JSON.stringify({ instructors }),
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SubjectInstructor>>(
    response,
    "Failed to remove instructors.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to remove instructors."));
  }

  return payload.data ?? ({ instructors: [] } as SubjectInstructor);
}

export async function getSubjectInstructors(
  subjectId: string
): Promise<SubjectInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/get-instructor`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SubjectInstructor>>(
    response,
    "Failed to load subject instructors.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to load subject instructors."));
  }

  if (!payload.data) {
    return { subject: subjectId, instructors: [] };
  }

  return payload.data;
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/subjects/create-subject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Subject>>(
    response,
    "Failed to create subject.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to create subject."));
  }

  return payload.data;
}
