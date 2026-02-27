import { getAcademicInstructorsServer } from "@/lib/api/dashboard/admin/academic-instructor/server";
import type { PaginationMeta } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicInstructorServerProps } from "@/lib/type/dashboard/admin/academic-instructor/ui";
import { AcademicInstructorPage } from "./academic-instructor-page";

export async function AcademicInstructorPageServer({
  searchTerm,
  page,
  limit,
  sort,
}: AcademicInstructorServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let data = null;

  try {
    data = await getAcademicInstructorsServer({
      searchTerm,
      page,
      limit,
      sort,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <AcademicInstructorPage
      items={data?.result ?? []}
      meta={data?.meta ?? fallbackMeta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      error={error}
    />
  );
}
