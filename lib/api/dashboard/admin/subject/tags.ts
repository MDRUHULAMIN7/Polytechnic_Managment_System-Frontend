export const SUBJECTS_TAG = "subjects";

export function subjectTag(id: string) {
  return `subject:${id}`;
}

export function subjectInstructorTag(id: string) {
  return `subject-instructors:${id}`;
}
