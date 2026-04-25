"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { OfferedSubjectMarkingPanel } from "@/components/dashboard/admin/offered-subject/offered-subject-marking-panel";
import { getOfferedSubjectMarkSheet } from "@/lib/api/dashboard/admin/enrolled-subject";
import type { OfferedSubjectMarkSheet } from "@/lib/type/dashboard/admin/enrolled-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import { resolveId, resolveName } from "@/utils/dashboard/admin/utils";

type MarkingWorkspacePageProps = {
  items: OfferedSubject[];
  error?: string | null;
  mode: "manage" | "view";
};

type SemesterOption = {
  id: string;
  label: string;
};

const selectClassName =
  "focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-60";

function resolveSemesterLabel(value: OfferedSubject["semesterRegistration"]) {
  if (!value) {
    return "Semester registration";
  }

  if (typeof value === "string") {
    return value;
  }

  const registration = value as SemesterRegistration;
  const academicSemester =
    typeof registration.academicSemester === "string"
      ? registration.academicSemester
      : [registration.academicSemester?.name, registration.academicSemester?.year]
          .filter(Boolean)
          .join(" ");

  return [academicSemester || "Semester", registration.status, registration.shift]
    .filter(Boolean)
    .join(" | ");
}

function resolveSubjectLabel(value: OfferedSubject["subject"]) {
  if (!value) {
    return "Subject";
  }

  if (typeof value === "string") {
    return value;
  }

  const subject = value as Subject;
  return [subject.title, subject.code].filter(Boolean).join(" | ") || "Subject";
}

function resolveInstructorLabel(value: OfferedSubject["instructor"]) {
  if (!value) {
    return "Instructor";
  }

  if (typeof value === "string") {
    return value;
  }

  const instructor = value as Instructor;
  const name = resolveName(instructor.name);
  return instructor.designation ? `${name} (${instructor.designation})` : name;
}

function resolveOfferedSubjectLabel(item: OfferedSubject, includeInstructor: boolean) {
  const baseLabel = resolveSubjectLabel(item.subject);
  if (!includeInstructor) {
    return baseLabel;
  }

  return `${baseLabel} | ${resolveInstructorLabel(item.instructor)}`;
}

function resolveScheduleLabel(item: OfferedSubject) {
  const days = item.days?.length ? item.days.join(", ") : "Days not set";
  const time =
    item.startTime && item.endTime
      ? `${item.startTime} - ${item.endTime}`
      : "Time not set";

  return `${days} | ${time}`;
}

