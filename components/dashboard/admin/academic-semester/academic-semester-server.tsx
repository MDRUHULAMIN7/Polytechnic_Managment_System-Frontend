import { getAcademicSemestersServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import type { AcademicSemester, PaginationMeta } from "@/lib/type/dashboard/admin/academic-semester";
import type { AcademicSemesterServerProps } from "@/lib/type/dashboard/admin/academic-semester/ui";
import { AcademicSemesterPage } from "./academic-semester-page";

export async function AcademicSemesterPageServer({
  searchTerm,
  page,
  limit,
  sort,
  name,
}: AcademicSemesterServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: AcademicSemester[] = [];
  let meta = fallbackMeta;

  try {
    const data = await getAcademicSemestersServer({
      searchTerm,
      page,
      limit,
      sort,
      name: name || undefined,
    });
    items = data.result ?? [];
    meta = data.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <AcademicSemesterPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      name={name}
      error={error}
    />
  );
}
