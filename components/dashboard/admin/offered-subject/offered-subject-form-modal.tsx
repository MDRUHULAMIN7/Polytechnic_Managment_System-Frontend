"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  OfferedSubjectDay,
  OfferedSubjectInput,
  OfferedSubjectUpdateInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import type {
  OfferedSubjectFormModalProps,
  OfferedSubjectFormState,
} from "@/lib/type/dashboard/admin/offered-subject/ui";
import { OFFERED_SUBJECT_DAYS } from "@/lib/type/dashboard/admin/offered-subject/constants";
import { isObjectId, resolveName } from "@/utils/dashboard/admin/utils";
import { updateOfferedSubjectAction } from "@/actions/dashboard/admin/offered-subject";
import {
  createOfferedSubject,
  getOfferedSubjects,
} from "@/lib/api/dashboard/admin/offered-subject";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";
import { useInstructorBusySlots } from "@/hooks/dashboard/admin/offered-subject/use-instructor-busy-slots";
import { useOfferedSubjectOptions } from "@/hooks/dashboard/admin/offered-subject/use-offered-subject-options";
import { parseTimeToMinutes } from "@/utils/dashboard/admin/offered-subject";

const initialState: OfferedSubjectFormState = {
  semesterRegistration: "",
  academicInstructor: "",
  academicDepartment: "",
  subject: "",
  instructor: "",
  section: "",
  maxCapacity: "",
  days: [],
  startTime: "",
  endTime: "",
};

