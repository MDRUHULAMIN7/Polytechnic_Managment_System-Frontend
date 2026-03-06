import type { InstructorDetailsContentProps } from "@/lib/type/dashboard/admin/instructor/ui";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import { formatDate } from "@/utils/common/utils";
import { StudentProfileImage } from "../student/student-profile-image";

function resolveName(name?: { firstName?: string; middleName?: string; lastName?: string }) {
  if (!name) {
    return "--";
  }

  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}

function resolveDepartmentName(value?: AcademicDepartment | string) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name ?? "--";
}

function renderSubjectLabel(subject: Subject) {
  const title = subject.title ?? "--";
  const code = subject.code ? ` (${subject.code})` : "";
  return `${title}${code}`;
}

function renderOfferedSubjectLabel(value: OfferedSubject) {
  const subjectTitle =
    typeof value.subject === "string"
      ? value.subject
      : value.subject?.title ?? "--";
  const section = value.section ? `Sec ${value.section}` : "Section --";
  const registration =
    typeof value.semesterRegistration === "string"
      ? ""
      : value.semesterRegistration
        ? (() => {
            const sem = value.semesterRegistration.academicSemester;
            const semLabel =
              typeof sem === "string"
                ? ""
                : sem
                  ? `${sem.name ?? ""} ${sem.year ?? ""}`.trim()
                  : "";
            const status = value.semesterRegistration.status ?? "";
            const shift = value.semesterRegistration.shift ?? "";
            return [semLabel, status, shift].filter(Boolean).join(" | ");
          })()
        : "";
  const academicSemesterLabel =
    typeof value.academicSemester === "string"
      ? ""
      : value.academicSemester
        ? `${value.academicSemester.name ?? ""} ${value.academicSemester.year ?? ""}`.trim()
        : "";
  const semesterLabel = registration || academicSemesterLabel || "--";
  const daysLabel = value.days?.length ? value.days.join(", ") : "--";
  const timeLabel =
    value.startTime && value.endTime ? `${value.startTime}-${value.endTime}` : "--";
  return `${subjectTitle} · ${section} · ${daysLabel} ${timeLabel} · ${semesterLabel}`;
}

export function InstructorDetailsContent({
  details,
  error,
  assignedSubjects = [],
  offeredSubjects = [],
  assignedError,
  offeredError,
  showSummary = true,
}: InstructorDetailsContentProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!details) {
    return (
      <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-6 text-center text-sm text-(--text-dim)">
        No details available.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {showSummary ? (
        <div className="flex flex-col gap-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Instructor
            </p>
            <p className="mt-2 text-base font-semibold">{resolveName(details.name)}</p>
            <p className="mt-1 text-xs text-(--text-dim)">ID: {details.id}</p>
          </div>
          <StudentProfileImage
            src={details.profileImg}
            alt={resolveName(details.name)}
            className="h-16 w-16 rounded-full border border-(--line) object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Email</p>
          <p className="mt-2 font-medium break-words">{details.email}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Status</p>
          <p className="mt-2 font-medium capitalize">{details.user?.status ?? "--"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Designation
          </p>
          <p className="mt-2 font-medium">{details.designation}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Gender</p>
          <p className="mt-2 font-medium capitalize">{details.gender}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Blood Group
          </p>
          <p className="mt-2 font-medium">{details.bloogGroup ?? "--"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Date of Birth
          </p>
          <p className="mt-2 font-medium">{formatDate(details.dateOfBirth)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Contact
          </p>
          <p className="mt-2 font-medium">{details.contactNo}</p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Emergency: {details.emergencyContactNo}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Department
          </p>
          <p className="mt-2 font-medium">
            {resolveDepartmentName(details.academicDepartment)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-(--line) bg-(--surface) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Assigned Subjects
          </p>
          {assignedError ? (
            <p className="mt-2 text-sm text-red-400">{assignedError}</p>
          ) : assignedSubjects.length === 0 ? (
            <p className="mt-2 text-sm text-(--text-dim)">No assigned subjects.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-(--text-dim)">
              {assignedSubjects.map((subject) => (
                <li key={subject._id} className="font-medium text-(--text)">
                  {renderSubjectLabel(subject)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Offered Subjects
          </p>
          {offeredError ? (
            <p className="mt-2 text-sm text-red-400">{offeredError}</p>
          ) : offeredSubjects.length === 0 ? (
            <p className="mt-2 text-sm text-(--text-dim)">No offered subjects.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-(--text-dim)">
              {offeredSubjects.map((item) => (
                <li key={item._id} className="font-medium text-(--text)">
                  {renderOfferedSubjectLabel(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Present Address
          </p>
          <p className="mt-2 font-medium">{details.presentAddress}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Permanent Address
          </p>
          <p className="mt-2 font-medium">{details.permanentAddress}</p>
        </div>
      </div>
    </div>
  );
}
