"use client";

import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { Search, User, BookOpen, Layers, Calendar, Users } from "lucide-react";

interface BasicInfoSectionProps {
  form: {
    academicInstructor: string;
    academicDepartment: string;
    instructor: string;
    semesterRegistration: string;
    subject: string;
    maxCapacity: string;
  };
  updateField: (field: string, value: string) => void;
  isEdit: boolean;
  academicInstructorQuery: string;
  setAcademicInstructorQuery: (value: string) => void;
  academicInstructorOptions: AcademicInstructor[];
  academicInstructorLoading: boolean;
  academicInstructorError: string | null;
  departmentQuery: string;
  setDepartmentQuery: (value: string) => void;
  departmentOptions: AcademicDepartment[];
  departmentLoading: boolean;
  departmentError: string | null;
  instructorQuery: string;
  setInstructorQuery: (value: string) => void;
  instructorOptions: Instructor[];
  instructorLoading: boolean;
  instructorError: string | null;
  semesterRegistrations: SemesterRegistration[];
  semesterLabel: string;
  offeredSummaryLoading: boolean;
  offeredSummaryError: string | null;
  offeredLabels: string[];
  subjectQuery: string;
  setSubjectQuery: (value: string) => void;
  subjectOptions: Subject[];
  subjectLoading: boolean;
  subjectError: string | null;
  renderRegistrationOption: (reg: SemesterRegistration) => string;
}

