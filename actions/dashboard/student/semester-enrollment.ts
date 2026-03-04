"use server";

import { revalidateTag } from "next/cache";
import type { SemesterEnrollmentInput } from "@/lib/type/dashboard/admin/semester-enrollment";
import { createSemesterEnrollmentServer } from "@/lib/api/dashboard/admin/semester-enrollment/server";
import { SEMESTER_ENROLLMENTS_TAG } from "@/lib/api/dashboard/admin/semester-enrollment/tags";

export async function createSemesterEnrollmentAction(
  input: SemesterEnrollmentInput
) {
  const result = await createSemesterEnrollmentServer(input);
  revalidateTag(SEMESTER_ENROLLMENTS_TAG, { expire: 0 });
  return result;
}
