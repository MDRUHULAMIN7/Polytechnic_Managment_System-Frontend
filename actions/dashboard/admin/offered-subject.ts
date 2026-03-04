"use server";

import { revalidateTag } from "next/cache";
import type {
  OfferedSubjectInput,
  OfferedSubjectUpdateInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import {
  createOfferedSubjectServer,
  deleteOfferedSubjectServer,
  updateOfferedSubjectServer,
} from "@/lib/api/dashboard/admin/offered-subject/server";
import {
  OFFERED_SUBJECTS_TAG,
  offeredSubjectTag,
} from "@/lib/api/dashboard/admin/offered-subject/tags";

export async function createOfferedSubjectAction(input: OfferedSubjectInput) {
  const result = await createOfferedSubjectServer(input);
  revalidateTag(OFFERED_SUBJECTS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(offeredSubjectTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateOfferedSubjectAction(
  id: string,
  input: OfferedSubjectUpdateInput
) {
  const result = await updateOfferedSubjectServer(id, input);
  revalidateTag(OFFERED_SUBJECTS_TAG, { expire: 0 });
  revalidateTag(offeredSubjectTag(id), { expire: 0 });
  return result;
}

export async function deleteOfferedSubjectAction(id: string) {
  const result = await deleteOfferedSubjectServer(id);
  revalidateTag(OFFERED_SUBJECTS_TAG, { expire: 0 });
  revalidateTag(offeredSubjectTag(id), { expire: 0 });
  return result;
}
