"use client";

import { useState } from "react";
import type {
  Instructor,
  InstructorSummary,
} from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import { getInstructor, getInstructorAssignedSubjects } from "@/lib/api/dashboard/admin/instructor";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { StudentProfileImage } from "../student/student-profile-image";
import { InstructorDetailsContent } from "./instructor-details-content";

type InstructorDetailsPanelProps = {
  instructorId: string;
  summary: InstructorSummary | null;
  summaryError?: string | null;
};

function resolveName(name?: { firstName?: string; middleName?: string; lastName?: string }) {
  if (!name) {
    return "--";
  }

  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}

function renderDepartment(value?: InstructorSummary["academicDepartment"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  return value.name ?? "--";
}

export function InstructorDetailsPanel({
  instructorId,
  summary,
  summaryError,
}: InstructorDetailsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<Instructor | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [offeredSubjects, setOfferedSubjects] = useState<OfferedSubject[]>([]);
  const [assignedError, setAssignedError] = useState<string | null>(null);
  const [offeredError, setOfferedError] = useState<string | null>(null);

  async function loadDetails() {
    if (loading) return;

    if (loaded) {
      setExpanded(true);
      return;
    }

    setLoading(true);
    setDetailsError(null);
    setAssignedError(null);
    setOfferedError(null);

    const [detailsResult, assignedResult, offeredResult] =
      await Promise.allSettled([
        getInstructor(instructorId),
        getInstructorAssignedSubjects(instructorId),
        getOfferedSubjects({
          page: 1,
          limit: 1000,
          instructor: instructorId,
          sort: "-createdAt",
        }),
      ]);

    if (detailsResult.status === "fulfilled") {
      setDetails(detailsResult.value);
    } else {
      setDetailsError(
        detailsResult.reason instanceof Error
          ? detailsResult.reason.message
          : "Unable to load instructor details.",
      );
    }

    if (assignedResult.status === "fulfilled") {
      setAssignedSubjects(assignedResult.value ?? []);
    } else {
      setAssignedError(
        assignedResult.reason instanceof Error
          ? assignedResult.reason.message
          : "Unable to load assigned subjects.",
      );
    }

    if (offeredResult.status === "fulfilled") {
      setOfferedSubjects(offeredResult.value.result ?? []);
    } else {
      setOfferedError(
        offeredResult.reason instanceof Error
          ? offeredResult.reason.message
          : "Unable to load offered subjects.",
      );
    }

    setLoaded(true);
    setExpanded(true);
    setLoading(false);
  }

  function toggleExpanded() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    void loadDetails();
  }

  if (summaryError) {
    return (
      <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {summaryError}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-6 text-center text-sm text-(--text-dim)">
        No details available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Instructor
          </p>
          <p className="mt-2 text-base font-semibold">{resolveName(summary.name)}</p>
          <p className="mt-1 text-xs text-(--text-dim)">ID: {summary.id}</p>
        </div>
        <StudentProfileImage
          src={summary.profileImg}
          alt={resolveName(summary.name)}
          className="h-16 w-16 rounded-full border border-(--line) object-cover"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Email</p>
          <p className="mt-2 font-medium break-words">{summary.email ?? "--"}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Designation
          </p>
          <p className="mt-2 font-medium">{summary.designation ?? "--"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Department
          </p>
          <p className="mt-2 font-medium">{renderDepartment(summary.academicDepartment)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Status</p>
          <p className="mt-2 font-medium capitalize">{summary.user?.status ?? "--"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleExpanded}
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          {loading
            ? "Loading..."
            : expanded
              ? "Hide Full Details"
              : "View Full Details"}
        </button>
      </div>

      {expanded ? (
        <InstructorDetailsContent
          details={details}
          error={detailsError}
          assignedSubjects={assignedSubjects}
          offeredSubjects={offeredSubjects}
          assignedError={assignedError}
          offeredError={offeredError}
          showSummary={false}
        />
      ) : null}
    </div>
  );
}
