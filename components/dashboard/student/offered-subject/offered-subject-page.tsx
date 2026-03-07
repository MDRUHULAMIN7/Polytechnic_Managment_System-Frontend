"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OfferedSubjectSortOption } from "@/lib/type/dashboard/admin/offered-subject";
import type { OfferedSubjectListPageProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { OfferedSubjectFilters } from "@/components/dashboard/admin/offered-subject/offered-subject-filters";
import { OfferedSubjectPagination } from "@/components/dashboard/admin/offered-subject/offered-subject-pagination";
import { OfferedSubjectTable } from "@/components/dashboard/admin/offered-subject/offered-subject-table";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";

export function OfferedSubjectPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  error,
}: OfferedSubjectListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: OfferedSubjectSortOption | null;
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
        title="Offered Subjects"
        description="Review offered subjects, schedules, and seat capacity."
      />

      <OfferedSubjectFilters
        search={searchInput}
        sort={sort}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as OfferedSubjectSortOption,
            page: 1,
          })
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button
            type="button"
            onClick={() => {
              showToast({
                variant: "info",
                title: "Retrying",
                description: "Fetching offered subjects again.",
              });
              startTransition(() => {
                router.refresh();
              });
            }}
            className="ml-3 inline-flex items-center rounded-lg border border-red-400/60 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      ) : null}

      <OfferedSubjectTable
        items={items}
        loading={isPending}
        error={error}
        basePath="/dashboard/student/offered-subjects"
        showEdit={false}
        showDelete={false}
        actionsLabel="View"
      />

      <OfferedSubjectPagination
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
