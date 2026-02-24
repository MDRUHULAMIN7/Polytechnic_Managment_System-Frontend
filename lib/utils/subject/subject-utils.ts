import type {
  ApiMeta,
  InstructorProfile,
  SubjectPreRequisite,
  SubjectProfile,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import type {
  CreateSubjectFormValues,
  SubjectTableRow,
  UpdateSubjectFormValues,
} from "@/lib/types/utils/subject.types";

export type {
  CreateSubjectFormValues,
  UpdateSubjectFormValues,
} from "@/lib/types/utils/subject.types";
export type {
  InstructorAssignOption,
  SubjectFormValues,
  SubjectOption,
  SubjectSort,
  SubjectTableRow,
} from "@/lib/types/utils/subject.types";

export const SUBJECT_TABLE_FIELDS = [
  "_id",
  "title",
  "prefix",
  "code",
  "credits",
  "regulation",
  "preRequisiteSubjects",
] as const;

export const SUBJECT_TABLE_PAGE_SIZES = [5, 10, 20] as const;
export const SUBJECT_SORT_OPTIONS = ["title", "-title"] as const;
export const SUBJECT_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "title",
  page: 1,
  limit: 10,
};
export const SUBJECT_DEFAULT_META: ApiMeta = {
  page: SUBJECT_DEFAULT_TABLE_STATE.page,
  limit: SUBJECT_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const EMPTY_CREATE_SUBJECT_FORM: CreateSubjectFormValues = {
  title: "",
  prefix: "",
  code: "",
  credits: "",
  regulation: "",
  preRequisiteSubjectIds: [],
};

export const EMPTY_UPDATE_SUBJECT_FORM: UpdateSubjectFormValues = {
  ...EMPTY_CREATE_SUBJECT_FORM,
};

export function parseNumericInput(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function resolveSubjectCode(
  row: Pick<SubjectProfile, "prefix" | "code"> | null | undefined,
) {
  if (!row) return "-";
  return `${row.prefix}${row.code}`;
}

export function resolvePreRequisiteCount(
  row: Pick<SubjectProfile, "preRequisiteSubjects"> | null | undefined,
) {
  if (!row?.preRequisiteSubjects || row.preRequisiteSubjects.length === 0)
    return 0;
  return row.preRequisiteSubjects.filter((item) => !item.isDeleted).length;
}

export function resolvePreRequisiteLabel(
  item: SubjectPreRequisite | null | undefined,
) {
  if (!item?.subject) return "-";
  if (typeof item.subject === "string") return item.subject;

  const title = item.subject.title?.trim();
  const prefix = item.subject.prefix?.trim();
  const code = item.subject.code;

  if (title) return title;
  if (prefix && typeof code === "number") return `${prefix}${code}`;
  return item.subject._id;
}

export function resolvePreRequisiteSubjectId(
  item: SubjectPreRequisite | null | undefined,
) {
  if (!item?.subject) return null;
  return typeof item.subject === "string" ? item.subject : item.subject._id;
}

export function resolveActivePreRequisiteIds(
  row: SubjectTableRow | null,
): string[] {
  if (!row?.preRequisiteSubjects || row.preRequisiteSubjects.length === 0)
    return [];

  const ids = row.preRequisiteSubjects
    .filter((item) => !item.isDeleted)
    .map((item) => resolvePreRequisiteSubjectId(item))
    .filter((id): id is string => Boolean(id));

  return [...new Set<string>(ids)];
}

export function resolveInstructorFullName(
  row: Pick<InstructorProfile, "name"> | null | undefined,
) {
  const first = row?.name?.firstName?.trim() ?? "";
  const middle = row?.name?.middleName?.trim() ?? "";
  const last = row?.name?.lastName?.trim() ?? "";
  return [first, middle, last].filter(Boolean).join(" ") || "-";
}
