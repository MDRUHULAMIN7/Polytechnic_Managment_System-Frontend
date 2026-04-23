import type {
  AssessmentBucket,
  AssessmentComponentType,
  SubjectType,
} from "@/lib/type/dashboard/admin/subject";

export const subjectTypeOptions: Array<{ value: SubjectType; label: string }> = [
  { value: "THEORY", label: "Theory" },
  { value: "THEORY_PRACTICAL", label: "Theory + Practical" },
  { value: "PRACTICAL_ONLY", label: "Practical Only" },
  { value: "PROJECT", label: "Project" },
  { value: "INDUSTRIAL_ATTACHMENT", label: "Industrial Attachment" },
];

export const assessmentBucketOptions: Array<{
  value: AssessmentBucket;
  label: string;
}> = [
  { value: "THEORY_CONTINUOUS", label: "Theory Continuous" },
  { value: "THEORY_FINAL", label: "Theory Final" },
  { value: "PRACTICAL_CONTINUOUS", label: "Practical Continuous" },
  { value: "PRACTICAL_FINAL", label: "Practical Final" },
];

export const componentTypeOptions: Array<{
  value: AssessmentComponentType;
  label: string;
}> = [
  { value: "class_test", label: "Class Test" },
  { value: "attendance", label: "Attendance" },
  { value: "assignment", label: "Assignment" },
  { value: "presentation", label: "Presentation" },
  { value: "teacher_assessment", label: "Teacher Assessment" },
  { value: "written_exam", label: "Written Exam" },
  { value: "lab_performance", label: "Lab Performance" },
  { value: "lab_report", label: "Lab Report" },
  { value: "viva", label: "Viva" },
  { value: "practical_exam", label: "Practical Exam" },
  { value: "project_review", label: "Project Review" },
  { value: "industry_evaluation", label: "Industry Evaluation" },
];
