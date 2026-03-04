import { getCurriculumsServer } from "@/lib/api/dashboard/admin/curriculum/server";
import type { Curriculum, PaginationMeta } from "@/lib/type/dashboard/admin/curriculum";
import type { CurriculumServerProps } from "@/lib/type/dashboard/admin/curriculum/ui";
import { CurriculumPage } from "./curriculum-page";

export async function CurriculumPageServer({
  searchTerm,
  page,
  limit,
  sort,
}: CurriculumServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Curriculum[] = [];
  let meta = fallbackMeta;

  try {
    const data = await getCurriculumsServer({
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
    <CurriculumPage
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
