"use server";

import { revalidateTag } from "next/cache";
import type { StudentCreatePayload, StudentStatus } from "@/lib/type/dashboard/admin/student";
import {
  changeStudentStatusServer,
  createStudentServer,
  STUDENTS_TAG,
  studentTag,
  userTag,
} from "@/lib/api/dashboard/admin/student/server";

export async function createStudentAction(
  payload: StudentCreatePayload,
  file?: File | null
) {
  const result = await createStudentServer(payload, file);
  revalidateTag(STUDENTS_TAG, { expire: 0 });
  if (result?.id) {
    revalidateTag(studentTag(result.id), { expire: 0 });
  }
  if (result?.user?._id) {
    revalidateTag(userTag(result.user._id), { expire: 0 });
  }
  return result;
}

export async function changeStudentStatusAction(
  userId: string,
  status: StudentStatus,
  studentId?: string
) {
  const result = await changeStudentStatusServer(userId, status);
  revalidateTag(STUDENTS_TAG, { expire: 0 });
  if (studentId) {
    revalidateTag(studentTag(studentId), { expire: 0 });
  }
  revalidateTag(userTag(userId), { expire: 0 });
  return result;
}