function humanizeStatus(value?: string) {
  if (!value) {
    return "--";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function MarkingWorkspacePage({
  items,
  error,
  mode,
}: MarkingWorkspacePageProps) {
  const [semesterRegistrationId, setSemesterRegistrationId] = useState("");
  const [offeredSubjectId, setOfferedSubjectId] = useState("");
  const [markSheet, setMarkSheet] = useState<OfferedSubjectMarkSheet | null>(null);
  const [markSheetError, setMarkSheetError] = useState<string | null>(null);
  const [loadingMarkSheet, setLoadingMarkSheet] = useState(false);

  const isReadOnly = mode === "view";

  const semesterOptions = useMemo<SemesterOption[]>(() => {
    const map = new Map<string, SemesterOption>();

    for (const item of items) {
      const id = resolveId(item.semesterRegistration);
      if (!id || map.has(id)) {
        continue;
      }

      map.set(id, {
        id,
        label: resolveSemesterLabel(item.semesterRegistration),
      });
    }

    return Array.from(map.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }, [items]);

  const filteredSubjects = useMemo(() => {
    if (!semesterRegistrationId) {
      return [];
    }

    return items
      .filter(
        (item) => resolveId(item.semesterRegistration) === semesterRegistrationId,
      )
      .sort((left, right) =>
        resolveOfferedSubjectLabel(left, isReadOnly).localeCompare(
          resolveOfferedSubjectLabel(right, isReadOnly),
        ),
      );
  }, [isReadOnly, items, semesterRegistrationId]);

  const selectedOfferedSubject = useMemo(
    () => filteredSubjects.find((item) => item._id === offeredSubjectId) ?? null,
    [filteredSubjects, offeredSubjectId],
  );

  useEffect(() => {
    if (semesterOptions.length === 1 && !semesterRegistrationId) {
      setSemesterRegistrationId(semesterOptions[0].id);
    }
  }, [semesterOptions, semesterRegistrationId]);

  useEffect(() => {
    setOfferedSubjectId("");
    setMarkSheet(null);
    setMarkSheetError(null);
  }, [semesterRegistrationId]);

  useEffect(() => {
    if (!offeredSubjectId) {
      setMarkSheet(null);
      setMarkSheetError(null);
      setLoadingMarkSheet(false);
      return;
    }

    let cancelled = false;

    async function loadMarkSheet() {
      setLoadingMarkSheet(true);
      setMarkSheet(null);
      setMarkSheetError(null);

      try {
        const payload = await getOfferedSubjectMarkSheet(offeredSubjectId);
        if (!cancelled) {
          setMarkSheet(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setMarkSheet(null);
          setMarkSheetError(
            err instanceof Error ? err.message : "Unable to load the mark sheet.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMarkSheet(false);
        }
      }
    }

    void loadMarkSheet();

    return () => {
      cancelled = true;
    };
  }, [offeredSubjectId]);

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Student Marking"
        description={
          isReadOnly
            ? "Filter by semester and subject to review student marks."
            : "Select your semester and subject to open the marking workspace."
        }
      />

      <DashboardErrorBanner error={error} />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Registration
            </span>
            <select
              value={semesterRegistrationId}
              onChange={(event) => setSemesterRegistrationId(event.target.value)}
              disabled={semesterOptions.length === 0}
              className={selectClassName}
            >
              <option value="">Select semester registration</option>
              {semesterOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Subject
            </span>
            <select
              value={offeredSubjectId}
              onChange={(event) => setOfferedSubjectId(event.target.value)}
              disabled={!semesterRegistrationId || filteredSubjects.length === 0}
              className={selectClassName}
            >
              <option value="">Select subject</option>
              {filteredSubjects.map((item) => (
                <option key={item._id} value={item._id}>
                  {resolveOfferedSubjectLabel(item, isReadOnly)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {items.length === 0 && !error ? (
          <div className="mt-4 rounded-xl border border-dashed border-(--line) bg-(--surface-muted) px-4 py-6 text-sm text-(--text-dim)">
            {isReadOnly
              ? "No offered subjects found for review yet."
              : "No assigned offered subjects found for your account yet."}
          </div>
        ) : null}

        {semesterRegistrationId && filteredSubjects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-6 text-sm text-(--text-dim)">
            No subjects were found for the selected semester registration.
          </div>
        ) : null}
      </section>

      {selectedOfferedSubject ? (
        <section className="rounded-2xl border border-(--line) bg-(--surface) p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {resolveSubjectLabel(selectedOfferedSubject.subject)}
              </h2>
              <p className="mt-1 text-sm text-(--text-dim)">
                {resolveSemesterLabel(selectedOfferedSubject.semesterRegistration)}
              </p>
            </div>
            <span className="inline-flex rounded-full border border-(--line) bg-(--surface-muted) px-3 py-1 text-xs font-semibold text-(--text-dim)">
              {humanizeStatus(selectedOfferedSubject.markingStatus)}
            </span>
          </div>

          <div
            className={`mt-4 grid gap-3 ${isReadOnly ? "md:grid-cols-4" : "md:grid-cols-3"}`}
          >
            <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                Schedule
              </p>
              <p className="mt-2 text-sm font-medium">
                {resolveScheduleLabel(selectedOfferedSubject)}
              </p>
            </div>
            <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                Marking Status
              </p>
              <p className="mt-2 text-sm font-medium">
                {humanizeStatus(selectedOfferedSubject.markingStatus)}
              </p>
            </div>
            <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                Enrolled Students
              </p>
              <p className="mt-2 text-sm font-medium">
                {markSheet ? markSheet.enrolledSubjects.length : "--"}
              </p>
            </div>
            {isReadOnly ? (
              <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                  Instructor
                </p>
                <p className="mt-2 text-sm font-medium">
                  {resolveInstructorLabel(selectedOfferedSubject.instructor)}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {semesterRegistrationId && !offeredSubjectId ? (
        <div className="rounded-2xl border border-dashed border-(--line) bg-(--surface) px-4 py-8 text-sm text-(--text-dim)">
          Select a subject to load the student list and marking workspace.
        </div>
      ) : null}

      <DashboardErrorBanner error={markSheetError} />

      {loadingMarkSheet ? (
        <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-8 text-sm text-(--text-dim)">
          Loading enrolled students and mark sheet...
        </div>
      ) : null}

      {markSheet && !loadingMarkSheet ? (
        <OfferedSubjectMarkingPanel
          key={markSheet.offeredSubject._id}
          initialData={markSheet}
          mode={mode}
        />
      ) : null}
    </section>
  );
}
