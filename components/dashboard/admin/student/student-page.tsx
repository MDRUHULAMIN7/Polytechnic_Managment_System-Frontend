"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { StudentSortOption, StudentStatus } from "@/lib/type/dashboard/admin/student";
import type { StudentPageProps } from "@/lib/type/dashboard/admin/student/ui";
import { showToast } from "@/utils/common/toast";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { StudentFilters } from "./student-filters";
import { StudentPagination } from "./student-pagination";
import { StudentTable } from "./student-table";
import { StudentFormModal } from "./student-form-modal";
import { changeStudentStatusAction } from "@/actions/dashboard/admin/student";

export function StudentPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  academicDepartment,
  admissionSemester,
  departments,
  semesters,
  canChangeStatus,
  error,
}: StudentPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [departmentFilter, setDepartmentFilter] = useState(academicDepartment);
  const [semesterFilter, setSemesterFilter] = useState(admissionSemester);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setDepartmentFilter(academicDepartment);
  }, [academicDepartment]);

  useEffect(() => {
    setSemesterFilter(admissionSemester);
  }, [admissionSemester]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: StudentSortOption | null;
    academicDepartment?: string | null;
    admissionSemester?: string | null;
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
        ["academicDepartment", next.academicDepartment],
        ["admissionSemester", next.admissionSemester],
      ],
      defaults: { page: 1, limit: 10, sort: "-createdAt" },
    });
  }

  function resetListFilters() {
    setSearchInput("");
    setDepartmentFilter("");
    setSemesterFilter("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (createOpen) {
      return;
    }

    if (debouncedSearch === searchTerm) {
      return;
    }

    updateParams({
      searchTerm: debouncedSearch.trim() ? debouncedSearch : null,
      page: 1,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, searchTerm, createOpen]);

  async function handleStatusChange(student: StudentPageProps["items"][number], status: StudentStatus) {
    if (!canChangeStatus) {
      showToast({
        variant: "error",
        title: "Not allowed",
        description: "Only super admin can change student status.",
      });
      return;
    }

    const userId = student.user?._id;
    if (!userId) {
      showToast({
        variant: "error",
        title: "Missing user",
        description: "Unable to update status for this student.",
      });
      return;
    }

    setStatusUpdatingId(userId);
    try {
      await changeStudentStatusAction(userId, status, student.id);
      showToast({
        variant: "success",
        title: "Status updated",
        description: `Student status set to ${status}.`,
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
      <DashboardPageHeader
        title="Students"
        description="Manage students, update status, and create new profiles."
        action={
          <button
            type="button"
            onClick={() => {
              resetListFilters();
              setCreateOpen(true);
            }}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Student
          </button>
        }
      />

      <StudentFilters
        search={searchInput}
        sort={sort}
        academicDepartment={departmentFilter}
        admissionSemester={semesterFilter}
        departments={departments}
        semesters={semesters}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as StudentSortOption,
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
        onSemesterChange={(value) => {
          setSemesterFilter(value);
          updateParams({
            admissionSemester: value || null,
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
                description: "Fetching students again.",
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

      <StudentTable
        items={items}
        loading={isPending}
        error={error}
        statusUpdatingId={statusUpdatingId}
        canChangeStatus={canChangeStatus}
        onStatusChange={handleStatusChange}
      />

      <StudentPagination
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

      <StudentFormModal
        open={createOpen}
        departments={departments}
        semesters={semesters}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
