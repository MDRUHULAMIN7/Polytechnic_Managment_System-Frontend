"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getOfferedSubjectMarkSheet,
  publishOfferedSubjectFinalResult,
  releaseOfferedSubjectComponent,
  updateOfferedSubjectStudentMarks,
} from "@/lib/api/dashboard/admin/enrolled-subject";
import type {
  EnrolledSubjectMarkEntry,
  OfferedSubjectMarkSheet,
} from "@/lib/type/dashboard/admin/enrolled-subject";
import { showToast } from "@/utils/common/toast";

type Props = {
  initialData: OfferedSubjectMarkSheet;
  role: "admin" | "instructor";
};

function resolveStudentLabel(student: OfferedSubjectMarkSheet["enrolledSubjects"][number]["student"]) {
  if (!student) {
    return { name: "Unknown student", id: "--" };
  }

  if (typeof student === "string") {
    return { name: student, id: student };
  }

  return {
    name: student.name ?? "Unknown student",
    id: student.id ?? "--",
  };
}

function resolveStudentObjectId(
  student: OfferedSubjectMarkSheet["enrolledSubjects"][number]["student"]
) {
  if (!student || typeof student === "string") {
    return student ?? "";
  }

  return student._id;
}

function getDraftValue(
  drafts: Record<string, Record<string, string>>,
  studentId: string,
  entry: EnrolledSubjectMarkEntry
) {
  return drafts[studentId]?.[entry.componentCode] ?? (entry.obtainedMarks ?? "").toString();
}

export function OfferedSubjectMarkingPanel({ initialData, role }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [releasingCode, setReleasingCode] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const canEditMarks = role === "instructor" || role === "admin";
  const canPublishFinal = role === "admin";

  const sortedComponents = useMemo(
    () =>
      (data.offeredSubject.assessmentComponentsSnapshot ?? [])
        .slice()
        .sort((left, right) => left.order - right.order),
    [data.offeredSubject.assessmentComponentsSnapshot]
  );

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
    setSavingStudentId(studentId);

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
        description: "Students can now see this component.",
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

  async function handlePublishFinal() {
    setPublishing(true);

    try {
      await publishOfferedSubjectFinalResult({
        offeredSubject: data.offeredSubject._id,
      });
      await refreshMarkSheet();
      showToast({
        variant: "success",
        title: "Final result published",
        description: "Students can now see their final grade.",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Publish failed",
        description:
          error instanceof Error ? error.message : "Unable to publish final result.",
      });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-(--line) bg-(--surface) p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Marking Control</h2>
          <p className="text-sm text-(--text-dim)">
            Enter student marks, release completed components, and publish the final
            result.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePublishFinal}
          disabled={!canPublishFinal || publishing}
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishing ? "Publishing..." : "Publish Final Result"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {sortedComponents.map((component) => (
          <div
            key={component.code}
            className="rounded-xl border border-(--line) bg-(--surface-muted) p-3"
          >
            <p className="font-semibold">{component.title}</p>
            <p className="mt-1 text-xs text-(--text-dim)">
              {component.bucket} / {component.fullMarks} marks
            </p>
            <button
              type="button"
              disabled={releasingCode === component.code}
              onClick={() => handleReleaseComponent(component.code)}
              className="focus-ring mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {data.offeredSubject.releasedComponentCodes?.includes(component.code)
                ? "Released"
                : releasingCode === component.code
                  ? "Releasing..."
                  : "Release"}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {data.enrolledSubjects.length === 0 ? (
          <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-6 text-sm text-(--text-dim)">
            No enrolled students found for this offered subject yet.
          </div>
        ) : (
          data.enrolledSubjects.map((row) => {
            const studentInfo = resolveStudentLabel(row.student);
            const studentObjectId = resolveStudentObjectId(row.student);

            return (
              <div
                key={row._id}
                className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4"
              >
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
                      Status: {row.resultStatus} {row.finalResultPublishedAt ? " / Published" : ""}
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

                        <input
                          value={getDraftValue(drafts, studentObjectId, entry)}
                          onChange={(event) =>
                            updateDraft(studentObjectId, entry.componentCode, event.target.value)
                          }
                          disabled={!canEditMarks}
                          inputMode="decimal"
                          className="focus-ring mt-3 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        />
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

                  <button
                    type="button"
                    disabled={!canEditMarks || savingStudentId === row._id || isPending}
                    onClick={() => handleSaveStudent(studentObjectId, row.markEntries)}
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingStudentId === row._id ? "Saving..." : "Save Marks"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
