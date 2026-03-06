"use client";

import { useMemo, useState } from "react";
import type { Curriculum } from "@/lib/type/dashboard/admin/curriculum";
import type {
  OfferedSubject,
  OfferedSubjectDay,
} from "@/lib/type/dashboard/admin/offered-subject";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { parseTimeToMinutes } from "@/utils/dashboard/admin/offered-subject";
import { resolveId, resolveName } from "@/utils/dashboard/admin/utils";

type CurriculumOutlineProps = {
  subjects: Curriculum["subjects"];
  semesterRegistrationId?: string;
  academicDepartmentId?: string;
};

function renderSubjectTitle(value: unknown) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "title" in value) {
    return (value as { title?: string }).title ?? "--";
  }
  return "--";
}

function renderInstructorName(value: OfferedSubject["instructor"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  return resolveName(value.name);
}

function renderScheduleLabel(value: OfferedSubject) {
  const daysLabel = value.days?.length ? value.days.join(", ") : "--";
  const timeLabel =
    value.startTime && value.endTime ? `${value.startTime} - ${value.endTime}` : "";
  return timeLabel ? `${daysLabel} (${timeLabel})` : daysLabel;
}

const dayOrder: OfferedSubjectDay[] = [
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
];

export function CurriculumOutline({
  subjects,
  semesterRegistrationId,
  academicDepartmentId,
}: CurriculumOutlineProps) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offeredSubjects, setOfferedSubjects] = useState<OfferedSubject[]>([]);

  const subjectIds = useMemo(
    () =>
      new Set(
        (subjects ?? [])
          .map((subject) => resolveId(subject))
          .filter(Boolean) as string[],
      ),
    [subjects],
  );

  async function loadOutline() {
    if (loaded || loading) return;

    if (!semesterRegistrationId || !academicDepartmentId) {
      setError("Missing semester registration or department info.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getOfferedSubjects({
        page: 1,
        limit: 1000,
        sort: "-createdAt",
        semesterRegistration: semesterRegistrationId,
        academicDepartment: academicDepartmentId,
      });
      setOfferedSubjects(data.result ?? []);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load outline.");
    } finally {
      setLoading(false);
    }
  }

  const offeredByCurriculum = useMemo(() => {
    if (!subjectIds.size) return offeredSubjects;
    return offeredSubjects.filter((item) => {
      const subjectId = resolveId(item.subject);
      return subjectId ? subjectIds.has(subjectId) : false;
    });
  }, [offeredSubjects, subjectIds]);

  const missingSubjects = useMemo(() => {
    const offeredSubjectIds = new Set(
      offeredByCurriculum
        .map((item) => resolveId(item.subject))
        .filter(Boolean) as string[],
    );

    return (subjects ?? []).filter((subject) => {
      const subjectId = resolveId(subject);
      return subjectId ? !offeredSubjectIds.has(subjectId) : false;
    });
  }, [offeredByCurriculum, subjects]);

  const scheduleByDay = useMemo(() => {
    const initial = dayOrder.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {} as Record<OfferedSubjectDay, Array<{
      key: string;
      subject: string;
      instructor: string;
      startTime: string;
      endTime: string;
      section: number | null;
      startMinutes: number | null;
    }>>);

    for (const item of offeredByCurriculum) {
      const entry = {
        key: item._id,
        subject: renderSubjectTitle(item.subject),
        instructor: renderInstructorName(item.instructor),
        startTime: item.startTime,
        endTime: item.endTime,
        section: item.section ?? null,
        startMinutes: parseTimeToMinutes(item.startTime),
      };

      for (const day of item.days ?? []) {
        initial[day]?.push(entry);
      }
    }

    for (const day of dayOrder) {
      initial[day]?.sort((a, b) => {
        const aTime = a.startMinutes ?? Number.POSITIVE_INFINITY;
        const bTime = b.startMinutes ?? Number.POSITIVE_INFINITY;
        if (aTime === bTime) {
          return a.subject.localeCompare(b.subject);
        }
        return aTime - bTime;
      });
    }

    return initial;
  }, [offeredByCurriculum]);

  return (
    <details
      className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-3"
      onToggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) {
          void loadOutline();
        }
      }}
    >
      <summary className="cursor-pointer list-none">
        <span className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)">
          See Full Outline
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Offered Subjects
            </p>
            {loaded ? (
              <p className="text-xs text-(--text-dim)">
                {offeredByCurriculum.length} offered
              </p>
            ) : null}
          </div>

          {loading ? (
            <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm text-(--text-dim)">
              Loading outline...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          {!loading && !error && loaded && offeredByCurriculum.length === 0 ? (
            <p className="text-sm text-(--text-dim)">
              No offered subjects found for this curriculum.
            </p>
          ) : null}

          {!loading && !error && offeredByCurriculum.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {offeredByCurriculum.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-(--line) bg-(--surface) px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                        Subject
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {renderSubjectTitle(item.subject)}
                      </p>
                      <p className="mt-1 text-xs text-(--text-dim)">
                        Instructor: {renderInstructorName(item.instructor)}
                      </p>
                    </div>
                    <span className="rounded-lg border border-(--line) px-2.5 py-1 text-xs font-semibold text-(--text-dim)">
                      Section {item.section}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-(--text-dim) sm:grid-cols-2">
                    <div>Capacity: {item.maxCapacity}</div>
                    <div>Schedule: {renderScheduleLabel(item)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && !error && loaded && missingSubjects.length > 0 ? (
            <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-xs text-(--text-dim)">
              Not offered yet:{" "}
              {missingSubjects.map((item) => renderSubjectTitle(item)).join(", ")}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Weekly Planner
          </p>
          {!loaded ? (
            <p className="text-sm text-(--text-dim)">
              Open outline to load the weekly planner.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dayOrder.map((day) => {
                const entries = scheduleByDay[day] ?? [];
                return (
                  <div
                    key={day}
                    className="rounded-xl border border-(--line) bg-(--surface) px-4 py-3"
                  >
                    <p className="text-sm font-semibold">{day}</p>
                    {entries.length === 0 ? (
                      <p className="mt-2 text-xs text-(--text-dim)">
                        No classes scheduled.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2 text-xs text-(--text-dim)">
                        {entries.map((entry) => (
                          <div
                            key={`${entry.key}-${day}`}
                            className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2"
                          >
                            <p className="text-sm font-semibold text-(--text)">
                              {entry.subject}
                            </p>
                            <p className="mt-1">
                              {entry.startTime} - {entry.endTime}
                            </p>
                            <p className="mt-1">
                              {entry.instructor}
                              {entry.section ? ` · Section ${entry.section}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
