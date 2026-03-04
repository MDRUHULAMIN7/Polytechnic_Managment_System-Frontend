import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import type {
  OfferedSubject,
  PaginationMeta,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { OfferedSubjectServerProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { OfferedSubjectPage } from "./offered-subject-page";

export async function OfferedSubjectPageServer({
  searchTerm,
  page,
  limit,
  sort,
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
      error={error}
    />
  );
}
