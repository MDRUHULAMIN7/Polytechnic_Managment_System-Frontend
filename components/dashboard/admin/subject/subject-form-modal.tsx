"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSubjectAction, getSubjectsAction, updateSubjectAction } from "@/actions/dashboard/admin/subject";
import { createSubject } from "@/lib/api/dashboard/admin/subject";
import { AssessmentBucket, Subject, SubjectInput } from "@/lib/type/dashboard/admin/subject";
import type { SubjectFormAssessmentComponentState, SubjectFormModalProps, SubjectFormState } from "@/lib/type/dashboard/admin/subject/ui";
import { getSafeClientErrorMessage } from "@/utils/common/api-error";
import { showToast } from "@/utils/common/toast";
import {
  calculateSubjectTotalFromBuckets,
  createEmptySubjectComponent,
  createInitialSubjectFormState,
  createSubjectFormState,
  getComponentBucketTotals,
  resolveNextSubjectComponentBucket,
} from "@/utils/dashboard/admin/subject/form";
import { Modal } from "./modal";
import { BasicInfoSection } from "./form/basic-info-section";
import { PeriodsSection } from "./form/periods-section";
import { FacilitiesSection } from "./form/facilities-section";
import { MarkingSchemeSection } from "./form/marking-scheme-section";
import { AssessmentComponentsSection } from "./form/assessment-components-section";
import { PrerequisitesSection } from "./form/prerequisites-section";

const availableFacilities = [
  "Projector",
  "AC",
  "Computer Lab",
  "Physics Lab",
  "Chemistry Lab",
  "Workshop",
  "Whiteboard",
];

