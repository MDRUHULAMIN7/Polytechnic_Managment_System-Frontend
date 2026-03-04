"use server";

import { revalidateTag } from "next/cache";
import type { SemesterRegistrationInput } from "@/lib/type/dashboard/admin/semester-registration";
import {
  createSemesterRegistrationServer,
  deleteSemesterRegistrationServer,
  updateSemesterRegistrationServer,
} from "@/lib/api/dashboard/admin/semester-registration/server";
import {
  SEMESTER_REGISTRATIONS_TAG,
  semesterRegistrationTag,
} from "@/lib/api/dashboard/admin/semester-registration/tags";

export async function createSemesterRegistrationAction(
  input: SemesterRegistrationInput
) {
  const result = await createSemesterRegistrationServer(input);
  revalidateTag(SEMESTER_REGISTRATIONS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(semesterRegistrationTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateSemesterRegistrationAction(
  id: string,
  input: Partial<SemesterRegistrationInput>
) {
  const result = await updateSemesterRegistrationServer(id, input);
  revalidateTag(SEMESTER_REGISTRATIONS_TAG, { expire: 0 });
  revalidateTag(semesterRegistrationTag(id), { expire: 0 });
  return result;
}

export async function deleteSemesterRegistrationAction(id: string) {
  const result = await deleteSemesterRegistrationServer(id);
  revalidateTag(SEMESTER_REGISTRATIONS_TAG, { expire: 0 });
  revalidateTag(semesterRegistrationTag(id), { expire: 0 });
  return result;
}
