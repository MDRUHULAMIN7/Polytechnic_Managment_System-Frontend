import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";
import type {
  AcademicDepartmentListParams,
  AcademicDepartmentListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-department";
import { buildAcademicDepartmentQuery } from "@/utils/dashboard/admin/academic-department/query";

export async function getPublicAcademicDepartments(
  params: AcademicDepartmentListParams
): Promise<AcademicDepartmentListPayload> {
  ensureApiBaseUrl();

  const query = buildAcademicDepartmentQuery(params);
  if (!query.has("fields")) {
    query.set("fields", "name,academicInstructor");
  }

  const response = await fetch(
    `${API_BASE_URL}/academic-department/public?${query.toString()}`,
    { next: { revalidate: 120 } }
  );

  if (!response.ok) {
    throw new Error("Failed to load public academic departments.");
  }

  const payload = (await response.json()) as ApiResponse<AcademicDepartmentListPayload>;

  if (!payload.data) {
    throw new Error(payload.message || "Failed to load public academic departments.");
  }

  return payload.data;
}
