"use server";

import { revalidateTag } from "next/cache";
import type {
  InstructorCreatePayload,
  InstructorStatus,
} from "@/lib/type/dashboard/admin/instructor";
import {
  INSTRUCTORS_TAG,
  changeInstructorStatusServer,
  createInstructorServer,
  instructorTag,
  userTag,
} from "@/lib/api/dashboard/admin/instructor/server";

export async function createInstructorAction(
  payload: InstructorCreatePayload,
  file?: File | null
) {
  const result = await createInstructorServer(payload, file);
  revalidateTag(INSTRUCTORS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(instructorTag(result._id), { expire: 0 });
  }
  if (result?.user?._id) {
    revalidateTag(userTag(result.user._id), { expire: 0 });
  }
  return result;
}

export async function changeInstructorStatusAction(
  userId: string,
  status: InstructorStatus,
  instructorId?: string
) {
  const result = await changeInstructorStatusServer(userId, status);
  revalidateTag(INSTRUCTORS_TAG, { expire: 0 });
  if (instructorId) {
    revalidateTag(instructorTag(instructorId), { expire: 0 });
  }
  revalidateTag(userTag(userId), { expire: 0 });
  return result;
}
