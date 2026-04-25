"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getOfferedSubjectMarkSheet,
  releaseOfferedSubjectComponent,
  updateOfferedSubjectStudentMarks,
} from "@/lib/api/dashboard/admin/enrolled-subject";
import type {
  EnrolledSubjectMarkEntry,
  OfferedSubjectMarkSheet,
  OfferedSubjectMarkSheetStudent,
} from "@/lib/type/dashboard/admin/enrolled-subject";
import { showToast } from "@/utils/common/toast";
import { resolveName } from "@/utils/dashboard/admin/utils";

type Props = {
  initialData: OfferedSubjectMarkSheet;
  mode: "manage" | "view";
};

type StudentOption = {
  id: string;
  label: string;
  resultStatus: string;
};

function humanizeStatus(value?: string) {
  if (!value) {
    return "--";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveStudentLabel(student: OfferedSubjectMarkSheet["enrolledSubjects"][number]["student"]) {
  if (!student) {
    return { name: "Unknown student", id: "--" };
  }

  if (typeof student === "string") {
    return { name: student, id: student };
  }

  const name =
    typeof student.name === "string" ? student.name : resolveName(student.name);

  return {
    name: name || "Unknown student",
    id: student.id ?? "--",
  };
}

function resolveStudentObjectId(
  student: OfferedSubjectMarkSheet["enrolledSubjects"][number]["student"],
) {
  if (!student || typeof student === "string") {
    return student ?? "";
  }

  return student._id;
}

function getDraftValue(
  drafts: Record<string, Record<string, string>>,
  studentId: string,
  entry: EnrolledSubjectMarkEntry,
) {
  return drafts[studentId]?.[entry.componentCode] ?? (entry.obtainedMarks ?? "").toString();
}

function getEntryDisplayValue(
  row: OfferedSubjectMarkSheetStudent,
  componentCode: string,
) {
  const entry = row.markEntries.find((item) => item.componentCode === componentCode);
  return typeof entry?.obtainedMarks === "number" ? entry.obtainedMarks : "--";
}

function resultStatusClassName(status: string) {
  if (status === "Final Published") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "Final Ready") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  }

  if (status === "Partial Released") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-(--line) bg-(--surface-muted) text-(--text-dim)";
}

const selectClassName =
  "focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)";

const inputClassName =
  "focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)";

