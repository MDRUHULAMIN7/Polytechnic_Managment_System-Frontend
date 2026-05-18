import { BookOpen, User, Calendar, MapPin, Users, Info, PieChart, ShieldCheck } from "lucide-react";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import type { OfferedSubjectDetailsContentProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import {
  formatOfferedSubjectSchedule,
  formatScheduleBlock,
  renderValue,
} from "@/utils/dashboard/admin/offered-subject";
import { resolveName } from "@/utils/dashboard/admin/utils";

export function OfferedSubjectDetailsContent({
  details,
  error,
}: OfferedSubjectDetailsContentProps) {
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

  const instructorLabel =
    typeof details.instructor === "string"
      ? details.instructor
      : resolveName(details.instructor?.name);

  const semesterRegistrationLabel =
    typeof details.semesterRegistration === "string"
      ? details.semesterRegistration
      : `${details.semesterRegistration?.status ?? "--"} - ${
          details.semesterRegistration?.shift ?? "--"
        }`;

  return (
    <div className="space-y-6 text-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <BookOpen className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Subject</p>
          </div>
          <p className="mt-3 text-lg font-bold text-(--text)">{renderValue(details.subject)}</p>
        </div>
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <User className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Instructor</p>
          </div>
          <p className="mt-3 text-lg font-bold text-(--text)">{instructorLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <Calendar className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Academic Semester</p>
          </div>
          <p className="mt-3 font-semibold text-(--text)">{renderValue(details.academicSemester)}</p>
        </div>
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <Info className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Semester Registration</p>
          </div>
          <p className="mt-3 font-semibold text-(--text)">{semesterRegistrationLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <MapPin className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Department</p>
          </div>
          <p className="mt-3 font-semibold text-(--text)">{renderValue(details.academicDepartment)}</p>
        </div>
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <User className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Academic Instructor</p>
          </div>
          <p className="mt-3 font-semibold text-(--text)">{renderValue(details.academicInstructor)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-(--line) bg-(--surface) p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--line) pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-(--accent)/10 p-2.5 text-(--accent)">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-dim)">
                Marking Snapshot
              </p>
              <p className="mt-0.5 text-xs text-(--text-dim)">
                Frozen from the subject at the time this subject was offered.
              </p>
            </div>
          </div>
          <div className="rounded-full bg-(--surface-muted) px-4 py-1.5 text-xs font-bold text-(--text)">
            Status: {details.markingStatus ?? "--"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Theory Cont.", value: details.markingSchemeSnapshot?.theoryContinuous },
            { label: "Theory Final", value: details.markingSchemeSnapshot?.theoryFinal },
            { label: "Prac. Cont.", value: details.markingSchemeSnapshot?.practicalContinuous },
            { label: "Prac. Final", value: details.markingSchemeSnapshot?.practicalFinal },
            { label: "Total", value: details.markingSchemeSnapshot?.totalMarks, primary: true },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-4 transition-all ${
                item.primary
                  ? "border-(--accent)/30 bg-(--accent)/5 ring-1 ring-(--accent)/10"
                  : "border-(--line) bg-(--surface-muted)/30"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-dim)">
                {item.label}
              </p>
              <p className={`mt-2 text-xl font-black ${item.primary ? "text-(--accent)" : "text-(--text)"}`}>
                {item.value ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-(--text-dim)">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Release Visibility</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-(--line) bg-(--surface-muted)/20 p-4">
            <div>
              <p className="font-bold text-(--text)">Released Components</p>
              <p className="mt-1 text-xs text-(--text-dim)">
                Students only see marks after the instructor releases a component.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-(--accent)">
                {details.releasedComponentCodes?.length ?? 0}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                Currently released
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <Users className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Capacity</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-(--text)">
              {details.totalCapacity || details.maxCapacity}
            </span>
            <span className="text-sm font-bold text-(--text-dim)">/</span>
            <span className="text-lg font-bold text-(--text-dim)">{details.maxCapacity}</span>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
            Total / Remaining
          </p>
        </div>
        <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm sm:col-span-2">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <Calendar className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Schedule</p>
          </div>
          <p className="mt-3 text-lg font-bold text-(--text)">
            {formatOfferedSubjectSchedule(details)}
          </p>
          {details.scheduleBlocks?.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {details.scheduleBlocks.map((block, index) => (
                <div
                  key={`${block.day}-${block.startPeriod}-${index}`}
                  className="rounded-xl border border-(--line) bg-(--surface-muted)/40 px-4 py-2.5 text-xs font-medium text-(--text-dim)"
                >
                  {formatScheduleBlock(block)}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