export function BasicInfoSection({
  form,
  updateField,
  isEdit,
  academicInstructorQuery,
  setAcademicInstructorQuery,
  academicInstructorOptions,
  academicInstructorLoading,
  academicInstructorError,
  departmentQuery,
  setDepartmentQuery,
  departmentOptions,
  departmentLoading,
  departmentError,
  instructorQuery,
  setInstructorQuery,
  instructorOptions,
  instructorLoading,
  instructorError,
  semesterRegistrations,
  semesterLabel,
  offeredSummaryLoading,
  offeredSummaryError,
  offeredLabels,
  subjectQuery,
  setSubjectQuery,
  subjectOptions,
  subjectLoading,
  subjectError,
  renderRegistrationOption,
}: BasicInfoSectionProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-(--line) bg-(--surface-muted)/20 p-5">
        <div className="flex items-center gap-2 text-(--text-dim)">
          <User className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Instructor Assignment</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-dim)">
              Academic Instructor
            </label>
            <div className="relative mt-1.5">
              <input
                type="search"
                value={academicInstructorQuery}
                onChange={(event) => setAcademicInstructorQuery(event.target.value)}
                disabled={isEdit}
                placeholder="Search academic instructor..."
                className="focus-ring h-10 w-full rounded-xl border border-(--line) bg-(--surface) pl-3 pr-9 text-sm transition-all focus:border-(--accent) disabled:opacity-60"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-4 w-4 text-(--text-dim)/30" />
              </div>
            </div>
            <select
              value={form.academicInstructor}
              onChange={(event) => updateField("academicInstructor", event.target.value)}
              disabled={isEdit}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) disabled:opacity-60"
            >
              <option value="">Select academic instructor</option>
              {academicInstructorOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            {academicInstructorLoading ? (
              <p className="mt-1.5 animate-pulse text-[10px] text-(--text-dim)">Loading instructors...</p>
            ) : academicInstructorError ? (
              <p className="mt-1.5 text-[10px] text-red-400">{academicInstructorError}</p>
            ) : (
              <p className="mt-1.5 text-[10px] text-(--text-dim) opacity-60">Type to search (max 50 results)</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-dim)">
              Instructor
            </label>
            <div className="relative mt-1.5">
              <input
                type="search"
                value={instructorQuery}
                onChange={(event) => setInstructorQuery(event.target.value)}
                disabled={isEdit || !form.academicInstructor}
                placeholder="Search instructor..."
                className="focus-ring h-10 w-full rounded-xl border border-(--line) bg-(--surface) pl-3 pr-9 text-sm transition-all focus:border-(--accent) disabled:opacity-60"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-4 w-4 text-(--text-dim)/30" />
              </div>
            </div>
            <select
              value={form.instructor}
              onChange={(event) => updateField("instructor", event.target.value)}
              disabled={isEdit || !form.academicInstructor}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) disabled:opacity-60"
            >
              <option value="">Select instructor</option>
              {instructorOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {resolveName(item.name)} ({item.designation})
                </option>
              ))}
            </select>
            {!form.academicInstructor ? (
              <p className="mt-1.5 text-[10px] text-(--text-dim) opacity-60">Select academic instructor first</p>
            ) : instructorLoading ? (
              <p className="mt-1.5 animate-pulse text-[10px] text-(--text-dim)">Loading instructors...</p>
            ) : instructorError ? (
              <p className="mt-1.5 text-[10px] text-red-400">{instructorError}</p>
            ) : (
              <p className="mt-1.5 text-[10px] text-(--text-dim) opacity-60">Type to search (max 50 results)</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-dim)">
              Department
            </label>
            <div className="relative mt-1.5">
              <input
                type="search"
                value={departmentQuery}
                onChange={(event) => setDepartmentQuery(event.target.value)}
                disabled={isEdit || !form.academicInstructor}
                placeholder="Search department..."
                className="focus-ring h-10 w-full rounded-xl border border-(--line) bg-(--surface) pl-3 pr-9 text-sm transition-all focus:border-(--accent) disabled:opacity-60"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-4 w-4 text-(--text-dim)/30" />
              </div>
            </div>
            <select
              value={form.academicDepartment}
              onChange={(event) => updateField("academicDepartment", event.target.value)}
              disabled={isEdit || !form.academicInstructor}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) disabled:opacity-60"
            >
              <option value="">Select department</option>
              {departmentOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            {!form.academicInstructor ? (
              <p className="mt-1.5 text-[10px] text-(--text-dim) opacity-60">Select academic instructor first</p>
            ) : departmentLoading ? (
              <p className="mt-1.5 animate-pulse text-[10px] text-(--text-dim)">Loading departments...</p>
            ) : departmentError ? (
              <p className="mt-1.5 text-[10px] text-red-400">{departmentError}</p>
            ) : (
              <p className="mt-1.5 text-[10px] text-(--text-dim) opacity-60">Type to search (max 50 results)</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-(--line) bg-(--surface-muted)/20 p-5">
        <div className="flex items-center gap-2 text-(--text-dim)">
          <BookOpen className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Subject & Registration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-dim)">
              Semester Registration
            </label>
            <div className="relative mt-1.5">
              <select
                value={form.semesterRegistration}
                onChange={(event) => updateField("semesterRegistration", event.target.value)}
                disabled={isEdit}
                className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) disabled:opacity-60"
              >
                <option value="">Select registration</option>
                {semesterRegistrations.map((registration) => (
                  <option key={registration._id} value={registration._id}>
                    {renderRegistrationOption(registration)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px]">
              <Calendar className="h-3 w-3 text-(--text-dim)" />
              <p className="text-(--text-dim)">
                Academic Semester: <span className="font-bold text-(--text)">{semesterLabel}</span>
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-(--line) bg-(--surface) p-2 text-[10px]">
              {offeredSummaryLoading ? (
                <p className="animate-pulse text-(--text-dim)">Loading offered subjects...</p>
              ) : offeredSummaryError ? (
                <p className="text-red-400">{offeredSummaryError}</p>
              ) : offeredLabels.length > 0 ? (
                <div className="space-y-1">
                  <p className="font-bold text-(--text-dim)">Offered subjects ({offeredLabels.length}):</p>
                  <p className="text-(--text) leading-relaxed">{offeredLabels.join(", ")}</p>
                </div>
              ) : (
                <p className="text-(--text-dim) opacity-60 italic">No subjects offered yet in this registration.</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-dim)">
              Subject
            </label>
            <div className="relative mt-1.5">
              <input
                type="search"
                value={subjectQuery}
                onChange={(event) => setSubjectQuery(event.target.value)}
                disabled={isEdit}
                placeholder="Search subject..."
                className="focus-ring h-10 w-full rounded-xl border border-(--line) bg-(--surface) pl-3 pr-9 text-sm transition-all focus:border-(--accent) disabled:opacity-60"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-4 w-4 text-(--text-dim)/30" />
              </div>
            </div>
            <select
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              disabled={isEdit}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) disabled:opacity-60"
            >
              <option value="">Select subject</option>
              {subjectOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
            {subjectLoading ? (
              <p className="mt-1.5 animate-pulse text-[10px] text-(--text-dim)">Loading subjects...</p>
            ) : subjectError ? (
              <p className="mt-1.5 text-[10px] text-red-400">{subjectError}</p>
            ) : (
              <p className="mt-1.5 text-[10px] text-(--text-dim) opacity-60">Type to search (max 50 results)</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-dim)">
              Max Capacity
            </label>
            <div className="relative mt-1.5">
              <input
                value={form.maxCapacity}
                onChange={(event) => updateField("maxCapacity", event.target.value)}
                placeholder="Enter capacity (e.g. 40)"
                className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-(--surface) pl-3 pr-10 text-sm transition-all focus:border-(--accent)"
                inputMode="numeric"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Users className="h-4 w-4 text-(--text-dim)/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
