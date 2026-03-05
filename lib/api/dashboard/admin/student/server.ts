import { cookies } from "next/headers";
import type {
  ApiResponse,
  Student,
  StudentCreatePayload,
  StudentInput,
  StudentListParams,
  StudentListPayload,
  StudentStatus,
} from "@/lib/type/dashboard/admin/student";
import { buildStudentQuery } from "@/utils/dashboard/admin/student/query";
import { STUDENTS_TAG, studentTag, userTag } from "@/lib/api/dashboard/admin/student/tags";
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

async function fetchStudentsCached(
  params: StudentListParams,
  token: string | null
): Promise<StudentListPayload> {
  ensureApiBaseUrl();

  const query = buildStudentQuery(params);
  const response = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [STUDENTS_TAG],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<StudentListPayload>>(
    response,
    "Failed to load students."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load students.");
  }

  return payload.data;
}

async function fetchStudentCached(
  id: string,
  token: string | null
): Promise<Student> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [studentTag(id)],
    },
  });
  
  const payload = await parseJsonResponse<ApiResponse<Student>>(
    response,
    "Failed to load student."
  );
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load student.");
  }

  return payload.data;
}

export async function getStudentsServer(
  params: StudentListParams
): Promise<StudentListPayload> {
  const token = await readAccessToken();
  return fetchStudentsCached(params, token);
}

export async function getStudentServer(id: string): Promise<Student> {
  const token = await readAccessToken();
  return fetchStudentCached(id, token);
}

export async function createStudentServer(
  payload: StudentCreatePayload,
  file?: File | null
): Promise<Student> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const formData = new FormData();

  formData.append(
    "data",
    JSON.stringify({
      password: payload.password,
      studentData: payload.studentData,
    })
  );

  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(`${API_BASE_URL}/users/create-student`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
    },
    body: formData,
  });

  const payloadResult = await parseJsonResponse<ApiResponse<Student | Student[]>>(
    response,
    "Failed to create student."
  );
  if (!response.ok || !payloadResult.success || !payloadResult.data) {
    const errorSources = (
      payloadResult as { errorSources?: Array<{ message?: string }> }
    ).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
    console.error("[createStudentServer] Failed", {
      status: response.status,
      statusText: response.statusText,
      message: payloadResult.message,
      errorMessage,
      errorSources,
    });
    throw new Error(errorMessage || payloadResult.message || "Failed to create student.");
  }

  const created = Array.isArray(payloadResult.data)
    ? payloadResult.data[0]
    : payloadResult.data;

  if (!created) {
    throw new Error("Failed to create student.");
  }

  return created;
}

export async function updateStudentServer(
  id: string,
  input: Partial<StudentInput>
): Promise<Student> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ student: input }),
  });

  const payload = await parseJsonResponse<ApiResponse<Student>>(
    response,
    "Failed to update student."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update student.");
  }

  return payload.data;
}

export async function changeStudentStatusServer(
  userId: string,
  status: StudentStatus
): Promise<Student> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/users/change-status/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });

  const payload = await parseJsonResponse<ApiResponse<Student>>(
    response,
    "Failed to update status."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update status.");
  }

  return payload.data ?? ({} as Student);
}

export { STUDENTS_TAG, studentTag, userTag };
