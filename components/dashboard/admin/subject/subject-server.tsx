import { getSubjectsServer } from "@/lib/api/dashboard/admin/subject/server";
import type { PaginationMeta, Subject } from "@/lib/type/dashboard/admin/subject";
import type { SubjectServerProps } from "@/lib/type/dashboard/admin/subject/ui";
import { SubjectPage } from "./subject-page";

export async function SubjectPageServer({
  searchTerm,
  page,
  limit,
  sort,
}: SubjectServerProps) {
  const listFields = "title,code,credits,subjectType,markingScheme";

  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Subject[] = [];
  let meta = fallbackMeta;

  try {
    const subjectsResult = await getSubjectsServer({
      searchTerm,
      page,
      limit,
      sort,
      fields: listFields,
    });
    items = subjectsResult.result ?? [];
    meta = subjectsResult.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <SubjectPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      error={error}
    />
  );
}
