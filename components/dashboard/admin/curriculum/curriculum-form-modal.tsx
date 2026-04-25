"use client";

import { useEffect, useMemo, useState } from "react";
import type { CurriculumInput, CurriculumUpdateInput } from "@/lib/type/dashboard/admin/curriculum";
import type { CurriculumFormModalProps, CurriculumFormState } from "@/lib/type/dashboard/admin/curriculum/ui";
import { createCurriculumAction, updateCurriculumAction } from "@/actions/dashboard/admin/curriculum";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const initialState: CurriculumFormState = {
  academicDepartment: "",
  semisterRegistration: "",
  regulation: "",
  session: "",
  subjects: [],
};

function renderSemesterLabel(value: unknown) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && "name" in value && "year" in value) {
    const name = (value as { name?: string }).name ?? "";
    const year = (value as { year?: string }).year ?? "";
    return `${name} ${year}`.trim() || "--";
  }
  return "--";
}

function formatShortDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString();
}

function renderRegistrationOption(item: {
  academicSemester?: unknown;
  status?: string;
  shift?: string;
  startDate?: string;
  endDate?: string;
  totalCredit?: number;
}) {
  const semesterLabel = renderSemesterLabel(item.academicSemester);
  const startDate = formatShortDate(item.startDate);
  const endDate = formatShortDate(item.endDate);
  const totalCredit =
    typeof item.totalCredit === "number" ? `${item.totalCredit} credits` : "--";
  return `${semesterLabel} | ${item.status ?? "--"} | ${item.shift ?? "--"} | ${startDate} -> ${endDate} | ${totalCredit}`;
}

function resolveId(value: unknown) {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: string })._id;
    return id ?? null;
  }
  return null;
}

function subjectLabel(subject: { title: string; prefix?: string; code?: number }) {
  const code = subject.code ? `${subject.prefix ?? ""}${subject.code}` : subject.prefix;
  return code ? `${subject.title} (${code})` : subject.title;
}

function creditsAreEqual(left: number, right: number) {
  return Math.abs(left - right) < 0.0001;
}

