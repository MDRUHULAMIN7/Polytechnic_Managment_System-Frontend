"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AcademicDepartmentSortOption } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicDepartmentPageProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import { showToast } from "@/utils/common/toast";
import { AcademicDepartmentFilters } from "./academic-department-filters";
import { AcademicDepartmentPagination } from "./academic-department-pagination";
import { AcademicDepartmentTable } from "./academic-department-table";
import { AcademicDepartmentFormModal } from "./academic-department-form-modal";

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}

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
    const params = new URLSearchParams(searchParams.toString());

    if (params.has("startsWith")) {
      params.delete("startsWith");
    }

    const entries: Array<[string, string | number | null | undefined]> = [
      ["searchTerm", next.searchTerm],
      ["page", next.page],
      ["limit", next.limit],
      ["sort", next.sort],
      ["academicInstructor", next.academicInstructor],
    ];

    for (const [key, value] of entries) {
      if (value === undefined) {
        continue;
      }

      if (value === null || value === "") {
        params.delete(key);
        continue;
      }

      params.set(key, String(value));
    }

    if (next.page !== undefined && (next.page === null || next.page <= 1)) {
      params.delete("page");
    }

    if (next.limit !== undefined && (next.limit === null || next.limit === 10)) {
      params.delete("limit");
    }

    if (next.sort !== undefined && (next.sort === null || next.sort === "-createdAt")) {
      params.delete("sort");
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    if (nextUrl !== `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`) {
      startTransition(() => {
        router.push(nextUrl, { scroll: false });
      });
    }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Academic Departments
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Manage academic departments, filter by instructor, and edit details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
        >
          Create Department
        </button>
      </div>

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

      {error ? (
        <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
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
        </div>
      ) : null}

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
