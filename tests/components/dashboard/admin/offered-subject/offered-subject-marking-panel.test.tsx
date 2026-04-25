import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OfferedSubjectMarkingPanel } from "@/components/dashboard/admin/offered-subject/offered-subject-marking-panel";
import type { OfferedSubjectMarkSheet } from "@/lib/type/dashboard/admin/enrolled-subject";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/api/dashboard/admin/enrolled-subject", () => ({
  getOfferedSubjectMarkSheet: vi.fn(),
  releaseOfferedSubjectComponent: vi.fn(),
  updateOfferedSubjectStudentMarks: vi.fn(),
}));

vi.mock("@/utils/common/toast", () => ({
  showToast: vi.fn(),
}));

const markSheet: OfferedSubjectMarkSheet = {
  offeredSubject: {
    _id: "offered-subject-1",
    semesterRegistration: "semester-registration-1",
    academicSemester: "academic-semester-1",
    academicInstructor: "academic-instructor-1",
    academicDepartment: "academic-department-1",
    subject: "subject-1",
    instructor: "instructor-1",
    maxCapacity: 40,
    days: ["Sun"],
    startTime: "08:00",
    endTime: "09:00",
    assessmentComponentsSnapshot: [
      {
        title: "Theory Continuous",
        code: "TC-1",
        bucket: "THEORY_CONTINUOUS",
        componentType: "written_exam",
        fullMarks: 40,
        order: 1,
        isRequired: true,
      },
    ],
    releasedComponentCodes: [],
  },
  enrolledSubjects: [
    {
      _id: "enrolled-subject-1",
      student: {
        _id: "student-1",
        id: "2027010001",
        name: {
          firstName: "Ruhul",
          middleName: "A",
          lastName: "Amin",
        },
      },
      markEntries: [
        {
          componentCode: "TC-1",
          componentTitle: "Theory Continuous",
          bucket: "THEORY_CONTINUOUS",
          componentType: "written_exam",
          fullMarks: 40,
          order: 1,
          isRequired: true,
          obtainedMarks: 35,
          isReleased: false,
          releasedAt: null,
          remarks: "",
          lastUpdatedAt: null,
          lastUpdatedBy: null,
        },
      ],
      markSummary: {
        theoryContinuous: 35,
        theoryFinal: 0,
        practicalContinuous: 0,
        practicalFinal: 0,
        releasedTheoryContinuous: 0,
        releasedTheoryFinal: 0,
        releasedPracticalContinuous: 0,
        releasedPracticalFinal: 0,
        total: 35,
        releasedTotal: 0,
        totalMarks: 40,
        percentage: 87.5,
        releasedPercentage: 0,
        releasedMarks: 0,
      },
      grade: "A",
      gradePoints: 4,
      resultStatus: "IN_PROGRESS",
      finalResultPublishedAt: null,
    },
  ],
};

describe("OfferedSubjectMarkingPanel", () => {
  it("shows the report list and lets the instructor select a student before marking", async () => {
    render(<OfferedSubjectMarkingPanel initialData={markSheet} mode="manage" />);
    const user = userEvent.setup();

    expect(screen.getByText("Student Report")).toBeInTheDocument();
    expect(screen.getAllByText("Ruhul A Amin").length).toBeGreaterThan(0);
    expect(screen.getByText("2027010001")).toBeInTheDocument();
    expect(screen.getByText("35 / 40")).toBeInTheDocument();
    expect(screen.getByText("Select a student row to enter or update marks.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Student"), "student-1");

    expect(screen.getByText("Ruhul A Amin")).toBeInTheDocument();
    expect(screen.getByText("ID: 2027010001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("35")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Marks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Release" })).toBeInTheDocument();
  });

  it("shows a read-only admin view after student selection", async () => {
    render(<OfferedSubjectMarkingPanel initialData={markSheet} mode="view" />);
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText("Student"), "student-1");

    expect(screen.getByText("Review mode")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Marks" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Release" })).not.toBeInTheDocument();
    expect(screen.getAllByText("35").length).toBeGreaterThan(0);
  });
});
