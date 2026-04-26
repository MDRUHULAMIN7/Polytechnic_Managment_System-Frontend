"use client";

import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import type {
  ApiResponse,
  ClassSessionFilterOptionsPayload,
  ClassSessionListParams,
} from "@/lib/type/dashboard/class-session";

function buildQuery(params: Pick<ClassSessionListParams, "semesterRegistration">) {
  const query = new URLSearchParams();

  if (params.semesterRegistration) {
    query.set("semesterRegistration", params.semesterRegistration);
  }

  return query.toString();
}

export async function getClassSessionFilterOptions(
  params: Pick<ClassSessionListParams, "semesterRegistration">,
) {
  ensureApiBaseUrl();

  const query = buildQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/class-sessions/filter-options${query ? `?${query}` : ""}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    },
  );

  const payload = await parseJsonResponse<ApiResponse<ClassSessionFilterOptionsPayload>>(
    response,
    "Failed to load class filter options.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load class filter options.");
  }

  return payload.data;
}
