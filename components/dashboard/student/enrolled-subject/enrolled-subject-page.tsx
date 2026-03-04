"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EnrolledSubject } from "@/lib/type/dashboard/admin/enrolled-subject";
import type { EnrolledSubjectListPageProps } from "@/lib/type/dashboard/admin/enrolled-subject/ui";
import { showToast } from "@/utils/common/toast";
import { EnrolledSubjectTable } from "./enrolled-subject-table";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { EnrolledSubjectDetailsModal } from "./enrolled-subject-details-modal";
import { EnrolledSubjectPagination } from "./enrolled-subject-pagination";

export function EnrolledSubjectPage({ items, error }: EnrolledSubjectListPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "enrolled" | "completed">(
    ""
  );
  const [selectedSubject, setSelectedSubject] = useState<EnrolledSubject | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    return items.filter((item) => {
      if (statusFilter === "completed" && !item.isCompleted) {
        return false;
      }
      if (statusFilter === "enrolled" && !item.isEnrolled) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const subjectTitle =
        typeof item.subject === "string"
          ? item.subject
          : `${item.subject?.title ?? ""} ${item.subject?.code ?? ""}`;
      const instructorName =
        typeof item.instructor === "string"
          ? item.instructor
          : resolveName(item.instructor?.name);
      const registration =
        typeof item.semesterRegistration === "string"
          ? item.semesterRegistration
          : `${item.semesterRegistration?.status ?? ""} ${item.semesterRegistration?.shift ?? ""}`;
      const schedule =
        typeof item.offeredSubject === "string"
          ? item.offeredSubject
          : `${item.offeredSubject?.days?.join(", ") ?? ""} ${item.offeredSubject?.startTime ?? ""} ${item.offeredSubject?.endTime ?? ""}`;

      const haystack = `${subjectTitle} ${instructorName} ${registration} ${schedule}`
        .toLowerCase()
        .trim();

      return haystack.includes(normalizedSearch);
    });
  }, [items, searchInput, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchInput, statusFilter]);

  const total = filteredItems.length;
  const totalPages = Math.max(Math.ceil(total / limit) || 1, 1);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const pagedItems = filteredItems.slice(startIndex, startIndex + limit);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Student Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Enrolled Subjects
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            See subjects that were auto-enrolled from your selected curriculum.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-(--line) bg-(--surface) px-4 py-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Search
          </label>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by subject, instructor, or schedule"
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | "enrolled" | "completed")
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="" className="bg-(--surface) text-(--text)">
              All
            </option>
            <option value="enrolled" className="bg-(--surface) text-(--text)">
              Enrolled
            </option>
            <option value="completed" className="bg-(--surface) text-(--text)">
              Completed
            </option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button
            type="button"
            onClick={() => {
              showToast({
                variant: "info",
                title: "Retrying",
                description: "Fetching enrolled subjects again.",
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

      <EnrolledSubjectTable
        items={pagedItems}
        loading={isPending}
        error={error}
        onView={(item) => setSelectedSubject(item)}
      />

      <EnrolledSubjectPagination
        total={total}
        page={safePage}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />

      <EnrolledSubjectDetailsModal
        open={Boolean(selectedSubject)}
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />
    </section>
  );
}