function StudentMarkCard({
  row,
  selectedStudentId,
  drafts,
  canEditMarks,
  isPending,
  savingStudentId,
  onDraftChange,
  onSave,
}: {
  row: OfferedSubjectMarkSheetStudent;
  selectedStudentId: string;
  drafts: Record<string, Record<string, string>>;
  canEditMarks: boolean;
  isPending: boolean;
  savingStudentId: string | null;
  onDraftChange: (studentId: string, componentCode: string, value: string) => void;
  onSave: (studentId: string, entries: EnrolledSubjectMarkEntry[]) => void;
}) {
  const studentInfo = resolveStudentLabel(row.student);

  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{studentInfo.name}</p>
          <p className="text-sm text-(--text-dim)">ID: {studentInfo.id}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">
            Total: {row.markSummary.total} / {row.markSummary.totalMarks}
          </p>
          <p className="text-(--text-dim)">
            Status: {humanizeStatus(row.resultStatus)}
            {row.finalResultPublishedAt ? " / Published" : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {row.markEntries
          .slice()
          .sort((left, right) => left.order - right.order)
          .map((entry) => (
            <div
              key={entry.componentCode}
              className="rounded-xl border border-(--line) bg-(--surface) p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{entry.componentTitle}</p>
                  <p className="text-xs text-(--text-dim)">
                    {entry.bucket} / {entry.fullMarks}
                  </p>
                </div>
                <span className="text-xs text-(--text-dim)">
                  {entry.isReleased ? "Released" : "Hidden"}
                </span>
              </div>

              {canEditMarks ? (
                <input
                  value={getDraftValue(drafts, selectedStudentId, entry)}
                  onChange={(event) =>
                    onDraftChange(selectedStudentId, entry.componentCode, event.target.value)
                  }
                  inputMode="decimal"
                  className="focus-ring mt-3 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
                />
              ) : (
                <div className="mt-3 rounded-xl border border-(--line) bg-(--surface-muted) px-3 py-3 text-sm font-medium">
                  {typeof entry.obtainedMarks === "number" ? entry.obtainedMarks : "--"}
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Theory C.</p>
            <p className="mt-1 font-semibold">{row.markSummary.theoryContinuous}</p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Theory F.</p>
            <p className="mt-1 font-semibold">{row.markSummary.theoryFinal}</p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Practical C.</p>
            <p className="mt-1 font-semibold">{row.markSummary.practicalContinuous}</p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Practical F.</p>
            <p className="mt-1 font-semibold">{row.markSummary.practicalFinal}</p>
          </div>
        </div>

        {canEditMarks ? (
          <button
            type="button"
            disabled={savingStudentId === row._id || isPending}
            onClick={() => onSave(selectedStudentId, row.markEntries)}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingStudentId === row._id ? "Saving..." : "Save Marks"}
          </button>
        ) : (
          <div className="rounded-xl border border-(--line) bg-(--surface) px-4 py-2 text-sm text-(--text-dim)">
            Review mode
          </div>
        )}
      </div>
    </div>
  );
}

export function OfferedSubjectMarkingPanel({ initialData, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [releasingCode, setReleasingCode] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const canEditMarks = mode === "manage";
  const canReleaseComponents = mode === "manage";

  const sortedComponents = useMemo(
    () =>
      (data.offeredSubject.assessmentComponentsSnapshot ?? [])
        .slice()
        .sort((left, right) => left.order - right.order),
    [data.offeredSubject.assessmentComponentsSnapshot],
  );

  const studentOptions = useMemo<StudentOption[]>(
    () =>
      data.enrolledSubjects
        .map((row) => {
          const studentId = resolveStudentObjectId(row.student);
          const studentInfo = resolveStudentLabel(row.student);

          return {
            id: studentId,
            label: `${studentInfo.name} (${studentInfo.id})`,
            resultStatus: humanizeStatus(row.resultStatus),
          };
        })
        .filter((item) => Boolean(item.id))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [data.enrolledSubjects],
  );

  const selectedStudent = useMemo(
    () =>
      data.enrolledSubjects.find(
        (row) => resolveStudentObjectId(row.student) === selectedStudentId,
      ) ?? null,
    [data.enrolledSubjects, selectedStudentId],
  );

  const visibleStudents = useMemo(() => {
    const normalizedQuery = studentSearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return data.enrolledSubjects;
    }

    return data.enrolledSubjects.filter((row) => {
      const studentInfo = resolveStudentLabel(row.student);
      const haystack = `${studentInfo.name} ${studentInfo.id} ${humanizeStatus(
        row.resultStatus,
      )}`.toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [data.enrolledSubjects, studentSearch]);

  useEffect(() => {
    setData(initialData);
    setDrafts({});
    setSavingStudentId(null);
    setReleasingCode(null);
    setSelectedStudentId("");
    setStudentSearch("");
  }, [initialData]);

  useEffect(() => {
    if (
      selectedStudentId &&
      !studentOptions.some((student) => student.id === selectedStudentId)
    ) {
      setSelectedStudentId("");
    }
  }, [selectedStudentId, studentOptions]);

  async function refreshMarkSheet() {
    const latest = await getOfferedSubjectMarkSheet(data.offeredSubject._id);
    setData(latest);
  }

  function updateDraft(studentId: string, componentCode: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] ?? {}),
        [componentCode]: value,
      },
    }));
  }

  async function handleSaveStudent(studentId: string, entries: EnrolledSubjectMarkEntry[]) {
    if (!canEditMarks || !studentId) {
      return;
    }

    setSavingStudentId(
      data.enrolledSubjects.find(
        (row) => resolveStudentObjectId(row.student) === studentId,
      )?._id ?? null,
    );

    try {
      await updateOfferedSubjectStudentMarks({
        offeredSubject: data.offeredSubject._id,
        student: studentId,
        entries: entries.map((entry) => {
          const rawValue = getDraftValue(drafts, studentId, entry).trim();
          return {
            componentCode: entry.componentCode,
            obtainedMarks: rawValue === "" ? null : Number(rawValue),
            remarks: entry.remarks ?? "",
          };
        }),
      });

      await refreshMarkSheet();
      showToast({
        variant: "success",
        title: "Marks updated",
        description: "Student marks were saved successfully.",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save marks.",
      });
    } finally {
      setSavingStudentId(null);
    }
  }

  async function handleReleaseComponent(componentCode: string) {
    if (!canReleaseComponents) {
      return;
    }

    setReleasingCode(componentCode);

    try {
      await releaseOfferedSubjectComponent({
        offeredSubject: data.offeredSubject._id,
        componentCode,
      });
      await refreshMarkSheet();
      showToast({
        variant: "success",
        title: "Component released",
        description: "Students can now see this component on their enrolled subject view.",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Release failed",
        description:
          error instanceof Error ? error.message : "Unable to release component.",
      });
    } finally {
      setReleasingCode(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-(--line) bg-(--surface) p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Marking Workspace</h2>
          <p className="text-sm text-(--text-dim)">
            {canEditMarks
              ? "Use the report list or dropdown to open a student and save marks."
              : "Review the report list and inspect any student in detail."}
          </p>
        </div>
        <span className="inline-flex rounded-full border border-(--line) bg-(--surface-muted) px-3 py-1 text-xs font-semibold text-(--text-dim)">
          {canEditMarks ? "Instructor" : "Admin"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {sortedComponents.map((component) => {
          const isReleased =
            data.offeredSubject.releasedComponentCodes?.includes(component.code) ?? false;

          return (
            <div
              key={component.code}
              className="rounded-xl border border-(--line) bg-(--surface-muted) p-3"
            >
              <p className="font-semibold">{component.title}</p>
              <p className="mt-1 text-xs text-(--text-dim)">
                {component.bucket} / {component.fullMarks} marks
              </p>
              <p className="mt-3 text-xs font-medium text-(--text-dim)">
                {isReleased ? "Released to students" : "Not released yet"}
              </p>

              {canReleaseComponents ? (
                <button
                  type="button"
                  disabled={isReleased || releasingCode === component.code}
                  onClick={() => handleReleaseComponent(component.code)}
                  className="focus-ring mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReleased
                    ? "Released"
                    : releasingCode === component.code
                      ? "Releasing..."
                      : "Release"}
                </button>
              ) : (
                <p className="mt-3 text-xs text-(--text-dim)">Review only.</p>
              )}
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Student Report</p>
            <p className="text-sm text-(--text-dim)">Scan rows, search quickly, then open a student.</p>
          </div>
          <div className="rounded-xl border border-(--line) bg-(--surface) px-4 py-2 text-sm">
            Enrolled Students:{" "}
            <span className="font-semibold">{data.enrolledSubjects.length}</span>
          </div>
        </div>

        {data.enrolledSubjects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-(--line) bg-(--surface) px-4 py-6 text-sm text-(--text-dim)">
            No enrolled students found for this offered subject yet.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Student
                </span>
                <select
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">Select student</option>
                  {studentOptions.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.label} | {student.resultStatus}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Search
                </span>
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search by student ID or name"
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {visibleStudents.map((row) => {
                const studentInfo = resolveStudentLabel(row.student);
                const studentId = resolveStudentObjectId(row.student);
                const status = humanizeStatus(row.resultStatus);
                const isSelected = studentId === selectedStudentId;

                return (
                  <button
                    key={row._id}
                    type="button"
                    onClick={() => setSelectedStudentId(studentId)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-(--accent) bg-(--surface)"
                        : "border-(--line) bg-(--surface)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{studentInfo.name}</p>
                        <p className="text-xs text-(--text-dim)">{studentInfo.id}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${resultStatusClassName(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {sortedComponents.map((component) => (
                        <div
                          key={`${row._id}-${component.code}`}
                          className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2"
                        >
                          <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                            {component.title}
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {getEntryDisplayValue(row, component.code)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-(--text-dim)">
                        Total {row.markSummary.total} / {row.markSummary.totalMarks}
                      </span>
                      <span className="font-medium">
                        {canEditMarks ? "Open" : "Review"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-(--line) bg-(--surface) md:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-left text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                    <th className="px-4 py-3">Student</th>
                    {sortedComponents.map((component) => (
                      <th key={component.code} className="px-4 py-3 whitespace-nowrap">
                        {component.title}
                      </th>
                    ))}
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((row) => {
                    const studentInfo = resolveStudentLabel(row.student);
                    const studentId = resolveStudentObjectId(row.student);
                    const status = humanizeStatus(row.resultStatus);
                    const isSelected = studentId === selectedStudentId;

                    return (
                      <tr
                        key={row._id}
                        className={`cursor-pointer border-b border-(--line)/70 transition ${
                          isSelected ? "bg-(--surface-muted)" : "hover:bg-(--surface-muted)/60"
                        }`}
                        onClick={() => setSelectedStudentId(studentId)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{studentInfo.name}</p>
                          <p className="text-xs text-(--text-dim)">{studentInfo.id}</p>
                        </td>
                        {sortedComponents.map((component) => (
                          <td key={`${row._id}-${component.code}`} className="px-4 py-3 font-medium">
                            {getEntryDisplayValue(row, component.code)}
                          </td>
                        ))}
                        <td className="px-4 py-3 font-semibold">
                          {row.markSummary.total} / {row.markSummary.totalMarks}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${resultStatusClassName(
                              status,
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visibleStudents.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-(--line) bg-(--surface) px-4 py-6 text-sm text-(--text-dim)">
                No students matched the current search.
              </div>
            ) : null}

            {selectedStudent ? (
              <div className="mt-4">
                <StudentMarkCard
                  row={selectedStudent}
                  selectedStudentId={selectedStudentId}
                  drafts={drafts}
                  canEditMarks={canEditMarks}
                  isPending={isPending}
                  savingStudentId={savingStudentId}
                  onDraftChange={updateDraft}
                  onSave={handleSaveStudent}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-(--line) bg-(--surface) px-4 py-6 text-sm text-(--text-dim)">
                {canEditMarks
                  ? "Select a student row to enter or update marks."
                  : "Select a student row to review detailed marks."}
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
}
