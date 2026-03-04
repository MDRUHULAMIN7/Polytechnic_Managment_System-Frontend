import { getSemesterRegistrationsServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import type {
  PaginationMeta,
  SemesterRegistration,
} from "@/lib/type/dashboard/admin/semester-registration";
import type { SemesterRegistrationServerProps } from "@/lib/type/dashboard/admin/semester-registration/ui";
import { SemesterRegistrationPage } from "./semester-registration-page";

export async function SemesterRegistrationPageServer({
  searchTerm,
  page,
  limit,
  sort,
  status,
  shift,
}: SemesterRegistrationServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: SemesterRegistration[] = [];
  let meta = fallbackMeta;

  try {
    const result = await getSemesterRegistrationsServer({
      searchTerm,
      page,
      limit,
      sort,
      status: status || undefined,
      shift: shift || undefined,
    });
    items = result.result ?? [];
    meta = result.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <SemesterRegistrationPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      status={status}
      shift={shift}
      error={error}
    />
  );
}
