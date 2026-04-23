import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type {
  SubjectFormAssessmentComponentState,
  SubjectFormState,
} from "@/lib/type/dashboard/admin/subject/ui";

export function createEmptySubjectComponent(
  bucket: SubjectFormAssessmentComponentState["bucket"] = "THEORY_CONTINUOUS",
): SubjectFormAssessmentComponentState {
  return {
    code: "",
    title: "",
    bucket,
    componentType: bucket.includes("FINAL") ? "written_exam" : "class_test",
    fullMarks: "",
    isRequired: true,
  };
}

export function createInitialSubjectFormState(): SubjectFormState {
  return {
    title: "",
    prefix: "",
    code: "",
    credits: "",
    regulation: "",
    subjectType: "THEORY",
    theoryContinuous: "0",
    theoryFinal: "0",
    practicalContinuous: "0",
    practicalFinal: "0",
    totalMarks: "0",
    assessmentComponents: [createEmptySubjectComponent()],
    preRequisiteIds: [],
  };
}

export function toSafeSubjectNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateSubjectTotalFromBuckets(form: SubjectFormState) {
  return (
    toSafeSubjectNumber(form.theoryContinuous) +
    toSafeSubjectNumber(form.theoryFinal) +
    toSafeSubjectNumber(form.practicalContinuous) +
    toSafeSubjectNumber(form.practicalFinal)
  );
}

export function createSubjectFormState(subject?: Subject | null): SubjectFormState {
  const subjectComponents = subject?.assessmentComponents ?? [];

  return {
    title: subject?.title ?? "",
    prefix: subject?.prefix ?? "",
    code: subject?.code ? String(subject.code) : "",
    credits: subject?.credits ? String(subject.credits) : "",
    regulation: subject?.regulation ? String(subject.regulation) : "",
    subjectType: subject?.subjectType ?? "THEORY",
    theoryContinuous: subject?.markingScheme
      ? String(subject.markingScheme.theoryContinuous)
      : "0",
    theoryFinal: subject?.markingScheme ? String(subject.markingScheme.theoryFinal) : "0",
    practicalContinuous: subject?.markingScheme
      ? String(subject.markingScheme.practicalContinuous)
      : "0",
    practicalFinal: subject?.markingScheme
      ? String(subject.markingScheme.practicalFinal)
      : "0",
    totalMarks: subject?.markingScheme ? String(subject.markingScheme.totalMarks) : "0",
    assessmentComponents:
      subjectComponents.length > 0
        ? subjectComponents.map((item) => ({
            code: item.code ?? "",
            title: item.title ?? "",
            bucket: item.bucket,
            componentType: item.componentType,
            fullMarks: String(item.fullMarks ?? 0),
            isRequired: item.isRequired ?? true,
          }))
        : [createEmptySubjectComponent()],
    preRequisiteIds: [],
  };
}
