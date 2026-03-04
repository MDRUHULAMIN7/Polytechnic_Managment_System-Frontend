"use server";

import { revalidateTag } from "next/cache";
import type { CurriculumInput, CurriculumUpdateInput } from "@/lib/type/dashboard/admin/curriculum";
import {
  createCurriculumServer,
  deleteCurriculumServer,
  updateCurriculumServer,
} from "@/lib/api/dashboard/admin/curriculum/server";
import { CURRICULUMS_TAG, curriculumTag } from "@/lib/api/dashboard/admin/curriculum/tags";

export async function createCurriculumAction(input: CurriculumInput) {
  const result = await createCurriculumServer(input);
  revalidateTag(CURRICULUMS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(curriculumTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateCurriculumAction(
  id: string,
  input: CurriculumUpdateInput
) {
  const result = await updateCurriculumServer(id, input);
  revalidateTag(CURRICULUMS_TAG, { expire: 0 });
  revalidateTag(curriculumTag(id), { expire: 0 });
  return result;
}

export async function deleteCurriculumAction(id: string) {
  const result = await deleteCurriculumServer(id);
  revalidateTag(CURRICULUMS_TAG, { expire: 0 });
  revalidateTag(curriculumTag(id), { expire: 0 });
  return result;
}
