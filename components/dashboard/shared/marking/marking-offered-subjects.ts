import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import type {
  OfferedSubject,
  OfferedSubjectScopeOption,
} from "@/lib/type/dashboard/admin/offered-subject";

const MARKING_PAGE_FIELDS =
  "semesterRegistration,subject,instructor,days,startTime,endTime,markingStatus";

export async function loadMarkingOfferedSubjects(
  scope?: OfferedSubjectScopeOption,
): Promise<OfferedSubject[]> {
  const firstPage = await getOfferedSubjectsServer({
    scope,
    sort: "-createdAt",
    page: 1,
    limit: 100,
    fields: MARKING_PAGE_FIELDS,
  });

  const totalPages = Math.max(firstPage.meta.totalPage ?? 1, 1);

  if (totalPages === 1) {
    return firstPage.result ?? [];
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getOfferedSubjectsServer({
        scope,
        sort: "-createdAt",
        page: index + 2,
        limit: 100,
        fields: MARKING_PAGE_FIELDS,
      }),
    ),
  );

  return [
    ...(firstPage.result ?? []),
    ...remainingPages.flatMap((page) => page.result ?? []),
  ];
}
