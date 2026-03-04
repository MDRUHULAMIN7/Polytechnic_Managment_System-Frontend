"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  AcademicSemesterName,
  AcademicSemesterSortOption,
} from "@/lib/type/dashboard/admin/academic-semester";
import type { AcademicSemesterPageProps } from "@/lib/type/dashboard/admin/academic-semester/ui";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { AcademicSemesterFilters } from "@/components/dashboard/admin/academic-semester/academic-semester-filters";
import { AcademicSemesterPagination } from "@/components/dashboard/admin/academic-semester/academic-semester-pagination";
import { AcademicSemesterTable } from "@/components/dashboard/admin/academic-semester/academic-semester-table";

export function AcademicSemesterPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  name,
  error,
}: AcademicSemesterPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [nameFilter, setNameFilter] = useState<AcademicSemesterName | "">(name);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setNameFilter(name);
  }, [name]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: AcademicSemesterSortOption | null;
    name?: AcademicSemesterName | "" | null;
  }) {
    updateListSearchParams({
      pathname,
      searchParams,
      router,
      startTransition,
      clearKeys: ["startsWith"],
      entries: [
        ["searchTerm", next.searchTerm],
        ["page", next.page],
        ["limit", next.limit],
        ["sort", next.sort],
        ["name", next.name],
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
            Student Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Academic Semesters
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View academic semesters and their schedules.
          </p>
        </div>
      </div>

      <AcademicSemesterFilters
        search={searchInput}
        sort={sort}
        name={nameFilter}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as AcademicSemesterSortOption,
            page: 1,
          })
        }
        onNameChange={(value) => {
          setNameFilter(value);
          updateParams({
            name: value || null,
            page: 1,
          });
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
                description: "Fetching academic semesters again.",
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

      <AcademicSemesterTable
        items={items}
        loading={isPending}
        error={error}
        basePath="/dashboard/student/academic-semesters"
        showEdit={false}
        actionsLabel="View"
      />

      <AcademicSemesterPagination
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
