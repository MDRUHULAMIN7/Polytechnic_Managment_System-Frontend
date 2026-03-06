import type {
  ApiResponse,
  Instructor,
  InstructorCreatePayload,
  InstructorInput,
  InstructorListParams,
  InstructorListPayload,
  InstructorStatus,
  InstructorSummary,
} from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import { buildInstructorQuery } from "@/utils/dashboard/admin/instructor/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function getInstructors(
  params: InstructorListParams,
): Promise<InstructorListPayload> {
  ensureApiBaseUrl();

  const query = buildInstructorQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/instructors?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    },
  );

  const payload = (await response.json()) as ApiResponse<InstructorListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load instructors.");
  }

  return payload.data;
}

export async function getInstructor(id: string): Promise<Instructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<Instructor>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load instructor.");
  }

  return payload.data;
}

export async function getInstructorSummary(id: string): Promise<InstructorSummary> {
  ensureApiBaseUrl();

  try {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}/summary`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    });

    const payload = await parseJsonResponse<ApiResponse<InstructorSummary>>(
      response,
      "Failed to load instructor summary.",
    );

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message || "Failed to load instructor summary.");
    }

    return payload.data;
  } catch {
    const fallback = await getInstructor(id);
    return {
      _id: fallback._id,
      id: fallback.id,
      name: fallback.name,
      designation: fallback.designation,
      email: fallback.email,
      profileImg: fallback.profileImg,
      academicDepartment: fallback.academicDepartment,
      user: fallback.user,
    };
  }
}

export async function createInstructor(
  payload: InstructorCreatePayload,
  file?: File | null,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      password: payload.password,
      instructor: payload.instructorData,
    }),
  );

  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(`${API_BASE_URL}/users/create-instructor`, {
    method: "POST",
    headers: {
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: formData,
  });

  const payloadResult = (await response.json()) as ApiResponse<
    Instructor | Instructor[]
  >;

  if (!response.ok || !payloadResult.success || !payloadResult.data) {
    const errorSources = (
      payloadResult as { errorSources?: Array<{ message?: string }> }
    ).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
    throw new Error(
      errorMessage || payloadResult.message || "Failed to create instructor.",
    );
  }

  const created = Array.isArray(payloadResult.data)
    ? payloadResult.data[0]
    : payloadResult.data;

  if (!created) {
    throw new Error("Failed to create instructor.");
  }

  return created;
}

export async function updateInstructor(
  id: string,
  input: Partial<InstructorInput>,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify({ instructor: input }),
  });

  const payload = (await response.json()) as ApiResponse<Instructor>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update instructor.");
  }

  return payload.data;
}

export async function changeInstructorStatus(
  userId: string,
  status: InstructorStatus,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/users/change-status/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    },
  );

  const payload = (await response.json()) as ApiResponse<Instructor>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update status.");
  }

  return payload.data ?? ({} as Instructor);
}

export async function getInstructorAssignedSubjects(
  id: string,
): Promise<Subject[]> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/instructors/${id}/assigned-subjects`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    },
  );

  const payload = await parseJsonResponse<ApiResponse<Subject[]>>(
    response,
    "Failed to load assigned subjects.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to load assigned subjects.");
  }

  return payload.data ?? [];
}
