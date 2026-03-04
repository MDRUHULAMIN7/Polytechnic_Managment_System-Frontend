import { cookies } from "next/headers";
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
  CURRICULUMS_TAG,
  curriculumTag,
} from "@/lib/api/dashboard/admin/curriculum/tags";
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

async function fetchCurriculumsCached(
  params: CurriculumListParams,
  token: string | null
): Promise<CurriculumListPayload> {
  "use cache";
  ensureApiBaseUrl();

  const query = buildCurriculumQuery(params);
  const response = await fetch(`${API_BASE_URL}/curriculums?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [CURRICULUMS_TAG],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<CurriculumListPayload>>(
    response,
    "Failed to load curriculums."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load curriculums.");
  }

  return payload.data;
}

async function fetchCurriculumCached(
  id: string,
  token: string | null
): Promise<Curriculum> {
  "use cache";
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/curriculums/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [curriculumTag(id)],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<Curriculum>>(
    response,
    "Failed to load curriculum."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load curriculum.");
  }

  return payload.data;
}

export async function getCurriculumsServer(
  params: CurriculumListParams
): Promise<CurriculumListPayload> {
  const token = await readAccessToken();
  return fetchCurriculumsCached(params, token);
}

export async function getCurriculumServer(id: string): Promise<Curriculum> {
  const token = await readAccessToken();
  return fetchCurriculumCached(id, token);
}

export async function createCurriculumServer(
  input: CurriculumInput
): Promise<Curriculum> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/curriculums/create-curriculum`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Curriculum>>(
    response,
    "Failed to create curriculum."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create curriculum.");
  }

  return payload.data;
}

export async function updateCurriculumServer(
  id: string,
  input: CurriculumUpdateInput
): Promise<Curriculum> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/curriculums/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Curriculum>>(
    response,
    "Failed to update curriculum."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update curriculum.");
  }

  return payload.data;
}

export async function deleteCurriculumServer(id: string): Promise<Curriculum> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/curriculums/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  const payload = await parseJsonResponse<ApiResponse<Curriculum>>(
    response,
    "Failed to delete curriculum."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete curriculum.");
  }

  return payload.data ?? ({} as Curriculum);
}
