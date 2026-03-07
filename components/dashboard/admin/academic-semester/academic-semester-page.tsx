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
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { AcademicSemesterFilters } from "./academic-semester-filters";
import { AcademicSemesterPagination } from "./academic-semester-pagination";
import { AcademicSemesterTable } from "./academic-semester-table";
import { AcademicSemesterFormModal } from "./academic-semester-form-modal";

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
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof items[number] | null>(null);

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

  function handleSaved() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <DashboardPageHeader
        title="Academic Semesters"
        description="Manage academic semesters, search, and edit details."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Semester
          </button>
        }
      />

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

      <DashboardErrorBanner
        error={error}
        action={
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
        }
      />

      <AcademicSemesterTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(item) => setEditItem(item)}
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

      <AcademicSemesterFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <AcademicSemesterFormModal
        open={Boolean(editItem)}
        mode="edit"
        semester={editItem}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />
    </section>
  );
}
