import { cookies } from "next/headers";
import type {
  ApiResponse,
  Instructor,
  InstructorCreatePayload,
  InstructorInput,
  InstructorListParams,
  InstructorListPayload,
  InstructorStatus,
} from "@/lib/type/dashboard/admin/instructor";
import { buildInstructorQuery } from "@/utils/dashboard/admin/instructor/query";
import {
  INSTRUCTORS_TAG,
  instructorTag,
  userTag,
} from "@/lib/api/dashboard/admin/instructor/tags";
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

async function fetchInstructorsCached(
  params: InstructorListParams,
  token: string | null,
): Promise<InstructorListPayload> {
  ensureApiBaseUrl();

  const query = buildInstructorQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/instructors?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [INSTRUCTORS_TAG],
      },
    },
  );

  const payload = await parseJsonResponse<ApiResponse<InstructorListPayload>>(
    response,
    "Failed to load instructors.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load instructors.");
  }

  return payload.data;
}

async function fetchInstructorCached(
  id: string,
  token: string | null,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [instructorTag(id)],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<Instructor>>(
    response,
    "Failed to load instructor.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load instructor.");
  }

  return payload.data;
}

export async function getInstructorsServer(
  params: InstructorListParams,
): Promise<InstructorListPayload> {
  const token = await readAccessToken();
  return fetchInstructorsCached(params, token);
}

export async function getInstructorServer(id: string): Promise<Instructor> {
  const token = await readAccessToken();
  return fetchInstructorCached(id, token);
}

export async function createInstructorServer(
  payload: InstructorCreatePayload,
  file?: File | null,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
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
      ...authHeaders(token),
    },
    body: formData,
  });

  const payloadResult = await parseJsonResponse<
    ApiResponse<Instructor | Instructor[]>
  >(response, "Failed to create instructor.");
  
  if (!response.ok || !payloadResult.success || !payloadResult.data) {
    const errorSources = (
      payloadResult as { errorSources?: Array<{ message?: string }> }
    ).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
      console.log(errorMessage);
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

export async function updateInstructorServer(
  id: string,
  input: Partial<InstructorInput>,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ instructor: input }),
  });

  const payload = await parseJsonResponse<ApiResponse<Instructor>>(
    response,
    "Failed to update instructor.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update instructor.");
  }

  return payload.data;
}

export async function changeInstructorStatusServer(
  userId: string,
  status: InstructorStatus,
): Promise<Instructor> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/users/change-status/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ status }),
    },
  );

  const payload = await parseJsonResponse<ApiResponse<Instructor>>(
    response,
    "Failed to update status.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update status.");
  }

  return payload.data ?? ({} as Instructor);
}

export { INSTRUCTORS_TAG, instructorTag, userTag };
