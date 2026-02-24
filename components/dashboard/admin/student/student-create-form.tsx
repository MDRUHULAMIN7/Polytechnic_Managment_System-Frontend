"use client";

import type { UseFormReturn } from "react-hook-form";
import type { AcademicDepartment, AcademicSemester } from "@/lib/api/types";
import {
  STUDENT_BLOOD_GROUPS,
  STUDENT_GENDERS,
  type CreateStudentFormValues,
} from "@/lib/utils/student/student-utils";

type StudentCreateFormProps = {
  form: UseFormReturn<CreateStudentFormValues>;
  departments: AcademicDepartment[];
  semesters: AcademicSemester[];
  loadingDropdowns: boolean;
  onSubmit: ReturnType<UseFormReturn<CreateStudentFormValues>["handleSubmit"]>;
  onCancel: () => void;
};

export function StudentCreateForm({
  form,
  departments,
  semesters,
  loadingDropdowns,
  onSubmit,
  onCancel,
}: StudentCreateFormProps) {
  const dropdownUnavailable =
    loadingDropdowns || departments.length === 0 || semesters.length === 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="create-password"
            className="mb-1 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="create-password"
            type="password"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            placeholder="Temporary password"
            {...form.register("password", {
              required: "Password is required.",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters.",
              },
              maxLength: {
                value: 20,
                message: "Password can be at most 20 characters.",
              },
            })}
          />
          {form.formState.errors.password ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-email"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="create-email"
            type="email"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            placeholder="student@domain.com"
            {...form.register("email", { required: "Email is required." })}
          />
          {form.formState.errors.email ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="create-first-name"
            className="mb-1 block text-sm font-medium"
          >
            First Name
          </label>
          <input
            id="create-first-name"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("firstName", {
              required: "First name is required.",
            })}
          />
        </div>
        <div>
          <label
            htmlFor="create-middle-name"
            className="mb-1 block text-sm font-medium"
          >
            Middle Name
          </label>
          <input
            id="create-middle-name"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("middleName")}
          />
        </div>
        <div>
          <label
            htmlFor="create-last-name"
            className="mb-1 block text-sm font-medium"
          >
            Last Name
          </label>
          <input
            id="create-last-name"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("lastName", {
              required: "Last name is required.",
            })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label
            htmlFor="create-gender"
            className="mb-1 block text-sm font-medium"
          >
            Gender
          </label>
          <select
            id="create-gender"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
            {...form.register("gender", { required: "Gender is required." })}
          >
            <option value="">Select gender</option>
            {STUDENT_GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="create-blood-group"
            className="mb-1 block text-sm font-medium"
          >
            Blood Group
          </label>
          <select
            id="create-blood-group"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
            {...form.register("bloodGroup")}
          >
            <option value="">Select blood group</option>
            {STUDENT_BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="create-date-of-birth"
            className="mb-1 block text-sm font-medium"
          >
            Date of Birth
          </label>
          <input
            id="create-date-of-birth"
            type="date"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("dateOfBirth")}
          />
        </div>
        <div>
          <label
            htmlFor="create-profile-file"
            className="mb-1 block text-sm font-medium"
          >
            Profile Image
          </label>
          <input
            id="create-profile-file"
            type="file"
            accept="image/*"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-(--surface-2) file:px-2 file:py-1"
            {...form.register("profileFile")}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="create-contact-no"
            className="mb-1 block text-sm font-medium"
          >
            Contact No
          </label>
          <input
            id="create-contact-no"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("contactNo", {
              required: "Contact number is required.",
            })}
          />
        </div>
        <div>
          <label
            htmlFor="create-emergency-contact-no"
            className="mb-1 block text-sm font-medium"
          >
            Emergency Contact No
          </label>
          <input
            id="create-emergency-contact-no"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("emergencyContactNo", {
              required: "Emergency contact is required.",
            })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="create-department"
            className="mb-1 block text-sm font-medium"
          >
            Academic Department
          </label>
          <select
            id="create-department"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
            disabled={dropdownUnavailable}
            {...form.register("academicDepartment", {
              required: "Academic department is required.",
            })}
          >
            <option value="">
              {loadingDropdowns
                ? "Loading..."
                : departments.length === 0
                  ? "No department found"
                  : "Select department"}
            </option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="create-semester"
            className="mb-1 block text-sm font-medium"
          >
            Admission Semester
          </label>
          <select
            id="create-semester"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
            disabled={dropdownUnavailable}
            {...form.register("admissionSemester", {
              required: "Admission semester is required.",
            })}
          >
            <option value="">
              {loadingDropdowns
                ? "Loading..."
                : semesters.length === 0
                  ? "No semester found"
                  : "Select semester"}
            </option>
            {semesters.map((semester) => (
              <option key={semester._id} value={semester._id}>
                {`${semester.name} ${semester.year}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="create-present-address"
          className="mb-1 block text-sm font-medium"
        >
          Present Address
        </label>
        <input
          id="create-present-address"
          type="text"
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
          {...form.register("presentAddress", {
            required: "Present address is required.",
          })}
        />
      </div>
      <div>
        <label
          htmlFor="create-permanent-address"
          className="mb-1 block text-sm font-medium"
        >
          Permanent Address
        </label>
        <input
          id="create-permanent-address"
          type="text"
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
          {...form.register("permanentAddress", {
            required: "Permanent address is required.",
          })}
        />
      </div>

      <div className="rounded-xl border border-(--line) p-3">
        <p className="mb-2 text-sm font-semibold">Guardian Information</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Father Name"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("fatherName", {
              required: "Father name is required.",
            })}
          />
          <input
            type="text"
            placeholder="Father Occupation"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("fatherOccupation", {
              required: "Father occupation is required.",
            })}
          />
          <input
            type="text"
            placeholder="Father Contact"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("fatherContactNo", {
              required: "Father contact is required.",
            })}
          />
          <input
            type="text"
            placeholder="Mother Name"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("motherName", {
              required: "Mother name is required.",
            })}
          />
          <input
            type="text"
            placeholder="Mother Occupation"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("motherOccupation", {
              required: "Mother occupation is required.",
            })}
          />
          <input
            type="text"
            placeholder="Mother Contact"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("motherContactNo", {
              required: "Mother contact is required.",
            })}
          />
        </div>
      </div>

      <div className="rounded-xl border border-(--line) p-3">
        <p className="mb-2 text-sm font-semibold">Local Guardian Information</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Name"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("localGuardianName", {
              required: "Local guardian name is required.",
            })}
          />
          <input
            type="text"
            placeholder="Occupation"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("localGuardianOccupation", {
              required: "Local guardian occupation is required.",
            })}
          />
          <input
            type="text"
            placeholder="Contact No"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("localGuardianContactNo", {
              required: "Local guardian contact is required.",
            })}
          />
          <input
            type="text"
            placeholder="Address"
            className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("localGuardianAddress", {
              required: "Local guardian address is required.",
            })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring rounded-lg border border-(--line) px-3 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={form.formState.isSubmitting || dropdownUnavailable}
          className="focus-ring rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-(--primary-ink) disabled:opacity-65"
        >
          {form.formState.isSubmitting ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
