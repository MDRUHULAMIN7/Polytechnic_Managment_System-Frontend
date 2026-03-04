import { getSemesterEnrollmentsServer } from "@/lib/api/dashboard/admin/semester-enrollment/server";
import { getCurriculumsServer } from "@/lib/api/dashboard/admin/curriculum/server";
import type {
  PaginationMeta,
  SemesterEnrollment,
} from "@/lib/type/dashboard/admin/semester-enrollment";
import type { Curriculum } from "@/lib/type/dashboard/admin/curriculum";
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
  let curriculums: Curriculum[] = [];

  try {
    const [enrollmentResult, curriculumResult] = await Promise.allSettled([
      getSemesterEnrollmentsServer({
        searchTerm,
        page,
        limit,
        sort,
        status: status || undefined,
      }),
      getCurriculumsServer({ page: 1, limit: 200, sort: "-createdAt" }),
    ]);

    if (enrollmentResult.status === "fulfilled") {
      items = enrollmentResult.value.result ?? [];
      meta = enrollmentResult.value.meta ?? fallbackMeta;
    } else {
      throw enrollmentResult.reason;
    }

    if (curriculumResult.status === "fulfilled") {
      curriculums = curriculumResult.value.result ?? [];
    }
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
      curriculums={curriculums}
      error={error}
    />
  );
}
