import type {
  ApiResponse,
  SemesterEnrollmentListParams,
  SemesterEnrollmentListPayload,
} from "@/lib/type/dashboard/admin/semester-enrollment";
import { buildSemesterEnrollmentQuery } from "@/utils/dashboard/admin/semester-enrollment/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";

export async function getSemesterEnrollments(
  params: SemesterEnrollmentListParams
): Promise<SemesterEnrollmentListPayload> {
  ensureApiBaseUrl();

  const query = buildSemesterEnrollmentQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/semester-enrollments?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    }
  );

  const payload = (await response.json()) as ApiResponse<SemesterEnrollmentListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load semester enrollments.");
  }

  return payload.data;
}
