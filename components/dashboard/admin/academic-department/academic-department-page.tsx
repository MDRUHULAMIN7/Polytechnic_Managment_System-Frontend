"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AcademicDepartmentSortOption } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicDepartmentPageProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { AcademicDepartmentFilters } from "./academic-department-filters";
import { AcademicDepartmentPagination } from "./academic-department-pagination";
import { AcademicDepartmentTable } from "./academic-department-table";
import { AcademicDepartmentFormModal } from "./academic-department-form-modal";

export function AcademicDepartmentPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  academicInstructor,
  instructors,
  error,
}: AcademicDepartmentPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [instructorFilter, setInstructorFilter] = useState(academicInstructor);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof items[number] | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setInstructorFilter(academicInstructor);
  }, [academicInstructor]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: AcademicDepartmentSortOption | null;
    academicInstructor?: string | null;
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
        ["academicInstructor", next.academicInstructor],
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
        title="Academic Departments"
        description="Manage academic departments, filter by instructor, and edit details."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Department
          </button>
        }
      />

      <AcademicDepartmentFilters
        search={searchInput}
        sort={sort}
        academicInstructor={instructorFilter}
        instructors={instructors}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as AcademicDepartmentSortOption,
            page: 1,
          })
        }
        onInstructorChange={(value) => {
          setInstructorFilter(value);
          updateParams({
            academicInstructor: value || null,
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
                description: "Fetching academic departments again.",
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

      <AcademicDepartmentTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(item) => setEditItem(item)}
      />

      <AcademicDepartmentPagination
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

      <AcademicDepartmentFormModal
        open={createOpen}
        mode="create"
        instructors={instructors}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <AcademicDepartmentFormModal
        open={Boolean(editItem)}
        mode="edit"
        department={editItem}
        instructors={instructors}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />
    </section>
  );
}
