import { cookies } from "next/headers";
import type {
  ApiResponse,
  EnrolledSubject,
} from "@/lib/type/dashboard/admin/enrolled-subject";
import { ENROLLED_SUBJECTS_TAG } from "@/lib/api/dashboard/admin/enrolled-subject/tags";
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

async function fetchMyEnrolledSubjectsCached(
  token: string | null
): Promise<EnrolledSubject[]> {
  "use cache";
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/enrolled-subjects/my-enrolled-subjects`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [ENROLLED_SUBJECTS_TAG],
      },
    }
  );

  const payload = await parseJsonResponse<ApiResponse<EnrolledSubject[]>>(
    response,
    "Failed to load enrolled subjects."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load enrolled subjects.");
  }

  return payload.data;
}

export async function getMyEnrolledSubjectsServer(): Promise<EnrolledSubject[]> {
  const token = await readAccessToken();
  return fetchMyEnrolledSubjectsCached(token);
}
