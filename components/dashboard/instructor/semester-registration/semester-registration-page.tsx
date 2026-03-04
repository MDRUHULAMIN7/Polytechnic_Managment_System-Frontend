"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SemesterRegistrationSortOption } from "@/lib/type/dashboard/admin/semester-registration";
import type { SemesterRegistrationPageProps } from "@/lib/type/dashboard/admin/semester-registration/ui";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { SemesterRegistrationFilters } from "@/components/dashboard/admin/semester-registration/semester-registration-filters";
import { SemesterRegistrationPagination } from "@/components/dashboard/admin/semester-registration/semester-registration-pagination";
import { SemesterRegistrationTable } from "@/components/dashboard/admin/semester-registration/semester-registration-table";

export function SemesterRegistrationPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  status,
  shift,
  error,
}: SemesterRegistrationPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(status);
  const [shiftFilter, setShiftFilter] = useState(shift);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter(status);
    setShiftFilter(shift);
  }, [status, shift]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: SemesterRegistrationSortOption | null;
    status?: string | null;
    shift?: string | null;
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
        ["shift", next.shift],
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Instructor Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Semester Registrations
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View registration windows and semester schedules.
          </p>
        </div>
      </div>

      <SemesterRegistrationFilters
        search={searchInput}
        sort={sort}
        status={statusFilter}
        shift={shiftFilter}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as SemesterRegistrationSortOption,
            page: 1,
          })
        }
        onStatusChange={(value) => {
          setStatusFilter(value);
          updateParams({ status: value || null, page: 1 });
        }}
        onShiftChange={(value) => {
          setShiftFilter(value);
          updateParams({ shift: value || null, page: 1 });
        }}
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
                description: "Fetching semester registrations again.",
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

      <SemesterRegistrationTable
        items={items}
        loading={isPending}
        error={error}
        basePath="/dashboard/instructor/semester-registrations"
        showEdit={false}
        showDelete={false}
        actionsLabel="View"
      />

      <SemesterRegistrationPagination
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