export function OfferedSubjectFormModal({
  open,
  offeredSubject,
  subjects,
  instructors,
  academicDepartments,
  academicInstructors,
  semesterRegistrations,
  onClose,
  onSaved,
}: OfferedSubjectFormModalProps) {
  const [form, setForm] = useState<OfferedSubjectFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(offeredSubject?._id);
  const {
    subjectQuery,
    setSubjectQuery,
    subjectOptions,
    subjectLoading,
    subjectError,
    academicInstructorQuery,
    setAcademicInstructorQuery,
    academicInstructorOptions,
    academicInstructorLoading,
    academicInstructorError,
    departmentQuery,
    setDepartmentQuery,
    departmentOptions,
    departmentLoading,
    departmentError,
    instructorQuery,
    setInstructorQuery,
    instructorOptions,
    instructorLoading,
    instructorError,
  } = useOfferedSubjectOptions({
    open,
    subjects,
    instructors,
    academicDepartments,
    academicInstructors,
    semesterRegistrationId: form.semesterRegistration,
    academicInstructorId: form.academicInstructor,
    academicDepartmentId: form.academicDepartment,
    subjectId: form.subject,
    instructorId: form.instructor,
  });
  const {
    slots: busySlots,
    loading: busyLoading,
    error: busyError,
  } = useInstructorBusySlots({
    open,
    instructorId: form.instructor,
    semesterRegistrationId: form.semesterRegistration,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      semesterRegistration:
        typeof offeredSubject?.semesterRegistration === "string"
          ? offeredSubject.semesterRegistration
          : (offeredSubject?.semesterRegistration?._id ?? ""),
      academicInstructor:
        typeof offeredSubject?.academicInstructor === "string"
          ? offeredSubject.academicInstructor
          : (offeredSubject?.academicInstructor?._id ?? ""),
      academicDepartment:
        typeof offeredSubject?.academicDepartment === "string"
          ? offeredSubject.academicDepartment
          : (offeredSubject?.academicDepartment?._id ?? ""),
      subject:
        typeof offeredSubject?.subject === "string"
          ? offeredSubject.subject
          : (offeredSubject?.subject?._id ?? ""),
      instructor:
        typeof offeredSubject?.instructor === "string"
          ? offeredSubject.instructor
          : (offeredSubject?.instructor?._id ?? ""),
      section:
        offeredSubject?.section !== undefined
          ? String(offeredSubject.section)
          : "",
      maxCapacity:
        offeredSubject?.maxCapacity !== undefined
          ? String(offeredSubject.maxCapacity)
          : "",
      days: offeredSubject?.days ?? [],
      startTime: offeredSubject?.startTime ?? "",
      endTime: offeredSubject?.endTime ?? "",
    });
  }, [open, offeredSubject]);

  function updateField<T extends keyof OfferedSubjectFormState>(
    key: T,
    value: OfferedSubjectFormState[T],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!form.academicInstructor) {
      if (form.academicDepartment || form.instructor) {
        setForm((prev) => ({
          ...prev,
          academicDepartment: "",
          instructor: "",
        }));
      }
      return;
    }

    if (
      form.academicDepartment &&
      !departmentLoading &&
      !departmentQuery.trim() &&
      !departmentOptions.some((item) => item._id === form.academicDepartment)
    ) {
      setForm((prev) => ({ ...prev, academicDepartment: "" }));
    }

    if (
      form.instructor &&
      !instructorLoading &&
      !instructorQuery.trim() &&
      !instructorOptions.some((item) => item._id === form.instructor)
    ) {
      setForm((prev) => ({ ...prev, instructor: "" }));
    }
  }, [
    form.academicInstructor,
    form.academicDepartment,
    form.instructor,
    departmentOptions,
    departmentLoading,
    departmentQuery,
    instructorOptions,
    instructorLoading,
    instructorQuery,
  ]);

  const selectedRegistration = useMemo(
    () =>
      semesterRegistrations.find(
        (item) => item._id === form.semesterRegistration,
      ),
    [semesterRegistrations, form.semesterRegistration],
  );

  const semesterLabel = useMemo(() => {
    const semester = selectedRegistration?.academicSemester;
    if (!semester) {
      return "--";
    }
    if (typeof semester === "string") {
      return semester;
    }
    return `${semester.name ?? ""} ${semester.year ?? ""}`.trim() || "--";
  }, [selectedRegistration]);

  function renderRegistrationOption(
    registration: (typeof semesterRegistrations)[number],
  ) {
    const sem = registration.academicSemester;
    let semLabel = "";
    if (typeof sem === "string") {
      semLabel = sem;
    } else {
      semLabel = `${sem?.name ?? ""} ${sem?.year ?? ""}`.trim();
    }
    const statusShift = `${registration.status} | ${registration.shift}`;
    return [semLabel || "--", statusShift].filter(Boolean).join(" | ");
  }

  const [offeredSummaryLoading, setOfferedSummaryLoading] = useState(false);
  const [offeredSummaryError, setOfferedSummaryError] = useState<string | null>(
    null,
  );
  const [offeredLabels, setOfferedLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (!form.semesterRegistration) {
      setOfferedLabels([]);
      setOfferedSummaryError(null);
      setOfferedSummaryLoading(false);
      return;
    }
    let active = true;
    setOfferedSummaryLoading(true);
    setOfferedSummaryError(null);
    getOfferedSubjects({
      page: 1,
      limit: 1000,
      semesterRegistration: form.semesterRegistration,
      fields: "subject,section",
    })
      .then((payload) => {
        if (!active) return;
        const labels: string[] = [];
        for (const item of payload.result ?? []) {
          const subj = item.subject;
          const sec = Number(item.section);
          const base =
            typeof subj === "string"
              ? subj
              : subj && typeof subj.title === "string"
                ? subj.title
                : "Subject";
          labels.push(sec && sec > 0 ? `${base} (Sec ${sec})` : base);
        }
        setOfferedLabels(labels);
      })
      .catch((err) => {
        if (!active) return;
        setOfferedSummaryError(
          err instanceof Error
            ? err.message
            : "Unable to load offered subjects.",
        );
        setOfferedLabels([]);
      })
      .finally(() => {
        if (!active) return;
        setOfferedSummaryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, form.semesterRegistration]);

  function toggleDay(day: OfferedSubjectDay, checked: boolean) {
    updateField(
      "days",
      checked
        ? Array.from(new Set([...form.days, day]))
        : form.days.filter((item) => item !== day),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.instructor ||
      !form.maxCapacity ||
      !form.startTime ||
      !form.endTime
    ) {
      showToast({
        variant: "error",
        title: "Missing fields",
        description: "Please fill all required fields.",
      });
      return;
    }

    const startMinutes = parseTimeToMinutes(form.startTime);
    const endMinutes = parseTimeToMinutes(form.endTime);
    if (
      startMinutes === null ||
      endMinutes === null ||
      endMinutes <= startMinutes
    ) {
      showToast({
        variant: "error",
        title: "Invalid time range",
        description: "End time must be after start time.",
      });
      return;
    }

    if (!isObjectId(form.instructor)) {
      showToast({
        variant: "error",
        title: "Invalid selection",
        description: "Please select a valid instructor.",
      });
      return;
    }

    const maxCapacity = Number(form.maxCapacity);
    if (!Number.isFinite(maxCapacity) || maxCapacity <= 0) {
      showToast({
        variant: "error",
        title: "Invalid capacity",
        description: "Max capacity must be a positive number.",
      });
      return;
    }

    if (form.days.length === 0) {
      showToast({
        variant: "error",
        title: "Select days",
        description: "Please select at least one day.",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && offeredSubject?._id) {
        const payload: OfferedSubjectUpdateInput = {
          instructor: form.instructor,
          maxCapacity,
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime,
        };
        await updateOfferedSubjectAction(offeredSubject._id, payload);
      } else {
        if (
          !form.semesterRegistration ||
          !form.academicInstructor ||
          !form.academicDepartment ||
          !form.subject ||
          !form.section
        ) {
          showToast({
            variant: "error",
            title: "Missing fields",
            description: "Please complete all required fields.",
          });
          setSubmitting(false);
          return;
        }

        const requiredIds: Array<[string, string]> = [
          ["Semester registration", form.semesterRegistration],
          ["Academic instructor", form.academicInstructor],
          ["Academic department", form.academicDepartment],
          ["Subject", form.subject],
        ];

        for (const [label, value] of requiredIds) {
          if (!isObjectId(value)) {
            showToast({
              variant: "error",
              title: "Invalid selection",
              description: `Please select a valid ${label.toLowerCase()}.`,
            });
            setSubmitting(false);
            return;
          }
        }

        const section = Number(form.section);
        if (!Number.isFinite(section) || section <= 0) {
          showToast({
            variant: "error",
            title: "Invalid section",
            description: "Section must be a positive number.",
          });
          setSubmitting(false);
          return;
        }

        const payload: OfferedSubjectInput = {
          semesterRegistration: form.semesterRegistration,
          academicInstructor: form.academicInstructor,
          academicDepartment: form.academicDepartment,
          subject: form.subject,
          instructor: form.instructor,
          section,
          maxCapacity,
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime,
        };

        await createOfferedSubject(payload);
      }

      showToast({
        variant: "success",
        title: isEdit ? "Offered subject updated" : "Offered subject created",
        description: isEdit
          ? "Offered subject updated successfully."
          : "Offered subject created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title:
          error instanceof Error
            ? error.message
            : isEdit
              ? "Unable to update offered subject."
              : "Unable to create offered subject.",
        description: isEdit ? "Update failed." : "Create failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Update Offered Subject" : "Create Offered Subject"}
      description={
        isEdit
          ? "Update instructor, capacity, schedule, and days."
          : "Create a new offered subject."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Academic Instructor
            </label>
            <input
              type="search"
              value={academicInstructorQuery}
              onChange={(event) =>
                setAcademicInstructorQuery(event.target.value)
              }
              disabled={isEdit}
              placeholder="Search academic instructor"
              className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            />
            <select
              value={form.academicInstructor}
              onChange={(event) =>
                updateField("academicInstructor", event.target.value)
              }
              disabled={isEdit}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select academic instructor
              </option>
              {academicInstructorOptions.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {item.name}
                </option>
              ))}
            </select>
            {academicInstructorLoading ? (
              <p className="mt-2 text-xs text-(--text-dim)">
                Loading instructors...
              </p>
            ) : academicInstructorError ? (
              <p className="mt-2 text-xs text-red-400">
                {academicInstructorError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-(--text-dim)">
                Showing up to 50 results. Type to search.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Academic Department
            </label>
            <input
              type="search"
              value={departmentQuery}
              onChange={(event) => setDepartmentQuery(event.target.value)}
              disabled={isEdit || !form.academicInstructor}
              placeholder="Search department"
              className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            />
            <select
              value={form.academicDepartment}
              onChange={(event) =>
                updateField("academicDepartment", event.target.value)
              }
              disabled={isEdit || !form.academicInstructor}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select department
              </option>
              {departmentOptions.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {item.name}
                </option>
              ))}
            </select>
            {!form.academicInstructor ? (
              <p className="mt-2 text-xs text-(--text-dim)">
                Select academic instructor to load departments.
              </p>
            ) : departmentLoading ? (
              <p className="mt-2 text-xs text-(--text-dim)">
                Loading departments...
              </p>
            ) : departmentError ? (
              <p className="mt-2 text-xs text-red-400">{departmentError}</p>
            ) : (
              <p className="mt-2 text-xs text-(--text-dim)">
                Showing up to 50 results. Type to search.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Instructor
            </label>
            <input
              type="search"
              value={instructorQuery}
              onChange={(event) => setInstructorQuery(event.target.value)}
              disabled={isEdit || !form.academicInstructor}
              placeholder="Search instructor"
              className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            />
            <select
              value={form.instructor}
              onChange={(event) =>
                updateField("instructor", event.target.value)
              }
              disabled={isEdit || !form.academicInstructor}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select instructor
              </option>
              {instructorOptions.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {resolveName(item.name)} ({item.designation})
                </option>
              ))}
            </select>
            {!form.academicInstructor ? (
              <p className="mt-2 text-xs text-(--text-dim)">
                Select academic instructor to load instructors.
              </p>
            ) : instructorLoading ? (
              <p className="mt-2 text-xs text-(--text-dim)">
                Loading instructors...
              </p>
            ) : instructorError ? (
              <p className="mt-2 text-xs text-red-400">{instructorError}</p>
            ) : (
              <p className="mt-2 text-xs text-(--text-dim)">
                Showing up to 50 results. Type to search.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Registration
            </label>
            <select
              value={form.semesterRegistration}
              onChange={(event) =>
                updateField("semesterRegistration", event.target.value)
              }
              disabled={isEdit}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select registration
              </option>
              {semesterRegistrations.map((registration) => (
                <option
                  key={registration._id}
                  value={registration._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {renderRegistrationOption(registration)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-(--text-dim)">
              Academic Semester:{" "}
              <span className="font-medium">{semesterLabel}</span>
            </p>
            <div className="mt-2 text-xs">
              {offeredSummaryLoading ? (
                <p className="text-(--text-dim)">Loading offered subjects...</p>
              ) : offeredSummaryError ? (
                <p className="text-red-400">{offeredSummaryError}</p>
              ) : offeredLabels.length > 0 ? (
                <p className="text-(--text-dim)">
                  Offered subjects ({offeredLabels.length}):{" "}
                  <span className="text-(--text)">
                    {offeredLabels.join(", ")}
                  </span>
                </p>
              ) : (
                <p className="text-(--text-dim)">
                  No subjects offered yet in this registration.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Subject
            </label>
            <input
              type="search"
              value={subjectQuery}
              onChange={(event) => setSubjectQuery(event.target.value)}
              disabled={isEdit}
              placeholder="Search subject"
              className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            />
            <select
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              disabled={isEdit}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select subject
              </option>
              {subjectOptions.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {item.title}
                </option>
              ))}
            </select>
            {subjectLoading ? (
              <p className="mt-2 text-xs text-(--text-dim)">
                Loading subjects...
              </p>
            ) : subjectError ? (
              <p className="mt-2 text-xs text-red-400">{subjectError}</p>
            ) : (
              <p className="mt-2 text-xs text-(--text-dim)">
                Showing up to 50 results. Type to search.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Section
            </label>
            <input
              value={form.section}
              onChange={(event) => updateField("section", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm disabled:opacity-70"
              inputMode="numeric"
              disabled={isEdit}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Max Capacity
            </label>
            <input
              value={form.maxCapacity}
              onChange={(event) =>
                updateField("maxCapacity", event.target.value)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface) p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Instructor Availability
          </p>
          {!form.instructor || !form.semesterRegistration ? (
            <p className="mt-2 text-(--text-dim)">
              Select instructor and semester registration to see busy slots.
            </p>
          ) : busyLoading ? (
            <p className="mt-2 text-(--text-dim)">Loading schedules...</p>
          ) : busyError ? (
            <p className="mt-2 text-red-400">{busyError}</p>
          ) : busySlots.length === 0 ? (
            <p className="mt-2 text-(--text-dim)">
              No busy slots found for this instructor in the selected
              registration.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {busySlots.map((slot) => {
                const subjectTitle =
                  typeof slot.subject === "string"
                    ? slot.subject
                    : slot.subject?.title;
                const daysLabel = slot.days?.length
                  ? slot.days.join(", ")
                  : "--";
                const timeLabel =
                  slot.startTime && slot.endTime
                    ? `${slot.startTime} - ${slot.endTime}`
                    : "--";
                return (
                  <div
                    key={slot._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--line) px-3 py-2"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {subjectTitle ?? "Assigned Subject"}
                      </p>
                      <p className="text-xs text-(--text-dim)">{daysLabel}</p>
                    </div>
                    <span className="text-xs font-semibold text-(--text)">
                      {timeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Days
          </p>
          <div className="grid gap-2 sm:grid-cols-4">
            {OFFERED_SUBJECT_DAYS.map((day) => {
              const checked = form.days.includes(day);
              return (
                <label
                  key={day}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm transition hover:border-(--accent)/50 ${
                    checked ? "bg-(--surface-muted)" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggleDay(day, event.target.checked)}
                    className="h-4 w-4 accent-(--accent)"
                  />
                  <span className="font-medium">{day}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Start Time
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => updateField("startTime", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              End Time
            </label>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => updateField("endTime", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
