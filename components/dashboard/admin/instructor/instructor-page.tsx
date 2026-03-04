"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { InstructorSortOption, InstructorStatus } from "@/lib/type/dashboard/admin/instructor";
import type { InstructorPageProps } from "@/lib/type/dashboard/admin/instructor/ui";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { InstructorFilters } from "./instructor-filters";
import { InstructorPagination } from "./instructor-pagination";
import { InstructorTable } from "./instructor-table";
import { InstructorFormModal } from "./instructor-form-modal";
import { changeInstructorStatusAction } from "@/actions/dashboard/admin/instructor";

export function InstructorPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  departments,
  academicDepartment,
  error,
  canChangeStatus,
}: InstructorPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [departmentFilter, setDepartmentFilter] = useState(academicDepartment);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setDepartmentFilter(academicDepartment);
  }, [academicDepartment]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: InstructorSortOption | null;
    academicDepartment?: string | null;
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
        ["academicDepartment", next.academicDepartment],
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

  async function handleStatusChange(
    instructor: InstructorPageProps["items"][number],
    status: InstructorStatus
  ) {
    if (!canChangeStatus) {
      showToast({
        variant: "error",
        title: "Not allowed",
        description: "Only super admin can change instructor status.",
      });
      return;
    }

    const userId = instructor.user?._id;
    if (!userId) {
      showToast({
        variant: "error",
        title: "Missing user",
        description: "Unable to update status for this instructor.",
      });
      return;
    }

    setStatusUpdatingId(userId);
    try {
      await changeInstructorStatusAction(userId, status, instructor._id);
      showToast({
        variant: "success",
        title: "Status updated",
        description: `Instructor status set to ${status}.`,
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unable to update status.",
      });
    } finally {
      setStatusUpdatingId(null);
    }
  }

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
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Instructors</h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Manage instructors, update status, and create new profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
        >
          Create Instructor
        </button>
      </div>

      <InstructorFilters
        search={searchInput}
        sort={sort}
        academicDepartment={departmentFilter}
        departments={departments}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as InstructorSortOption,
            page: 1,
          })
        }
        onDepartmentChange={(value) => {
          setDepartmentFilter(value);
          updateParams({
            academicDepartment: value || null,
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
                description: "Fetching instructors again.",
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

      <InstructorTable
        items={items}
        loading={isPending}
        error={error}
        statusUpdatingId={statusUpdatingId}
        canChangeStatus={canChangeStatus}
        onStatusChange={handleStatusChange}
      />

      <InstructorPagination
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

      <InstructorFormModal
        open={createOpen}
        departments={departments}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
