"use server";

import { revalidateTag } from "next/cache";
import type { AcademicInstructorInput } from "@/lib/type/dashboard/admin/academic-instructor";
import {
  createAcademicInstructorServer,
  updateAcademicInstructorServer,
} from "@/lib/api/dashboard/admin/academic-instructor/server";
import {
  ACADEMIC_INSTRUCTORS_TAG,
  academicInstructorTag,
} from "@/lib/api/dashboard/admin/academic-instructor/tags";

export async function createAcademicInstructorAction(
  input: AcademicInstructorInput
) {
  const result = await createAcademicInstructorServer(input);
  revalidateTag(ACADEMIC_INSTRUCTORS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(academicInstructorTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateAcademicInstructorAction(
  id: string,
  input: AcademicInstructorInput
) {
  const result = await updateAcademicInstructorServer(id, input);
  revalidateTag(ACADEMIC_INSTRUCTORS_TAG, { expire: 0 });
  revalidateTag(academicInstructorTag(id), { expire: 0 });
  return result;
}
