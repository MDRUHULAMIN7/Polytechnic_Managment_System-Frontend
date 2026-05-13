"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Instructor, InstructorSortOption, InstructorStatus } from "@/lib/type/dashboard/admin/instructor";
import type { InstructorPageProps } from "@/lib/type/dashboard/admin/instructor/ui";
import type {
  OfferedSubject,
  OfferedSubjectDay,
  OfferedSubjectScheduleBlock,
} from "@/lib/type/dashboard/admin/offered-subject";
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

const WEEK_DAYS: OfferedSubjectDay[] = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

function instructorDisplayName(instructor: Instructor | null) {
  if (!instructor) return "";
  return [instructor.name.firstName, instructor.name.middleName, instructor.name.lastName]
    .filter(Boolean)
    .join(" ");
}

function resolveSubjectTitle(item: OfferedSubject) {
  if (typeof item.subject === "string") {
    return item.subject;
  }
  return item.subject?.title?.trim() || "Subject";
}

function resolveRoomLabel(room: OfferedSubjectScheduleBlock["room"]) {
  if (typeof room !== "string") {
    return room ? `${room.roomName} ${room.roomNumber}`.trim() : "Room";
  }
  return room.trim() ? room : "Room";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offeredSubjects, setOfferedSubjects] = useState<OfferedSubject[]>([]);
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig | null>(null);

  useEffect(() => {
    if (!open || !instructor?._id) return;

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getActivePeriodConfig(),
      getOfferedSubjects({
        page: 1,
        limit: 1000,
        sort: "-createdAt",
        instructor: instructor._id,
      }),
    ])
      .then(([activeConfig, offered]) => {
        if (!active) return;
        setPeriodConfig(activeConfig);
        setOfferedSubjects(offered.result ?? []);
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load instructor schedule.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, instructor?._id]);

  const schedulablePeriods = useMemo(
    () =>
      [...(periodConfig?.periods ?? [])]
        .filter((period) => period.isActive !== false && period.isBreak !== true)
        .sort((left, right) => left.periodNo - right.periodNo),
    [periodConfig],
  );

  const occupancy = useMemo(() => {
    const map = new Map<string, { subject: string; room: string; classType: string }>();

    offeredSubjects.forEach((offeredSubject) => {
      offeredSubject.scheduleBlocks?.forEach((block) => {
        const subject = resolveSubjectTitle(offeredSubject);
        const room = resolveRoomLabel(block.room);

        for (
          let period = block.startPeriod;
          period < block.startPeriod + block.periodCount;
          period += 1
        ) {
          map.set(`${block.day}-${period}`, {
            subject,
            room,
            classType: block.classType,
          });
        }
      });
    });

    return map;
  }, [offeredSubjects]);

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
      {loading ? (
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded-lg bg-(--surface-muted)" />
          <div className="h-48 animate-pulse rounded-lg bg-(--surface-muted)" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : schedulablePeriods.length === 0 ? (
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) p-4 text-sm text-(--text-dim)">
          No active period configuration found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-300">
              Blocked (teaching)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">
              Free
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-(--line)">
            <table className="min-w-full text-xs">
              <thead className="bg-(--surface-muted)">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-(--text-dim)">
                    Day / Period
                  </th>
                  {schedulablePeriods.map((period) => (
                    <th
                      key={period.periodNo}
                      className="px-3 py-2 text-left font-semibold text-(--text-dim)"
                    >
                      <div>P{period.periodNo}</div>
                      <div className="text-[10px] font-normal opacity-70">
                        {period.startTime}-{period.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK_DAYS.map((day) => (
                  <tr key={day} className="border-t border-(--line)">
                    <td className="px-3 py-2 font-semibold text-(--text-dim)">{day}</td>
                    {schedulablePeriods.map((period) => {
                      const slot = occupancy.get(`${day}-${period.periodNo}`);
                      return (
                        <td
                          key={`${day}-${period.periodNo}`}
                          className="px-2 py-2 align-top"
                        >
                          {slot ? (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2">
                              <p className="font-semibold text-(--text)">{slot.subject}</p>
                              <p className="mt-1 text-[10px] text-(--text-dim)">{slot.room}</p>
                              <p className="mt-1 text-[10px] uppercase text-red-300">
                                {slot.classType}
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11px] font-medium text-emerald-300">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
