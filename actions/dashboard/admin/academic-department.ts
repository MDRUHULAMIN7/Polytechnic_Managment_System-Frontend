"use server";

import { revalidateTag } from "next/cache";
import type { AcademicDepartmentInput } from "@/lib/type/dashboard/admin/academic-department";
import {
  createAcademicDepartmentServer,
  updateAcademicDepartmentServer,
} from "@/lib/api/dashboard/admin/academic-department/server";
import {
  ACADEMIC_DEPARTMENTS_TAG,
  academicDepartmentTag,
} from "@/lib/api/dashboard/admin/academic-department/tags";

export async function createAcademicDepartmentAction(
  input: AcademicDepartmentInput
) {
  const result = await createAcademicDepartmentServer(input);
  revalidateTag(ACADEMIC_DEPARTMENTS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(academicDepartmentTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateAcademicDepartmentAction(
  id: string,
  input: AcademicDepartmentInput
) {
  const result = await updateAcademicDepartmentServer(id, input);
  revalidateTag(ACADEMIC_DEPARTMENTS_TAG, { expire: 0 });
  revalidateTag(academicDepartmentTag(id), { expire: 0 });
  return result;
}
