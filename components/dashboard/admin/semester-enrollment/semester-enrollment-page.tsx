"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SemesterEnrollmentSortOption } from "@/lib/type/dashboard/admin/semester-enrollment";
import type { SemesterEnrollmentPageProps } from "@/lib/type/dashboard/admin/semester-enrollment/ui";
import { showToast } from "@/utils/common/toast";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { SemesterEnrollmentFilters } from "./semester-enrollment-filters";
import { SemesterEnrollmentPagination } from "./semester-enrollment-pagination";
import { SemesterEnrollmentTable } from "./semester-enrollment-table";

export function SemesterEnrollmentPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  status,
  error,
}: SemesterEnrollmentPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(status);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter(status);
  }, [status]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: SemesterEnrollmentSortOption | null;
    status?: string | null;
  }) {
    updateListSearchParams({
      pathname,
      searchParams,
      router,
      startTransition,
      entries: [
        ["searchTerm", next.searchTerm],
        ["page", next.page],
        ["limit", next.limit],
        ["sort", next.sort],
        ["status", next.status],
      ],
      defaults: { page: 1, limit: 10, sort: "-createdAt" },
    });
  }

  useEffect(() => {
    if (debouncedSearch === searchTerm) {
      return;
    }

    updateParams({
      searchTerm: debouncedSearch.trim() ? debouncedSearch : null,
      page: 1,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, searchTerm]);

  return (
    <section className="space-y-5">
      <DashboardPageHeader
        title="Semester Enrollments"
        description="Review semester enrollment status and payment details."
      />

      <SemesterEnrollmentFilters
        search={searchInput}
        sort={sort}
        status={statusFilter}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as SemesterEnrollmentSortOption,
            page: 1,
          })
        }
        onStatusChange={(value) => {
          setStatusFilter(value);
          updateParams({ status: value || null, page: 1 });
        }}
      />

      <DashboardErrorBanner
        error={error}
        action={
          <button
            type="button"
            onClick={() => {
              showToast({
                variant: "info",
                title: "Retrying",
                description: "Fetching semester enrollments again.",
              });
              startTransition(() => {
                router.refresh();
              });
            }}
            className="ml-3 inline-flex items-center rounded-lg border border-red-400/60 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        }
      />

      <SemesterEnrollmentTable items={items} loading={isPending} error={error} />

      <SemesterEnrollmentPagination
        meta={meta}
        page={page}
        limit={limit}
        onPageChange={(nextPage) => updateParams({ page: nextPage })}
        onLimitChange={(nextLimit) =>
          updateParams({
            limit: nextLimit,
            page: 1,
          })
        }
      />
    </section>
  );
}
