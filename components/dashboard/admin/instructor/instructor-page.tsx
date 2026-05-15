"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Instructor, InstructorSortOption, InstructorStatus } from "@/lib/type/dashboard/admin/instructor";
import type { InstructorPageProps } from "@/lib/type/dashboard/admin/instructor/ui";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { PeriodConfig } from "@/lib/type/dashboard/admin/period-config";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { getActivePeriodConfig } from "@/lib/api/dashboard/admin/period-config";
import { showToast } from "@/utils/common/toast";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { InstructorFilters } from "./instructor-filters";
import { InstructorPagination } from "./instructor-pagination";
import { InstructorTable } from "./instructor-table";
import { InstructorFormModal } from "./instructor-form-modal";
import { changeInstructorStatusAction } from "@/actions/dashboard/admin/instructor";
import { Modal } from "./modal";
import { InstructorAvailabilityTable } from "./instructor-availability-table";

function instructorDisplayName(instructor: Instructor | null) {
  if (!instructor) return "";
  return [instructor.name.firstName, instructor.name.middleName, instructor.name.lastName]
    .filter(Boolean)
    .join(" ");
}

function InstructorAvailabilityModal({
  instructor,
  open,
  onClose,
}: {
  instructor: Instructor | null;
  open: boolean;
  onClose: () => void;
}) {
  const availabilityQuery = useQuery({
    queryKey: ["admin", "instructor-availability-modal", instructor?._id],
    queryFn: async (): Promise<{ periodConfig: PeriodConfig; offeredSubjects: OfferedSubject[] }> => {
      if (!instructor?._id) {
        throw new Error("Missing instructor.");
      }
      const [activeConfig, offered] = await Promise.all([
        getActivePeriodConfig(),
        getOfferedSubjects({
          page: 1,
          limit: 1000,
          sort: "-createdAt",
          instructor: instructor._id,
        }),
      ]);
      return {
        periodConfig: activeConfig,
        offeredSubjects: offered.result ?? [],
      };
    },
    enabled: Boolean(open && instructor?._id),
    staleTime: 30_000,
  });

  const periodConfig = availabilityQuery.data?.periodConfig ?? null;
  const offeredSubjects = availabilityQuery.data?.offeredSubjects ?? [];
  const loading = Boolean(open && instructor?._id && availabilityQuery.isPending);
  const error =
    availabilityQuery.error instanceof Error
      ? availabilityQuery.error.message
      : availabilityQuery.isError
        ? "Failed to load instructor schedule."
        : null;

  const schedulablePeriods = useMemo(
    () =>
      [...(periodConfig?.periods ?? [])]
        .filter((period) => period.isActive !== false && period.isBreak !== true)
        .sort((left, right) => left.periodNo - right.periodNo),
    [periodConfig],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        instructor
          ? `${instructorDisplayName(instructor)} · Weekly availability`
          : "Instructor availability"
      }
      description="Blocked = teaching a class in that period. Free = no assigned class (same semester offerings)."
    >
      <InstructorAvailabilityTable
        schedulablePeriods={schedulablePeriods}
        loading={loading}
        error={error}
        offeredSubjects={offeredSubjects}
      />
    </Modal>
  );
}

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
  const [availabilityInstructor, setAvailabilityInstructor] = useState<Instructor | null>(
    null,
  );
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
      <DashboardPageHeader
        title="Instructors"
        description="Manage instructors, update status, and create new profiles."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Instructor
          </button>
        }
      />

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

      <DashboardErrorBanner
        error={error}
        action={
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
        }
      />

      <InstructorTable
        items={items}
        loading={isPending}
        error={error}
        statusUpdatingId={statusUpdatingId}
        canChangeStatus={canChangeStatus}
        onStatusChange={handleStatusChange}
        onAvailability={(item) => setAvailabilityInstructor(item)}
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

      <InstructorAvailabilityModal
        open={Boolean(availabilityInstructor)}
        instructor={availabilityInstructor}
        onClose={() => setAvailabilityInstructor(null)}
      />
    </section>
  );
}
