import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";
import type {
  ApiResponse,
  Instructor,
  InstructorListParams,
  InstructorListPayload,
} from "@/lib/type/dashboard/admin/instructor";
import { buildInstructorQuery } from "@/utils/dashboard/admin/instructor/query";

const PUBLIC_INSTRUCTOR_FIELDS =
  "id,name,designation,email,profileImg,academicDepartment,createdAt,updatedAt";

export async function getPublicInstructors(
  params: InstructorListParams
): Promise<InstructorListPayload> {
  ensureApiBaseUrl();

  const query = buildInstructorQuery(params);
  if (!query.has("fields")) {
    query.set("fields", PUBLIC_INSTRUCTOR_FIELDS);
  }

  const response = await fetch(`${API_BASE_URL}/instructors/public?${query.toString()}`, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error("Failed to load public instructors.");
  }

  const payload = (await response.json()) as ApiResponse<InstructorListPayload>;

  if (!payload.data) {
    throw new Error(payload.message || "Failed to load public instructors.");
  }

  return payload.data;
}

export async function getPublicInstructor(id: string): Promise<Instructor> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/instructors/public/${id}`, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error("Failed to load public instructor.");
  }

  const payload = (await response.json()) as ApiResponse<Instructor>;

  if (!payload.data) {
    throw new Error(payload.message || "Failed to load public instructor.");
  }

  return payload.data;
}
