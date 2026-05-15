"use client";

import { CheckCircle2, CircleDashed, LockKeyhole, MapPinned, BookOpen, UserRound } from "lucide-react";
import { useMemo } from "react";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import { resolveInstructorDisplayName } from "@/utils/dashboard/admin/instructor/resolve-display-name";
import { formatRoomOptionLabel } from "@/utils/dashboard/admin/room/format-room-label";

function subjectWeekPlanSummary(subject: Subject): string {
  const theory = subject.theoryPeriodsPerWeek ?? 0;
  const practical = subject.practicalPeriodsPerWeek ?? 0;
  const total = theory + practical;

  if (theory === 0 && practical === 0) {
    return "Weekly periods are not configured on this subject yet.";
  }

  return `Theory ${theory}/wk | Practical ${practical}/wk | Total ${total}/wk`;
}

export function ManualWorkspaceToolbar({
  subjects,
  instructors,
  rooms,
  subjectId,
  instructorId,
  roomId,
  maxCapacity,
  onSubjectChange,
  onInstructorChange,
  onRoomChange,
  onSave,
  saving,
  saveDisabledReason,
}: {
  subjects: Subject[];
  instructors: Instructor[];
  rooms: Room[];
  subjectId: string;
  instructorId: string;
  roomId: string;
  maxCapacity: number;
  onSubjectChange: (id: string) => void;
  onInstructorChange: (id: string) => void;
  onRoomChange: (id: string) => void;
  onSave: () => void;
  saving: boolean;
  saveDisabledReason: string | null;
}) {
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === subjectId),
    [subjectId, subjects],
  );
  const selectedInstructor = useMemo(
    () => instructors.find((instructor) => instructor._id === instructorId),
    [instructorId, instructors],
  );
  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === roomId),
    [roomId, rooms],
  );

  const steps = [
    {
      key: "subject",
      title: "1. Subject",
      description: selectedSubject
        ? `${selectedSubject.title} selected. Credits ${selectedSubject.credits}. ${subjectWeekPlanSummary(selectedSubject)}`
        : "Select the subject first. The system will show credit and weekly period guidance.",
      complete: Boolean(selectedSubject),
      icon: BookOpen,
    },
    {
      key: "instructor",
      title: "2. Instructor",
      description: selectedInstructor
        ? `${resolveInstructorDisplayName(selectedInstructor.name)} selected. Busy instructor slots are now blocked in the routine grid.`
        : "Select the instructor next. Their busy slots will be marked as unavailable.",
      complete: Boolean(selectedInstructor),
      icon: UserRound,
    },
    {
      key: "room",
      title: "3. Room",
      description: selectedRoom
        ? `${formatRoomOptionLabel(selectedRoom)} selected. Busy room slots are now blocked in the routine grid.`
        : "Select the room before adding any block. Occupied room slots will stay locked.",
      complete: Boolean(selectedRoom),
      icon: MapPinned,
    },
  ] as const;

  return (
    <div className="space-y-4 rounded-2xl border border-(--line) bg-(--surface) p-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`rounded-2xl border px-4 py-3 ${
                step.complete
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-(--line) bg-(--surface-muted)/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-(--accent)" />
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text)">
                  {step.title}
                </p>
                {step.complete ? (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                ) : (
                  <CircleDashed className="ml-auto h-4 w-4 text-(--text-dim)" />
                )}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-(--text-dim)">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="text-[10px] font-semibold uppercase text-(--text-dim)">
            Subject
          </label>
          <select
            value={subjectId}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-(--line) bg-(--surface-alt) px-3 py-2 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.title} ({subject.credits} cr
                {typeof subject.theoryPeriodsPerWeek === "number" ||
                typeof subject.practicalPeriodsPerWeek === "number"
                  ? ` | ${(subject.theoryPeriodsPerWeek ?? 0) + (subject.practicalPeriodsPerWeek ?? 0)}p/wk`
                  : ""}
                )
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-(--text-dim)">
            Subject credit and weekly periods appear as soon as the subject is selected.
          </p>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="text-[10px] font-semibold uppercase text-(--text-dim)">
            Instructor
          </label>
          <select
            value={instructorId}
            onChange={(event) => onInstructorChange(event.target.value)}
            disabled={!subjectId}
            className="mt-1 w-full rounded-lg border border-(--line) bg-(--surface-alt) px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Select instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {resolveInstructorDisplayName(instructor.name)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-(--text-dim)">
            {subjectId
              ? "After selecting an instructor, their busy periods become blocked in the grid."
              : "Select a subject first to unlock instructor selection."}
          </p>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="text-[10px] font-semibold uppercase text-(--text-dim)">
            Room
          </label>
          <select
            value={roomId}
            onChange={(event) => onRoomChange(event.target.value)}
            disabled={!instructorId}
            className="mt-1 w-full rounded-lg border border-(--line) bg-(--surface-alt) px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {formatRoomOptionLabel(room)} | Cap {room.capacity}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-(--text-dim)">
            {instructorId
              ? "After selecting a room, occupied room periods are blocked and cannot be added."
              : "Select an instructor first to unlock room selection."}
          </p>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase text-(--text-dim)">
            Max capacity
          </label>
          <div className="mt-1 flex h-10 items-center rounded-lg border border-(--line) bg-(--surface-muted) px-3 text-sm font-medium">
            {maxCapacity}
          </div>
        </div>

        <div className="ml-auto flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={onSave}
            disabled={Boolean(saveDisabledReason) || saving}
            className="rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold text-(--accent-ink) disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save offered subject"}
          </button>
          {saveDisabledReason ? (
            <p className="max-w-xs text-right text-[11px] text-amber-300">
              {saveDisabledReason}
            </p>
          ) : null}
        </div>
      </div>

      {selectedSubject ? (
        <div className="rounded-xl border border-(--line) bg-(--surface-muted)/40 px-3 py-2 text-[11px] text-(--text)">
          <span className="font-semibold text-(--text)">{selectedSubject.title}</span>
          <span className="mx-2 text-(--text-dim)">|</span>
          <span>Credits {selectedSubject.credits}</span>
          <span className="mx-2 text-(--text-dim)">|</span>
          <span className="text-(--text-dim)">{subjectWeekPlanSummary(selectedSubject)}</span>
        </div>
      ) : null}

      {!instructorId ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
          Select an instructor to unlock the grid. Instructor-busy slots will stay blocked automatically.
        </div>
      ) : !roomId ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
          The grid is now filtered by instructor availability. Select a room to add room-busy blocking on top.
        </div>
      ) : null}
    </div>
  );
}
