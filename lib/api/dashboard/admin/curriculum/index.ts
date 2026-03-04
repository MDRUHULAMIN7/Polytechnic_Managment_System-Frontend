import type {
  ApiResponse,
  Curriculum,
  CurriculumInput,
  CurriculumListParams,
  CurriculumListPayload,
  CurriculumUpdateInput,
} from "@/lib/type/dashboard/admin/curriculum";
import { buildCurriculumQuery } from "@/utils/dashboard/admin/curriculum/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";

export async function getCurriculums(
  params: CurriculumListParams
): Promise<CurriculumListPayload> {
  ensureApiBaseUrl();

  const query = buildCurriculumQuery(params);
  const response = await fetch(`${API_BASE_URL}/curriculums?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<CurriculumListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load curriculums.");
  }

  return payload.data;
}

export async function getCurriculum(id: string): Promise<Curriculum> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/curriculums/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<Curriculum>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load curriculum.");
  }

  return payload.data;
}

export async function createCurriculum(
  input: CurriculumInput
): Promise<Curriculum> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/curriculums/create-curriculum`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<Curriculum>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create curriculum.");
  }

  return payload.data;
}

export async function updateCurriculum(
  id: string,
  input: CurriculumUpdateInput
): Promise<Curriculum> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/curriculums/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<Curriculum>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update curriculum.");
  }

  return payload.data;
}

export async function deleteCurriculum(id: string): Promise<Curriculum> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/curriculums/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<Curriculum>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete curriculum.");
  }

  return payload.data ?? ({} as Curriculum);
}
