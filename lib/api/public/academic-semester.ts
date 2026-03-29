import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";
import { getServerAuthHeaders } from "@/lib/api/dashboard/server-auth";
import type {
  AcademicSemesterListParams,
  AcademicSemesterListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-semester";
import { buildAcademicSemesterQuery } from "@/utils/dashboard/admin/academic-semester/query";

export async function getPublicAcademicSemesters(
  params: AcademicSemesterListParams
): Promise<AcademicSemesterListPayload> {
  ensureApiBaseUrl();

  const query = buildAcademicSemesterQuery(params);
  const authHeaders = await getServerAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/academic-semester?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    next: { revalidate: 120 },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Academic semester data is not available for public access right now."
    );
  }

  if (!response.ok) {
    throw new Error("Failed to load academic semester data.");
  }

  const payload = (await response.json()) as ApiResponse<AcademicSemesterListPayload>;

  if (!payload.data) {
    throw new Error(payload.message || "Failed to load academic semester data.");
  }

  return payload.data;
}
