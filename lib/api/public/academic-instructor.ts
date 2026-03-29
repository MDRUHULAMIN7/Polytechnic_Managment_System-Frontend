import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";
import type {
  AcademicInstructor,
  AcademicInstructorListParams,
  AcademicInstructorListPayload,
  ApiResponse,
} from "@/lib/type/dashboard/admin/academic-instructor";
import { buildAcademicInstructorQuery } from "@/utils/dashboard/admin/academic-instructor/query";

export async function getPublicAcademicInstructors(
  params: AcademicInstructorListParams
): Promise<AcademicInstructorListPayload> {
  ensureApiBaseUrl();

  const query = buildAcademicInstructorQuery(params);
  if (!query.has("fields")) {
    query.set("fields", "name");
  }

  const response = await fetch(
    `${API_BASE_URL}/academic-instructor/public?${query.toString()}`,
    { next: { revalidate: 120 } }
  );

  if (!response.ok) {
    throw new Error("Failed to load public academic instructors.");
  }

  const payload = (await response.json()) as ApiResponse<AcademicInstructorListPayload>;

  if (!payload.data) {
    throw new Error(payload.message || "Failed to load public academic instructors.");
  }

  return payload.data;
}

export async function getPublicAcademicInstructor(
  id: string
): Promise<AcademicInstructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/academic-instructor/public/${id}`, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error("Failed to load public academic instructor.");
  }

  const payload = (await response.json()) as ApiResponse<AcademicInstructor>;

  if (!payload.data) {
    throw new Error(payload.message || "Failed to load public academic instructor.");
  }

  return payload.data;
}
