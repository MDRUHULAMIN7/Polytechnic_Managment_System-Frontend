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
import type { SemesterEnrollment, SemesterEnrollmentInput } from "@/lib/type/dashboard/admin/semester-enrollment";

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

export async function createSemesterEnrollment(
  input: SemesterEnrollmentInput
): Promise<SemesterEnrollment> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/semester-enrollments/create-semester-enrollment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<SemesterEnrollment>;

  if (!response.ok || !payload.success || !payload.data) {
    const errorSources = (payload as { errorSources?: Array<{ message?: string }> }).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
    throw new Error(errorMessage || payload.message || "Failed to create semester enrollment.");
  }

  return payload.data;
}
