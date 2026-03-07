import type { StudentDetailsContentProps } from "@/lib/type/dashboard/admin/student/ui";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import { formatDate } from "@/utils/common/utils";
import { StudentProfileImage } from "./student-profile-image";

function resolveDepartmentName(value?: AcademicDepartment | string) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name ?? "--";
}

function resolveSemesterLabel(value?: AcademicSemester | string) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.code ? `${value.name} (${value.code})` : value.name ?? "--";
}

function resolveInstructorName(value?: AcademicDepartment | string) {
  if (!value || typeof value === "string") {
    return "--";
  }

  const instructor = value.academicInstructor;
  if (!instructor) {
    return "--";
  }

  if (typeof instructor === "string") {
    return instructor || "--";
  }

  return instructor.name ?? "--";
}

function resolveName(name?: { firstName?: string; middleName?: string; lastName?: string }) {
  if (!name) {
    return "--";
  }

  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}

export function StudentDetailsContent({ details, error }: StudentDetailsContentProps) {
  if (error) {
    return <DashboardErrorBanner error={error} />;
  }

  if (!details) {
    return (
      <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-6 text-center text-sm text-(--text-dim)">
        No details available.
      </div>
    );
  }

  const createdAt = details.createdAt ?? details.user?.createdAt;
  const updatedAt = details.updatedAt ?? details.user?.updatedAt;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-col gap-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Student</p>
          <p className="mt-2 text-base font-semibold">{resolveName(details.name)}</p>
          <p className="mt-1 text-xs text-(--text-dim)">ID: {details.id}</p>
        </div>
        <StudentProfileImage
          src={details.profileImg}
          alt={resolveName(details.name)}
          className="h-16 w-16 rounded-full border border-(--line) object-cover"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Email</p>
          <p className="mt-2 font-medium wrap-break-word">{details.email}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Status</p>
          <p className="mt-2 font-medium capitalize">{details.user?.status ?? "--"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Gender</p>
          <p className="mt-2 font-medium capitalize">{details.gender}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Blood Group</p>
          <p className="mt-2 font-medium">{details.bloodGroup ?? "--"}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Date of Birth</p>
          <p className="mt-2 font-medium">{formatDate(details.dateOfBirth)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Contact</p>
          <p className="mt-2 font-medium">{details.contactNo}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Emergency Contact</p>
          <p className="mt-2 font-medium">{details.emergencyContactNo}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Academic Department</p>
          <p className="mt-2 font-medium">{resolveDepartmentName(details.academicDepartment)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Admission Semester</p>
          <p className="mt-2 font-medium">{resolveSemesterLabel(details.admissionSemester)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Academic Instructor</p>
          <p className="mt-2 font-medium">{resolveInstructorName(details.academicDepartment)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Present Address</p>
          <p className="mt-2 font-medium">{details.presentAddress}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Permanent Address</p>
          <p className="mt-2 font-medium">{details.permanentAddress}</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Guardian</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <p>Father: {details.guardian?.fatherName} ({details.guardian?.fatherOccupation})</p>
          <p>Father Contact: {details.guardian?.fatherContactNo}</p>
          <p>Mother: {details.guardian?.motherName} ({details.guardian?.motherOccupation})</p>
          <p>Mother Contact: {details.guardian?.motherContactNo}</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Local Guardian</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <p>Name: {details.localGuardian?.name}</p>
          <p>Occupation: {details.localGuardian?.occupation}</p>
          <p>Contact: {details.localGuardian?.contactNo}</p>
          <p>Address: {details.localGuardian?.address}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Created</p>
          <p className="mt-2 font-medium">{formatDate(createdAt)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Updated</p>
          <p className="mt-2 font-medium">{formatDate(updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
