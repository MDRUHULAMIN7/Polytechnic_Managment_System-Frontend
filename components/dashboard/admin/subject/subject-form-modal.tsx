"use client";

import { useEffect, useMemo, useState } from "react";
import { getSubjectAction, getSubjectsAction, updateSubjectAction } from "@/actions/dashboard/admin/subject";
import { createSubject } from "@/lib/api/dashboard/admin/subject";
import type { Subject, SubjectInput } from "@/lib/type/dashboard/admin/subject";
import type { SubjectFormModalProps, SubjectFormState } from "@/lib/type/dashboard/admin/subject/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const initialState: SubjectFormState = {
  title: "",
  prefix: "",
  code: "",
  credits: "",
  regulation: "",
  preRequisiteIds: [],
};

export function SubjectFormModal({ open, subject, onClose, onSaved }: SubjectFormModalProps) {
  const [form, setForm] = useState<SubjectFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [initialPreReqIds, setInitialPreReqIds] = useState<string[]>([]);
  const isEdit = Boolean(subject?._id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      title: subject?.title ?? "",
      prefix: subject?.prefix ?? "",
      code: subject?.code ? String(subject.code) : "",
      credits: subject?.credits ? String(subject.credits) : "",
      regulation: subject?.regulation ? String(subject.regulation) : "",
      preRequisiteIds: [],
    });
  }, [open, subject]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!subject?._id) {
      setInitialPreReqIds([]);
      return;
    }

    getSubjectAction(subject._id)
      .then((details) => {
        const preReqIds =
          details?.preRequisiteSubjects
            ?.map((item) =>
              typeof item.subject === "string" ? item.subject : item.subject?._id
            )
            .filter(Boolean) ?? [];

        setForm((prev) => ({
          ...prev,
          preRequisiteIds: preReqIds as string[],
        }));
        setInitialPreReqIds(preReqIds as string[]);
      })
      .catch(() => {
        setInitialPreReqIds([]);
      });
  }, [open, subject?._id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoadingSubjects(true);
    setSubjectsError(null);

    getSubjectsAction({
      page: 1,
      limit: 1000,
      fields: "title,prefix,code",
    })
      .then((payload) => {
        setSubjects(payload.result ?? []);
      })
      .catch((error) => {
        setSubjectsError(
          error instanceof Error ? error.message : "Unable to load subjects."
        );
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
  }, [open]);

  function updateField<T extends keyof SubjectFormState>(key: T, value: SubjectFormState[T]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreReq(id: string, checked: boolean) {
    updateField(
      "preRequisiteIds",
      checked
        ? Array.from(new Set([...form.preRequisiteIds, id]))
        : form.preRequisiteIds.filter((item) => item !== id)
    );
  }

  const availableSubjects = useMemo(
    () => subjects.filter((item) => item._id !== subject?._id),
    [subjects, subject?._id]
  );

  const selectedSubjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const item of subjects) {
      map.set(item._id, item);
    }
    return map;
  }, [subjects]);

  function renderSubjectLabel(item: Subject) {
    const code = item.code ? `${item.prefix}${item.code}` : item.prefix;
    return `${item.title} (${code})`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.prefix.trim()) {
      showToast({
        variant: "error",
        title: "Missing fields",
        description: "Please fill in title and prefix.",
      });
      return;
    }

    const code = Number(form.code);
    const credits = Number(form.credits);
    const regulation = Number(form.regulation);

    if (!Number.isFinite(code) || !Number.isFinite(credits) || !Number.isFinite(regulation)) {
      showToast({
        variant: "error",
        title: "Invalid numbers",
        description: "Code, credits, and regulation must be valid numbers.",
      });
      return;
    }

    setSubmitting(true);

    try {
      let preRequisiteSubjects: SubjectInput["preRequisiteSubjects"] = [];

      if (isEdit) {
        const removedIds = initialPreReqIds.filter(
          (id) => !form.preRequisiteIds.includes(id)
        );
        const addedIds = form.preRequisiteIds.filter(
          (id) => !initialPreReqIds.includes(id)
        );

        preRequisiteSubjects = [
          ...removedIds.map((id) => ({ subject: id, isDeleted: true })),
          ...addedIds.map((id) => ({ subject: id })),
        ];
      } else {
        preRequisiteSubjects = form.preRequisiteIds.map((id) => ({
          subject: id,
        }));
      }

      const payload: SubjectInput = {
        title: form.title.trim(),
        prefix: form.prefix.trim(),
        code,
        credits,
        regulation,
        ...(preRequisiteSubjects.length > 0 ? { preRequisiteSubjects } : {}),
      };

      if (isEdit && subject?._id) {
        await updateSubjectAction(subject._id, payload);
      } else {
        await createSubject(payload);
      }
      showToast({
        variant: "success",
        title: isEdit ? "Subject updated" : "Subject created",
        description: isEdit
          ? "Subject updated successfully."
          : "Subject created successfully.",
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
              ? "Unable to update subject."
              : "Unable to create subject.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Update Subject" : "Create Subject"}
      description={isEdit ? "Update subject details" : "Add a new subject"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Title
            </label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Prefix
            </label>
            <input
              value={form.prefix}
              onChange={(event) => updateField("prefix", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Code
            </label>
            <input
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Credits
            </label>
            <input
              value={form.credits}
              onChange={(event) => updateField("credits", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              inputMode="numeric"
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

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Prerequisites
          </p>
          {loadingSubjects ? (
            <p className="text-sm text-(--text-dim)">Loading subjects...</p>
          ) : subjectsError ? (
            <p className="text-sm text-red-400">{subjectsError}</p>
          ) : (
            <div className="space-y-4">
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-(--line) bg-(--surface) p-3 text-sm">
                {availableSubjects.length === 0 ? (
                  <p className="text-(--text-dim)">No subjects available.</p>
                ) : (
                  availableSubjects.map((item) => {
                    const checked = form.preRequisiteIds.includes(item._id);
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
                          onChange={(event) => togglePreReq(item._id, event.target.checked)}
                          className="h-4 w-4 accent-(--accent)"
                        />
                        <span className="font-medium">{renderSubjectLabel(item)}</span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Selected Prerequisites
                </p>
                {form.preRequisiteIds.length === 0 ? (
                  <p className="text-sm text-(--text-dim)">No prerequisites selected.</p>
                ) : (
                  form.preRequisiteIds.map((id) => {
                    const item = selectedSubjectMap.get(id);
                    const label = item ? renderSubjectLabel(item) : id;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-lg border border-(--line) px-3 py-2 text-sm"
                      >
                        <span>{label}</span>
                        <button
                          type="button"
                          onClick={() => togglePreReq(id, false)}
                          className="focus-ring inline-flex h-8 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
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
