import type { InstructorProfile, SubjectProfile } from "@/lib/types/api";

export type SubjectSort = "title" | "-title";

export type SubjectTableRow = Pick<
  SubjectProfile,
  | "_id"
  | "title"
  | "prefix"
  | "code"
  | "credits"
  | "regulation"
  | "preRequisiteSubjects"
>;

export type SubjectOption = Pick<
  SubjectProfile,
  "_id" | "title" | "prefix" | "code"
>;

export type SubjectFormValues = {
  title: string;
  prefix: string;
  code: string;
  credits: string;
  regulation: string;
  preRequisiteSubjectIds: string[];
};

export type CreateSubjectFormValues = SubjectFormValues;
export type UpdateSubjectFormValues = SubjectFormValues;

export type InstructorAssignOption = Pick<
  InstructorProfile,
  "_id" | "id" | "name" | "designation" | "email"
>;
