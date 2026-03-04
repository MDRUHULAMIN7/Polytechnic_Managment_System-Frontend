import { cookies } from "next/headers";
import type {
  ApiResponse,
  SemesterEnrollmentListParams,
  SemesterEnrollmentListPayload,
} from "@/lib/type/dashboard/admin/semester-enrollment";
import { buildSemesterEnrollmentQuery } from "@/utils/dashboard/admin/semester-enrollment/query";
import { SEMESTER_ENROLLMENTS_TAG } from "@/lib/api/dashboard/admin/semester-enrollment/tags";
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

async function fetchSemesterEnrollmentsCached(
  params: SemesterEnrollmentListParams,
  token: string | null
): Promise<SemesterEnrollmentListPayload> {
  "use cache";
  ensureApiBaseUrl();

  const query = buildSemesterEnrollmentQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/semester-enrollments?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [SEMESTER_ENROLLMENTS_TAG],
      },
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SemesterEnrollmentListPayload>>(
    response,
    "Failed to load semester enrollments."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load semester enrollments.");
  }

  return payload.data;
}

export async function getSemesterEnrollmentsServer(
  params: SemesterEnrollmentListParams
): Promise<SemesterEnrollmentListPayload> {
  const token = await readAccessToken();
  return fetchSemesterEnrollmentsCached(params, token);
}
