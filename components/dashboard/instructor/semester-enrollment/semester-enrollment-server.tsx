import { getSemesterEnrollmentsServer } from "@/lib/api/dashboard/admin/semester-enrollment/server";
import type {
  PaginationMeta,
  SemesterEnrollment,
} from "@/lib/type/dashboard/admin/semester-enrollment";
import type { SemesterEnrollmentServerProps } from "@/lib/type/dashboard/admin/semester-enrollment/ui";
import { SemesterEnrollmentPage } from "./semester-enrollment-page";

export async function SemesterEnrollmentPageServer({
  searchTerm,
  page,
  limit,
  sort,
  status,
}: SemesterEnrollmentServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: SemesterEnrollment[] = [];
  let meta = fallbackMeta;

  try {
    const result = await getSemesterEnrollmentsServer({
      searchTerm,
      page,
      limit,
      sort,
      status: status || undefined,
    });
    items = result.result ?? [];
    meta = result.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <SemesterEnrollmentPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      status={status}
      error={error}
    />
  );
}