export function SubjectFormModal({ open, subject, onClose, onSaved }: SubjectFormModalProps) {
  const [form, setForm] = useState<SubjectFormState>(() => createInitialSubjectFormState());
  const [submitting, setSubmitting] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [initialPreReqIds, setInitialPreReqIds] = useState<string[]>([]);
  const isEdit = Boolean(subject?._id);

  useEffect(() => {
    if (!open) return;
    setForm(createSubjectFormState(subject));
  }, [open, subject]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      totalMarks: String(calculateSubjectTotalFromBuckets(prev)),
    }));
  }, [form.theoryContinuous, form.theoryFinal, form.practicalContinuous, form.practicalFinal]);

  useEffect(() => {
    if (!open) return;
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

        setForm({
          ...createSubjectFormState(details),
          preRequisiteIds: preReqIds as string[],
        });
        setInitialPreReqIds(preReqIds as string[]);
      })
      .catch(() => setInitialPreReqIds([]));
  }, [open, subject?._id]);

  useEffect(() => {
    if (!open) return;

    setLoadingSubjects(true);
    setSubjectsError(null);

    getSubjectsAction({
      page: 1,
      limit: 1000,
      fields: "title,prefix,code",
    })
      .then((payload) => setSubjects(payload.result ?? []))
      .catch((error) =>
        setSubjectsError(error instanceof Error ? error.message : "Unable to load subjects.")
      )
      .finally(() => setLoadingSubjects(false));
  }, [open]);

  const updateField = useCallback(<T extends keyof SubjectFormState>(key: T, value: SubjectFormState[T]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateComponent = useCallback(
    <K extends keyof SubjectFormAssessmentComponentState>(
      index: number,
      key: K,
      value: SubjectFormAssessmentComponentState[K]
    ) => {
      setForm((prev) => ({
        ...prev,
        assessmentComponents: prev.assessmentComponents.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item
        ),
      }));
    },
    []
  );

  const addComponent = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      assessmentComponents: [
        ...prev.assessmentComponents,
        createEmptySubjectComponent(resolveNextSubjectComponentBucket(prev)),
      ],
    }));
  }, []);

  const removeComponent = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      assessmentComponents:
        prev.assessmentComponents.length === 1
          ? [createEmptySubjectComponent()]
          : prev.assessmentComponents.filter((_, itemIndex) => itemIndex !== index),
    }));
  }, []);

  const togglePreReq = useCallback((id: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      preRequisiteIds: checked
        ? Array.from(new Set([...prev.preRequisiteIds, id]))
        : prev.preRequisiteIds.filter((item) => item !== id),
    }));
  }, []);

  const toggleFacility = useCallback((facility: string) => {
    setForm((prev) => ({
      ...prev,
      requiredFacilities: prev.requiredFacilities.includes(facility)
        ? prev.requiredFacilities.filter((item) => item !== facility)
        : [...prev.requiredFacilities, facility],
    }));
  }, []);

  const showTheoryPeriods =
    form.subjectType === "THEORY" || form.subjectType === "THEORY_PRACTICAL";
  const showPracticalPeriods =
    form.subjectType === "PRACTICAL_ONLY" || form.subjectType === "THEORY_PRACTICAL";

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      theoryPeriodsPerWeek: showTheoryPeriods ? prev.theoryPeriodsPerWeek : "0",
      practicalPeriodsPerWeek: showPracticalPeriods ? prev.practicalPeriodsPerWeek : "0",
    }));
  }, [showTheoryPeriods, showPracticalPeriods]);

  const availableSubjects = useMemo(
    () => subjects.filter((item) => item._id !== subject?._id),
    [subjects, subject?._id]
  );

  const selectedSubjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const item of subjects) map.set(item._id, item);
    return map;
  }, [subjects]);

  const componentBucketTotals = useMemo(() => {
    return getComponentBucketTotals(form) as Record<AssessmentBucket, number>;
  }, [form]);

  const renderSubjectLabel = useCallback((item: Subject) => {
    const code = item.code ? `${item.prefix}${item.code}` : item.prefix;
    return `${item.title} (${code})`;
  }, []);

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
    const theoryPeriodsPerWeek = Number(form.theoryPeriodsPerWeek);
    const practicalPeriodsPerWeek = Number(form.practicalPeriodsPerWeek);
    const theoryContinuous = Number(form.theoryContinuous);
    const theoryFinal = Number(form.theoryFinal);
    const practicalContinuous = Number(form.practicalContinuous);
    const practicalFinal = Number(form.practicalFinal);
    const totalMarks = Number(form.totalMarks);

    if (isNaN(code) || isNaN(credits) || isNaN(regulation)) {
      showToast({
        variant: "error",
        title: "Invalid numbers",
        description: "Code, credits, and regulation must be valid numbers.",
      });
      return;
    }

    if (credits <= 0) {
      showToast({
        variant: "error",
        title: "Invalid credits",
        description: "Credits are required and must be greater than 0.",
      });
      return;
    }

    if (
      (showTheoryPeriods && isNaN(theoryPeriodsPerWeek)) ||
      (showPracticalPeriods && isNaN(practicalPeriodsPerWeek))
    ) {
      showToast({
        variant: "error",
        title: "Invalid periods",
        description: "Periods per week must be valid numbers.",
      });
      return;
    }

    const invalidComponent = form.assessmentComponents.find(
      (item) => !item.title.trim() || isNaN(Number(item.fullMarks))
    );

    if (invalidComponent) {
      showToast({
        variant: "error",
        title: "Invalid components",
        description: "Each assessment component needs a title and valid full marks.",
      });
      return;
    }

    if (
      componentBucketTotals.THEORY_CONTINUOUS !== theoryContinuous ||
      componentBucketTotals.THEORY_FINAL !== theoryFinal ||
      componentBucketTotals.PRACTICAL_CONTINUOUS !== practicalContinuous ||
      componentBucketTotals.PRACTICAL_FINAL !== practicalFinal
    ) {
      showToast({
        variant: "error",
        title: "Bucket mismatch",
        description: "Component totals must exactly match the official bucket totals.",
      });
      return;
    }

    setSubmitting(true);

    try {
      let preRequisiteSubjects: SubjectInput["preRequisiteSubjects"] = [];

      if (isEdit) {
        const removedIds = initialPreReqIds.filter((id) => !form.preRequisiteIds.includes(id));
        const addedIds = form.preRequisiteIds.filter((id) => !initialPreReqIds.includes(id));

        preRequisiteSubjects = [
          ...removedIds.map((id) => ({ subject: id, isDeleted: true })),
          ...addedIds.map((id) => ({ subject: id })),
        ];
      } else {
        preRequisiteSubjects = form.preRequisiteIds.map((id) => ({ subject: id }));
      }

      const payload: SubjectInput = {
        title: form.title.trim(),
        prefix: form.prefix.trim(),
        code,
        credits,
        regulation,
        subjectType: form.subjectType,
        theoryPeriodsPerWeek,
        practicalPeriodsPerWeek,
        markingScheme: {
          theoryContinuous,
          theoryFinal,
          practicalContinuous,
          practicalFinal,
          totalMarks,
        },
        assessmentComponents: form.assessmentComponents.map((item, index) => ({
          code: item.code.trim() || undefined,
          title: item.title.trim(),
          bucket: item.bucket,
          componentType: item.componentType,
          fullMarks: Number(item.fullMarks),
          order: index + 1,
          isRequired: item.isRequired,
        })),
        requiredFacilities: form.requiredFacilities,
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
        description: isEdit ? "Subject updated successfully." : "Subject created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description: getSafeClientErrorMessage(
          error,
          isEdit ? "Unable to update subject." : "Unable to create subject."
        ),
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <BasicInfoSection form={form} updateField={updateField} />

        <PeriodsSection
          form={form}
          showTheoryPeriods={showTheoryPeriods}
          showPracticalPeriods={showPracticalPeriods}
          updateField={updateField}
        />

        <FacilitiesSection
          availableFacilities={availableFacilities}
          selectedFacilities={form.requiredFacilities}
          toggleFacility={toggleFacility}
        />

        <MarkingSchemeSection
          form={form}
          componentBucketTotals={componentBucketTotals}
          updateField={updateField}
        />

        <AssessmentComponentsSection
          components={form.assessmentComponents}
          addComponent={addComponent}
          removeComponent={removeComponent}
          updateComponent={updateComponent}
        />

        <PrerequisitesSection
          loadingSubjects={loadingSubjects}
          subjectsError={subjectsError}
          availableSubjects={availableSubjects}
          selectedPrerequisiteIds={form.preRequisiteIds}
          selectedSubjectMap={selectedSubjectMap}
          renderSubjectLabel={renderSubjectLabel}
          togglePreReq={togglePreReq}
        />

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

