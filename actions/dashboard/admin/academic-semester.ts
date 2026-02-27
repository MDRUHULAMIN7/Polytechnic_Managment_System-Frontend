"use server";

import { revalidateTag } from "next/cache";
import type { AcademicSemesterInput } from "@/lib/type/dashboard/admin/academic-semester";
import {
  createAcademicSemesterServer,
  updateAcademicSemesterServer,
} from "@/lib/api/dashboard/admin/academic-semester/server";
import {
  ACADEMIC_SEMESTERS_TAG,
  academicSemesterTag,
} from "@/lib/api/dashboard/admin/academic-semester/tags";

export async function createAcademicSemesterAction(
  input: AcademicSemesterInput
) {
  const result = await createAcademicSemesterServer(input);
  revalidateTag(ACADEMIC_SEMESTERS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(academicSemesterTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateAcademicSemesterAction(
  id: string,
  input: AcademicSemesterInput
) {
  const result = await updateAcademicSemesterServer(id, input);
  revalidateTag(ACADEMIC_SEMESTERS_TAG, { expire: 0 });
  revalidateTag(academicSemesterTag(id), { expire: 0 });
  return result;
}
