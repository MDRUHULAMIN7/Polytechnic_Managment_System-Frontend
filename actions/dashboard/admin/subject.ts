"use server";

import { revalidateTag } from "next/cache";
import type { SubjectInput } from "@/lib/type/dashboard/admin/subject";
import {
  SUBJECTS_TAG,
  subjectInstructorTag,
  subjectTag,
  assignInstructorsServer,
  createSubjectServer,
  deleteSubjectServer,
  getSubjectsServer,
  getSubjectServer,
  getSubjectInstructorsServer,
  removeInstructorsServer,
  updateSubjectServer,
} from "@/lib/api/dashboard/admin/subject/server";
import { getInstructorsServer } from "@/lib/api/dashboard/admin/instructor/server";

export async function updateSubjectAction(
  id: string,
  input: Partial<SubjectInput>
) {
  const result = await updateSubjectServer(id, input);
  revalidateTag(SUBJECTS_TAG, { expire: 0 });
  revalidateTag(subjectTag(id), { expire: 0 });
  return result;
}

export async function createSubjectAction(input: SubjectInput) {
  const result = await createSubjectServer(input);
  revalidateTag(SUBJECTS_TAG, { expire: 0 });
  return result;
}

export async function deleteSubjectAction(id: string) {
  const result = await deleteSubjectServer(id);
  revalidateTag(SUBJECTS_TAG, { expire: 0 });
  revalidateTag(subjectTag(id), { expire: 0 });
  return result;
}

export async function assignInstructorsAction(
  subjectId: string,
  instructors: string[]
) {
  const result = await assignInstructorsServer(subjectId, instructors);
  revalidateTag(SUBJECTS_TAG, { expire: 0 });
  revalidateTag(subjectTag(subjectId), { expire: 0 });
  revalidateTag(subjectInstructorTag(subjectId), { expire: 0 });
  return result;
}

export async function removeInstructorsAction(
  subjectId: string,
  instructors: string[]
) {
  const result = await removeInstructorsServer(subjectId, instructors);
  revalidateTag(SUBJECTS_TAG, { expire: 0 });
  revalidateTag(subjectTag(subjectId), { expire: 0 });
  revalidateTag(subjectInstructorTag(subjectId), { expire: 0 });
  return result;
}

export async function getSubjectInstructorsAction(subjectId: string) {
  return getSubjectInstructorsServer(subjectId);
}

export async function getInstructorsAction(params: {
  page?: number;
  limit?: number;
}) {
  return getInstructorsServer({
    page: params.page ?? 1,
    limit: params.limit ?? 1000,
  });
}

export async function getSubjectsAction(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  fields?: string;
}) {
  return getSubjectsServer({
    page: params.page ?? 1,
    limit: params.limit ?? 1000,
    searchTerm: params.searchTerm,
    sort: params.sort,
    fields: params.fields,
  });
}

export async function getSubjectAction(id: string) {
  return getSubjectServer(id);
}
