/**
 * Curriculum Planning - Step 1 Component
 * Initial Selection & Setup (Academic Instructor → Department → Semester → Capacity)
 */

"use client";

import { useState } from "react";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { CurriculumPlanningStep1Data } from "@/lib/type/dashboard/admin/curriculum-planning";

interface CurriculumPlanningStep1Props {
  supportData: {
    academicInstructors: AcademicInstructor[];
    academicDepartments: AcademicDepartment[];
    semesterRegistrations: SemesterRegistration[];
  };
  initialData?: CurriculumPlanningStep1Data;
  onNext: (data: CurriculumPlanningStep1Data) => void;
  loading?: boolean;
  error?: string | null;
}

export function CurriculumPlanningStep1({
  supportData,
  initialData,
  onNext,
  loading = false,
  error = null,
}: CurriculumPlanningStep1Props) {
  function getDepartmentInstructorId(department: AcademicDepartment) {
    const linkedInstructor = department.academicInstructor;
    if (!linkedInstructor) {
      return "";
    }

    return typeof linkedInstructor === "string" ? linkedInstructor : linkedInstructor._id;
  }

  function getSemesterDepartmentId(registration: SemesterRegistration) {
    const registrationRecord = registration as SemesterRegistration & {
      academicDepartment?: string | { _id?: string };
      department?: string | { _id?: string };
      academicSemester?: AcademicSemester & {
        academicDepartment?: string | { _id?: string };
        department?: string | { _id?: string };
      };
    };

    const candidates = [
      registrationRecord.academicDepartment,
      registrationRecord.department,
      typeof registrationRecord.academicSemester === "string"
        ? undefined
        : registrationRecord.academicSemester?.academicDepartment,
      typeof registrationRecord.academicSemester === "string"
        ? undefined
        : registrationRecord.academicSemester?.department,
    ];

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      return typeof candidate === "string" ? candidate : candidate._id ?? "";
    }

    return "";
  }

  function formatSemesterLabel(registration: SemesterRegistration) {
    const semester = registration.academicSemester;
    const semesterLabel =
      typeof semester === "string"
        ? semester
        : `${semester?.name ?? ""} ${semester?.year ?? ""}`.trim();

    return [semesterLabel || "Unnamed semester", registration.shift].filter(Boolean).join(" | ");
  }

  const [selectedInstructor, setSelectedInstructor] = useState(
    initialData?.academicInstructorId || "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    initialData?.academicDepartmentId || "",
  );
  const [selectedSemester, setSelectedSemester] = useState(
    initialData?.semesterRegistrationId || "",
  );
  const [capacity, setCapacity] = useState(initialData?.maxCapacity?.toString() || "40");

  // Filter departments based on selected instructor
  const availableDepartments = selectedInstructor
    ? supportData.academicDepartments.filter(
        (department) => getDepartmentInstructorId(department) === selectedInstructor,
      )
    : [];

  // Filter semesters based on selected department
  const availableSemesters = selectedDepartment
    ? supportData.semesterRegistrations.filter(
        (registration) => {
          const registrationDepartmentId = getSemesterDepartmentId(registration);
          const matchesDepartment =
            !registrationDepartmentId || registrationDepartmentId === selectedDepartment;

          return matchesDepartment && registration.status?.toUpperCase() === "UPCOMING";
        },
      )
    : [];

  const isValid =
    selectedInstructor &&
    selectedDepartment &&
    selectedSemester &&
    capacity &&
    parseInt(capacity) >= 1 &&
    parseInt(capacity) <= 60;

  function handleNext() {
    if (!isValid) return;

    onNext({
      academicInstructorId: selectedInstructor,
      academicDepartmentId: selectedDepartment,
      semesterRegistrationId: selectedSemester,
      maxCapacity: parseInt(capacity),
    });
  }

  return (
    <div className="space-y-6 rounded-lg border border-(--line) bg-(--surface) p-6">
      <div>
        <h2 className="text-lg font-semibold text-(--text)">
          Step 1: Initial Selection & Setup
        </h2>
        <p className="mt-1 text-sm text-(--text-dim)">
          Select an academic instructor, department, semester, and maximum capacity
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Academic Instructor */}
        <div>
          <label className="block text-sm font-medium text-(--text)">
            Academic Instructor *
          </label>
          <select
            value={selectedInstructor}
            onChange={(e) => {
              setSelectedInstructor(e.target.value);
              setSelectedDepartment("");
              setSelectedSemester("");
            }}
            disabled={loading}
            className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-(--text) disabled:opacity-50"
          >
            <option value="">Select an instructor...</option>
            {supportData.academicInstructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Department */}
        <div>
          <label className="block text-sm font-medium text-(--text)">
            Academic Department *
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedSemester("");
            }}
            disabled={loading || availableDepartments.length === 0}
            className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-(--text) disabled:opacity-50"
          >
            <option value="">
              {availableDepartments.length === 0
                ? "Select instructor first..."
                : "Select a department..."}
            </option>
            {availableDepartments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium text-(--text)">
            Semester (Upcoming) *
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            disabled={loading || availableSemesters.length === 0}
            className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-(--text) disabled:opacity-50"
          >
            <option value="">
              {availableSemesters.length === 0
                ? "Select department first..."
                : "Select a semester..."}
            </option>
            {availableSemesters.map((registration) => (
              <option key={registration._id} value={registration._id}>
                {formatSemesterLabel(registration)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-(--text-dim)">
            Only upcoming semester registrations are shown for the selected department.
          </p>
        </div>

        {/* Maximum Capacity */}
        <div>
          <label className="block text-sm font-medium text-(--text)">
            Maximum Capacity (1-60) *
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-(--text) disabled:opacity-50"
            placeholder="40"
          />
          <p className="mt-1 text-xs text-(--text-dim)">
            Maximum number of students per class
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleNext}
          disabled={!isValid || loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Next: Subject & Instructor Assignment"}
        </button>
      </div>
    </div>
  );
}
