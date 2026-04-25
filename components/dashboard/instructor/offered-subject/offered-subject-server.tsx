import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import type {
  OfferedSubject,
  PaginationMeta,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { OfferedSubjectServerProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { OfferedSubjectPage } from "./offered-subject-page";

const OFFERED_SUBJECT_TABLE_FIELDS =
  "subject,instructor,academicSemester,maxCapacity";

export async function OfferedSubjectPageServer({
  searchTerm,
  page,
  limit,
  sort,
  scope = "all",
}: OfferedSubjectServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: OfferedSubject[] = [];
  let meta = fallbackMeta;

  try {
    const data = await getOfferedSubjectsServer({
      searchTerm,
      page,
      limit,
      sort,
      scope,
      fields: OFFERED_SUBJECT_TABLE_FIELDS,
    });
    items = data.result ?? [];
    meta = data.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <OfferedSubjectPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      scope={scope}
      error={error}
    />
  );
}
