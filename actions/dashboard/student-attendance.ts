"use server";

import { revalidateTag } from "next/cache";
import { CLASS_DASHBOARD_TAG, CLASS_SESSIONS_TAG, classSessionTag } from "@/lib/api/dashboard/class-session/tags";
import {
  submitStudentAttendanceServer,
  updateStudentAttendanceServer,
} from "@/lib/api/dashboard/student-attendance/server";
import type {
  AttendanceSubmissionInput,
  AttendanceUpdateInput,
} from "@/lib/type/dashboard/student-attendance";

export async function submitStudentAttendanceAction(
  input: AttendanceSubmissionInput,
) {
  const result = await submitStudentAttendanceServer(input);
  revalidateTag(CLASS_SESSIONS_TAG, { expire: 0 });
  revalidateTag(CLASS_DASHBOARD_TAG, { expire: 0 });
  revalidateTag(classSessionTag(input.classSessionId), { expire: 0 });
  return result;
}

export async function updateStudentAttendanceAction(
  id: string,
  classSessionId: string,
  input: AttendanceUpdateInput,
) {
  const result = await updateStudentAttendanceServer(id, input);
  revalidateTag(CLASS_SESSIONS_TAG, { expire: 0 });
  revalidateTag(CLASS_DASHBOARD_TAG, { expire: 0 });
  revalidateTag(classSessionTag(classSessionId), { expire: 0 });
  return result;
}
