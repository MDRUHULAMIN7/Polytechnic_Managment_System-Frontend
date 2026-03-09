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
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";

export async function getStudents(
  params: StudentListParams
): Promise<StudentListPayload> {
  ensureApiBaseUrl();

  const query = buildStudentQuery(params);
  const response = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<StudentListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load students.");
  }

  return payload.data;
}

export async function getStudent(id: string): Promise<Student> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/student/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<Student>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load student.");
  }

  return payload.data;
}

export async function createStudent(
  payload: StudentCreatePayload,
  file?: File | null
): Promise<Student> {
  ensureApiBaseUrl();

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

  const response = await fetch(`${API_BASE_URL}/user/create-student`, {
    method: "POST",
    headers: {
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: formData,
  });

  const payloadResult = (await response.json()) as ApiResponse<Student | Student[]>;

  if (!response.ok || !payloadResult.success || !payloadResult.data) {
    throw new Error(payloadResult.message || "Failed to create student.");
  }

  const created = Array.isArray(payloadResult.data)
    ? payloadResult.data[0]
    : payloadResult.data;

  if (!created) {
    throw new Error("Failed to create student.");
  }

  return created;
}

export async function updateStudent(
  id: string,
  input: Partial<StudentInput>
): Promise<Student> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/student/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify({ student: input }),
  });

  const payload = (await response.json()) as ApiResponse<Student>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update student.");
  }

  return payload.data;
}

export async function changeStudentStatus(
  userId: string,
  status: StudentStatus
): Promise<Student> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/user/change-status/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const payload = (await response.json()) as ApiResponse<Student>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update status.");
  }

  return payload.data ?? ({} as Student);
}