export function CurriculumFormModal({
  open,
  curriculum,
  academicDepartments,
  semesterRegistrations,
  subjects,
  offeredSubjects,
  onClose,
  onSaved,
}: CurriculumFormModalProps) {
  const [form, setForm] = useState<CurriculumFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubjectIds, setExistingSubjectIds] = useState<string[]>([]);
  const isEdit = Boolean(curriculum?._id);
  const currentCurriculumRegistrationId = resolveId(curriculum?.semisterRegistration) ?? "";
  const currentCurriculumRegulation =
    typeof curriculum?.regulation === "number" ? curriculum.regulation : null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const existingIds =
      curriculum?.subjects?.map((item) =>
        typeof item === "string" ? item : item._id
      ) ?? [];

    setForm({
      academicDepartment:
        typeof curriculum?.academicDepartment === "string"
          ? curriculum.academicDepartment
          : curriculum?.academicDepartment?._id ?? "",
      semisterRegistration:
        typeof curriculum?.semisterRegistration === "string"
          ? curriculum.semisterRegistration
          : curriculum?.semisterRegistration?._id ?? "",
      regulation:
        curriculum?.regulation !== undefined ? String(curriculum.regulation) : "",
      session: curriculum?.session ?? "",
      subjects: [],
    });
    setExistingSubjectIds(existingIds);
  }, [open, curriculum]);

  function updateField<T extends keyof CurriculumFormState>(
    key: T,
    value: CurriculumFormState[T]
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "academicDepartment" && value !== prev.academicDepartment) {
        next.subjects = [];
      }
      if (key === "semisterRegistration" && value !== prev.semisterRegistration) {
        next.subjects = [];
      }
      return next;
    });
  }

  const selectedRegistration = useMemo(
    () =>
      semesterRegistrations.find(
        (item) => item._id === form.semisterRegistration
      ),
    [semesterRegistrations, form.semisterRegistration]
  );

  const semesterLabel = useMemo(
    () => renderSemesterLabel(selectedRegistration?.academicSemester),
    [selectedRegistration]
  );

  const registrationSummary = useMemo(() => {
    if (!selectedRegistration) {
      return null;
    }

    const dateRange = `${formatShortDate(selectedRegistration.startDate)} -> ${formatShortDate(
      selectedRegistration.endDate
    )}`;
    const totalCredit =
      typeof selectedRegistration.totalCredit === "number"
        ? `${selectedRegistration.totalCredit} credits`
        : "--";

    return {
      status: selectedRegistration.status ?? "--",
      shift: selectedRegistration.shift ?? "--",
      dateRange,
      totalCredit,
    };
  }, [selectedRegistration]);

  const availableRegistrations = useMemo(() => {
    if (isEdit) {
      return semesterRegistrations;
    }
    return semesterRegistrations.filter(
      (item) => item.status === "UPCOMING" || item.status === "ONGOING"
    );
  }, [semesterRegistrations, isEdit]);

  const canShowSubjects = Boolean(
    form.academicDepartment && form.semisterRegistration
  );

  const regulationNumber = Number(form.regulation);
  const regulationFilter = Number.isFinite(regulationNumber)
    ? regulationNumber
    : null;

  const offeredSubjectIds = useMemo(() => {
    if (!canShowSubjects) {
      return null;
    }

    const ids = new Set<string>();
    for (const item of offeredSubjects) {
      const departmentId = resolveId(item.academicDepartment);
      if (departmentId !== form.academicDepartment) {
        continue;
      }

      const registrationId = resolveId(item.semesterRegistration);
      if (registrationId !== form.semisterRegistration) {
        continue;
      }

      const subjectId = resolveId(item.subject);
      if (subjectId) {
        ids.add(subjectId);
      }
    }

    return ids;
  }, [offeredSubjects, form.academicDepartment, form.semisterRegistration, canShowSubjects]);

  const availableSubjects = useMemo(() => {
    if (!canShowSubjects) {
      return [];
    }

    let filtered = regulationFilter
      ? subjects.filter((item) => item.regulation === regulationFilter)
      : subjects;

    if (offeredSubjectIds) {
      filtered = filtered.filter((item) => offeredSubjectIds.has(item._id));
    }

    return filtered.filter((item) => !existingSubjectIds.includes(item._id));
  }, [subjects, existingSubjectIds, regulationFilter, offeredSubjectIds, canShowSubjects]);

  const subjectCreditMap = useMemo(
    () => new Map(subjects.map((item) => [item._id, item.credits ?? 0])),
    [subjects]
  );

  const selectedSubjectIds = useMemo(
    () =>
      isEdit
        ? Array.from(new Set([...existingSubjectIds, ...form.subjects]))
        : form.subjects,
    [existingSubjectIds, form.subjects, isEdit]
  );

  const selectedTotalCredit = useMemo(
    () =>
      selectedSubjectIds.reduce(
        (sum, id) => sum + (subjectCreditMap.get(id) ?? 0),
        0
      ),
    [selectedSubjectIds, subjectCreditMap]
  );

  const registrationTotalCredit =
    typeof selectedRegistration?.totalCredit === "number"
      ? selectedRegistration.totalCredit
      : null;

  const hasRegistrationChanged =
    isEdit && currentCurriculumRegistrationId !== form.semisterRegistration;
  const hasRegulationChanged =
    isEdit &&
    currentCurriculumRegulation !== null &&
    Number.isFinite(regulationNumber) &&
    regulationNumber !== currentCurriculumRegulation;
  const shouldEnforceCreditMatch =
    !isEdit || form.subjects.length > 0 || hasRegistrationChanged || hasRegulationChanged;
  const isCreditMatched =
    registrationTotalCredit === null
      ? null
      : creditsAreEqual(selectedTotalCredit, registrationTotalCredit);

  function toggleSubject(id: string, checked: boolean) {
    updateField(
      "subjects",
      checked
        ? Array.from(new Set([...form.subjects, id]))
        : form.subjects.filter((item) => item !== id)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.academicDepartment || !form.semisterRegistration || !form.session) {
      showToast({
        variant: "error",
        title: "Missing fields",
        description: "Please complete all required fields.",
      });
      return;
    }

    const sessionValue = form.session.trim();
    if (!/^\d{4}-\d{4}$/.test(sessionValue)) {
      showToast({
        variant: "error",
        title: "Invalid session",
        description: "Session must be in format YYYY-YYYY.",
      });
      return;
    }

    const regulation = Number(form.regulation);
    if (!Number.isFinite(regulation) || regulation <= 0) {
      showToast({
        variant: "error",
        title: "Invalid regulation",
        description: "Regulation must be a positive number.",
      });
      return;
    }

    if (!isEdit && form.subjects.length === 0) {
      showToast({
        variant: "error",
        title: "Select subjects",
        description: "Please select at least one subject.",
      });
      return;
    }

    if (
      shouldEnforceCreditMatch &&
      registrationTotalCredit !== null &&
      !creditsAreEqual(selectedTotalCredit, registrationTotalCredit)
    ) {
      showToast({
        variant: "error",
        title: "Credit mismatch",
        description: `Selected subjects total credit (${selectedTotalCredit}) must exactly match semester registration total credit (${registrationTotalCredit}).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && curriculum?._id) {
        const payload: CurriculumUpdateInput = {};

        if (form.academicDepartment) {
          payload.academicDepartment = form.academicDepartment;
        }
        if (form.semisterRegistration) {
          payload.semisterRegistration = form.semisterRegistration;
        }
        if (sessionValue) {
          payload.session = sessionValue;
        }
        if (Number.isFinite(regulation)) {
          payload.regulation = regulation;
        }
        if (form.subjects.length > 0) {
          payload.subjects = form.subjects;
        }

        await updateCurriculumAction(curriculum._id, payload);
      } else {
        const payload: CurriculumInput = {
          academicDepartment: form.academicDepartment,
          semisterRegistration: form.semisterRegistration,
          regulation,
          session: sessionValue,
          subjects: form.subjects,
        };
        await createCurriculumAction(payload);
      }

      showToast({
        variant: "success",
        title: isEdit ? "Curriculum updated" : "Curriculum created",
        description: isEdit
          ? "Curriculum updated successfully."
          : "Curriculum created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description:
          error instanceof Error
            ? error.message
            : isEdit
              ? "Unable to update curriculum."
              : "Unable to create curriculum.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Update Curriculum" : "Create Curriculum"}
      description={
        isEdit ? "Add subjects or update curriculum details." : "Create a new curriculum."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Academic Department
            </label>
            <select
              value={form.academicDepartment}
              onChange={(event) => updateField("academicDepartment", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select department
              </option>
              {academicDepartments.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Registration
            </label>
            <select
              value={form.semisterRegistration}
              onChange={(event) =>
                updateField("semisterRegistration", event.target.value)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select registration
              </option>
              {availableRegistrations.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {renderRegistrationOption(item)}
                </option>
              ))}
            </select>
            {selectedRegistration ? (
              <div className="mt-2 space-y-1 text-xs text-(--text-dim)">
                <p>
                  Academic Semester:{" "}
                  <span className="font-medium">{semesterLabel}</span>
                </p>
                <p>
                  Status / Shift:{" "}
                  <span className="font-medium">
                    {registrationSummary?.status} / {registrationSummary?.shift}
                  </span>
                </p>
                <p>
                  Dates:{" "}
                  <span className="font-medium">
                    {registrationSummary?.dateRange}
                  </span>
                </p>
                <p>
                  Total Credit:{" "}
                  <span className="font-medium">
                    {registrationSummary?.totalCredit}
                  </span>
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-(--text-dim)">
                {isEdit
                  ? "Select a semester registration to see details."
                  : "Only UPCOMING or ONGOING semester registrations are available for new curriculums."}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Session
            </label>
            <input
              value={form.session}
              onChange={(event) => updateField("session", event.target.value)}
              placeholder="2024-2025"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Regulation
            </label>
            <input
              value={form.regulation}
              onChange={(event) => updateField("regulation", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              inputMode="numeric"
            />
          </div>
        </div>

        {isEdit ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Existing Subjects
            </p>
            {existingSubjectIds.length === 0 ? (
              <p className="text-sm text-(--text-dim)">No subjects assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {existingSubjectIds.map((id) => {
                  const subject = subjects.find((item) => item._id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full border border-(--line) px-3 py-1 text-xs text-(--text-dim)"
                    >
                      {subject ? subjectLabel(subject) : id}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            {isEdit ? "Add Subjects" : "Subjects"}
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-(--line) bg-(--surface) p-3 text-sm">
            {!form.academicDepartment ? (
              <p className="text-(--text-dim)">
                Select an academic department to view offered subjects.
              </p>
            ) : !form.semisterRegistration ? (
              <p className="text-(--text-dim)">
                Select a semester registration to load offered subjects.
              </p>
            ) : availableSubjects.length === 0 ? (
              <p className="text-(--text-dim)">
                No offered subjects available for the selected department and registration.
              </p>
            ) : (
              availableSubjects.map((item) => {
                const checked = form.subjects.includes(item._id);
                return (
                  <label
                    key={item._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border border-(--line) px-3 py-2 transition hover:border-(--accent)/50 ${
                      checked ? "bg-(--surface-muted)" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleSubject(item._id, event.target.checked)}
                      className="h-4 w-4 accent-(--accent)"
                    />
                    <span className="font-medium">{subjectLabel(item)}</span>
                  </label>
                );
              })
            )}
          </div>
          {regulationFilter && canShowSubjects ? (
            <p className="text-xs text-(--text-dim)">
              Showing subjects for regulation {regulationFilter}.
            </p>
          ) : null}
          {selectedRegistration ? (
            <div
              className={`rounded-xl border px-3 py-2 text-xs ${
                isCreditMatched === false
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                  : "border-(--line) bg-(--surface-muted) text-(--text-dim)"
              }`}
            >
              <p>
                Selected subjects:{" "}
                <span className="font-medium text-(--text)">
                  {selectedSubjectIds.length}
                </span>
              </p>
              <p>
                Selected total credit:{" "}
                <span className="font-medium text-(--text)">
                  {selectedTotalCredit}
                </span>
              </p>
              <p>
                Semester registration total credit:{" "}
                <span className="font-medium text-(--text)">
                  {registrationTotalCredit ?? "--"}
                </span>
              </p>
              {shouldEnforceCreditMatch && isCreditMatched === false ? (
                <p className="mt-1">
                  Selected subjects total credit must be exactly equal before saving.
                </p>
              ) : null}
            </div>
          ) : null}
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

