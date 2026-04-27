"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createOfferedSubjectAction,
  updateOfferedSubjectAction,
} from "@/actions/dashboard/admin/offered-subject";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { getActivePeriodConfig } from "@/lib/api/dashboard/admin/period-config";
import { getRooms } from "@/lib/api/dashboard/admin/room";
import type {
  OfferedSubjectClassType,
  OfferedSubjectInput,
  OfferedSubjectSchedulePlan,
  OfferedSubjectScheduleBlock,
  OfferedSubjectScheduleBlockInput,
  OfferedSubjectUpdateInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import {
  OFFERED_SUBJECT_CLASS_TYPES,
  OFFERED_SUBJECT_DAYS,
} from "@/lib/type/dashboard/admin/offered-subject/constants";
import type {
  OfferedSubjectEditableScheduleBlock,
  OfferedSubjectFormModalProps,
  OfferedSubjectFormState,
} from "@/lib/type/dashboard/admin/offered-subject/ui";
import type {
  PeriodConfig,
  PeriodConfigItem,
} from "@/lib/type/dashboard/admin/period-config";
import type { Room } from "@/lib/type/dashboard/admin/room";
import { isObjectId, resolveName } from "@/utils/dashboard/admin/utils";
import {
  formatOfferedSubjectSchedule,
  parseTimeToMinutes,
} from "@/utils/dashboard/admin/offered-subject";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";
import { useInstructorBusySlots } from "@/hooks/dashboard/admin/offered-subject/use-instructor-busy-slots";
import { useOfferedSubjectOptions } from "@/hooks/dashboard/admin/offered-subject/use-offered-subject-options";
import { AgenticPlannerModal } from "./agentic-planner-modal";

function createBlockId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyScheduleBlock(): OfferedSubjectEditableScheduleBlock {
  return {
    id: createBlockId(),
    classType: "theory",
    day: "",
    room: "",
    startPeriod: "",
    periodCount: "1",
  };
}

function createInitialState(): OfferedSubjectFormState {
  return {
    semesterRegistration: "",
    academicInstructor: "",
    academicDepartment: "",
    subject: "",
    instructor: "",
    maxCapacity: "",
    scheduleBlocks: [createEmptyScheduleBlock()],
  };
}

function resolveSchedulablePeriods(config: PeriodConfig | null) {
  return [...(config?.periods ?? [])]
    .filter((period) => period.isActive !== false && period.isBreak !== true)
    .sort((left, right) => left.periodNo - right.periodNo);
}

function resolveRoomId(room: OfferedSubjectScheduleBlock["room"]) {
  if (typeof room === "string") {
    return room;
  }

  return room?._id ?? "";
}

function resolveRoomLabel(room: Room) {
  return `${room.roomName} | Building ${room.buildingNumber} | Room ${room.roomNumber} | Cap ${room.capacity}`;
}

function mapPlanBlocksToEditable(
  blocks: OfferedSubjectSchedulePlan["suggestedBlocks"],
): OfferedSubjectEditableScheduleBlock[] {
  return blocks.map((block) => ({
    id: createBlockId(),
    classType: block.classType,
    day: block.day,
    room: block.room,
    startPeriod: String(block.startPeriod),
    periodCount: String(block.periodCount),
  }));
}

function formatSuggestedPlanBlock(
  block: OfferedSubjectSchedulePlan["suggestedBlocks"][number],
) {
  return [
    `${block.day} (${block.classType})`,
    `${block.startTimeSnapshot}-${block.endTimeSnapshot}`,
    `Periods ${block.periodNumbers.join(", ")}`,
    block.roomLabel,
  ].join(" | ");
}

function resolveSelectedPeriods(
  block: Pick<
    OfferedSubjectEditableScheduleBlock,
    "startPeriod" | "periodCount"
  >,
  periods: PeriodConfigItem[],
) {
  const startPeriod = Number(block.startPeriod);
  const periodCount = Number(block.periodCount);

  if (
    !Number.isFinite(startPeriod) ||
    startPeriod <= 0 ||
    !Number.isFinite(periodCount) ||
    periodCount <= 0
  ) {
    return [] as PeriodConfigItem[];
  }

  const selected = periods.filter(
    (period) =>
      period.periodNo >= startPeriod &&
      period.periodNo < startPeriod + periodCount,
  );

  if (selected.length !== periodCount) {
    return [] as PeriodConfigItem[];
  }

  for (let index = 1; index < selected.length; index += 1) {
    if (selected[index].periodNo !== selected[index - 1].periodNo + 1) {
      return [] as PeriodConfigItem[];
    }
  }

  return selected;
}

function resolveMaxContiguousCount(
  periods: PeriodConfigItem[],
  startPeriodValue: string,
) {
  const startPeriod = Number(startPeriodValue);

  if (!Number.isFinite(startPeriod) || startPeriod <= 0) {
    return 0;
  }

  const startIndex = periods.findIndex(
    (period) => period.periodNo === startPeriod,
  );
  if (startIndex === -1) {
    return 0;
  }

  let total = 1;
  for (let index = startIndex + 1; index < periods.length; index += 1) {
    if (periods[index].periodNo !== periods[index - 1].periodNo + 1) {
      break;
    }
    total += 1;
  }

  return total;
}

function doTimeRangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  const firstStartMinutes = parseTimeToMinutes(firstStart);
  const firstEndMinutes = parseTimeToMinutes(firstEnd);
  const secondStartMinutes = parseTimeToMinutes(secondStart);
  const secondEndMinutes = parseTimeToMinutes(secondEnd);

  if (
    firstStartMinutes === null ||
    firstEndMinutes === null ||
    secondStartMinutes === null ||
    secondEndMinutes === null
  ) {
    return false;
  }

  return (
    firstStartMinutes < secondEndMinutes && firstEndMinutes > secondStartMinutes
  );
}

function buildScheduleBlocksOrThrow(args: {
  blocks: OfferedSubjectEditableScheduleBlock[];
  periods: PeriodConfigItem[];
  roomsById: Map<string, Room>;
  maxCapacity: number;
}) {
  const resolved = args.blocks.map((block, index) => {
    if (!block.day) {
      throw new Error(`Schedule block ${index + 1} needs a day.`);
    }

    if (!OFFERED_SUBJECT_CLASS_TYPES.includes(block.classType)) {
      throw new Error(`Schedule block ${index + 1} needs a valid class type.`);
    }

    if (!isObjectId(block.room)) {
      throw new Error(`Schedule block ${index + 1} needs a valid room.`);
    }

    const startPeriod = Number(block.startPeriod);
    const periodCount = Number(block.periodCount);

    if (!Number.isFinite(startPeriod) || startPeriod <= 0) {
      throw new Error(
        `Schedule block ${index + 1} needs a valid start period.`,
      );
    }

    if (!Number.isFinite(periodCount) || periodCount <= 0) {
      throw new Error(
        `Schedule block ${index + 1} needs a valid period count.`,
      );
    }

    const selectedPeriods = resolveSelectedPeriods(block, args.periods);
    if (!selectedPeriods.length) {
      throw new Error(
        `Schedule block ${index + 1} does not match the active period configuration.`,
      );
    }

    const room = args.roomsById.get(block.room);
    if (!room) {
      throw new Error(`Room for schedule block ${index + 1} was not found.`);
    }

    if (room.capacity < args.maxCapacity) {
      throw new Error(
        `${room.roomName} capacity is lower than the offered subject capacity.`,
      );
    }

    return {
      input: {
        classType: block.classType as OfferedSubjectClassType,
        day: block.day,
        room: block.room,
        startPeriod,
        periodCount,
      } satisfies OfferedSubjectScheduleBlockInput,
      startTime: selectedPeriods[0].startTime,
      endTime: selectedPeriods[selectedPeriods.length - 1].endTime,
      day: block.day,
    };
  });

  for (let leftIndex = 0; leftIndex < resolved.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < resolved.length;
      rightIndex += 1
    ) {
      const left = resolved[leftIndex];
      const right = resolved[rightIndex];

      if (left.day !== right.day) {
        continue;
      }

      if (
        doTimeRangesOverlap(
          left.startTime,
          left.endTime,
          right.startTime,
          right.endTime,
        )
      ) {
        throw new Error(
          `Schedule blocks ${leftIndex + 1} and ${rightIndex + 1} overlap on ${left.day}.`,
        );
      }
    }
  }

  return resolved.map((item) => item.input);
}

export function OfferedSubjectFormModal({
  open,
  offeredSubject,
  subjects,
  instructors,
  academicDepartments,
  academicInstructors,
  semesterRegistrations,
  onClose,
  onSaved,
}: OfferedSubjectFormModalProps) {
  const [form, setForm] = useState<OfferedSubjectFormState>(createInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [activePeriodConfig, setActivePeriodConfig] =
    useState<PeriodConfig | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isAgenticPlannerOpen, setIsAgenticPlannerOpen] = useState(false);

  const isEdit = Boolean(offeredSubject?._id);
  const {
    subjectQuery,
    setSubjectQuery,
    subjectOptions,
    subjectLoading,
    subjectError,
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
  } = useOfferedSubjectOptions({
    open,
    subjects,
    instructors,
    academicDepartments,
    academicInstructors,
    semesterRegistrationId: form.semesterRegistration,
    academicInstructorId: form.academicInstructor,
    academicDepartmentId: form.academicDepartment,
    subjectId: form.subject,
    instructorId: form.instructor,
  });
  const {
    slots: busySlots,
    loading: busyLoading,
    error: busyError,
  } = useInstructorBusySlots({
    open,
    instructorId: form.instructor,
    semesterRegistrationId: form.semesterRegistration,
  });

  const schedulablePeriods = useMemo(
    () => resolveSchedulablePeriods(activePeriodConfig),
    [activePeriodConfig],
  );
  const roomsById = useMemo(
    () => new Map(rooms.map((room) => [room._id, room])),
    [rooms],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      semesterRegistration:
        typeof offeredSubject?.semesterRegistration === "string"
          ? offeredSubject.semesterRegistration
          : (offeredSubject?.semesterRegistration?._id ?? ""),
      academicInstructor:
        typeof offeredSubject?.academicInstructor === "string"
          ? offeredSubject.academicInstructor
          : (offeredSubject?.academicInstructor?._id ?? ""),
      academicDepartment:
        typeof offeredSubject?.academicDepartment === "string"
          ? offeredSubject.academicDepartment
          : (offeredSubject?.academicDepartment?._id ?? ""),
      subject:
        typeof offeredSubject?.subject === "string"
          ? offeredSubject.subject
          : (offeredSubject?.subject?._id ?? ""),
      instructor:
        typeof offeredSubject?.instructor === "string"
          ? offeredSubject.instructor
          : (offeredSubject?.instructor?._id ?? ""),
      maxCapacity:
        offeredSubject?.maxCapacity !== undefined
          ? String(offeredSubject.maxCapacity)
          : "",
      scheduleBlocks: offeredSubject?.scheduleBlocks?.length
        ? offeredSubject.scheduleBlocks.map((block) => ({
            id: createBlockId(),
            classType: block.classType ?? "theory",
            day: block.day ?? "",
            room: resolveRoomId(block.room),
            startPeriod:
              block.startPeriod !== undefined ? String(block.startPeriod) : "",
            periodCount:
              block.periodCount !== undefined ? String(block.periodCount) : "1",
          }))
        : offeredSubject?.days?.length
          ? offeredSubject.days.map((day) => ({
              ...createEmptyScheduleBlock(),
              day,
            }))
          : [createEmptyScheduleBlock()],
    });
  }, [open, offeredSubject]);

  useEffect(() => {
    if (!open) {
      return;
    }

  }, [
    open,
    form.semesterRegistration,
    form.academicInstructor,
    form.academicDepartment,
    form.subject,
    form.instructor,
    form.maxCapacity,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    setSupportLoading(true);
    setSupportError(null);

    Promise.allSettled([
      getActivePeriodConfig(),
      getRooms({
        page: 1,
        limit: 1000,
        sort: "roomName",
        isActive: "true",
      }),
    ])
      .then(([periodConfigResult, roomResult]) => {
        if (!active) {
          return;
        }

        const errors: string[] = [];

        if (periodConfigResult.status === "fulfilled") {
          setActivePeriodConfig(periodConfigResult.value);
        } else {
          setActivePeriodConfig(null);
          errors.push(
            periodConfigResult.reason instanceof Error
              ? periodConfigResult.reason.message
              : "Unable to load active period configuration.",
          );
        }

        if (roomResult.status === "fulfilled") {
          setRooms(roomResult.value.result ?? []);
        } else {
          setRooms([]);
          errors.push(
            roomResult.reason instanceof Error
              ? roomResult.reason.message
              : "Unable to load active rooms.",
          );
        }

        setSupportError(errors.length ? errors.join(" ") : null);
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setSupportLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  function updateField<T extends keyof OfferedSubjectFormState>(
    key: T,
    value: OfferedSubjectFormState[T],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateScheduleBlock(
    blockId: string,
    updater: (
      current: OfferedSubjectEditableScheduleBlock,
    ) => OfferedSubjectEditableScheduleBlock,
  ) {
    setForm((current) => ({
      ...current,
      scheduleBlocks: current.scheduleBlocks.map((block) =>
        block.id === blockId ? updater(block) : block,
      ),
    }));
  }

  function addScheduleBlock() {
    setForm((current) => ({
      ...current,
      scheduleBlocks: [...current.scheduleBlocks, createEmptyScheduleBlock()],
    }));
  }

  function removeScheduleBlock(blockId: string) {
    setForm((current) => ({
      ...current,
      scheduleBlocks:
        current.scheduleBlocks.length === 1
          ? current.scheduleBlocks
          : current.scheduleBlocks.filter((block) => block.id !== blockId),
    }));
  }

  useEffect(() => {
    if (!form.academicInstructor) {
      if (form.academicDepartment || form.instructor) {
        setForm((prev) => ({
          ...prev,
          academicDepartment: "",
          instructor: "",
        }));
      }
      return;
    }

    if (
      form.academicDepartment &&
      !departmentLoading &&
      !departmentQuery.trim() &&
      !departmentOptions.some((item) => item._id === form.academicDepartment)
    ) {
      setForm((prev) => ({ ...prev, academicDepartment: "" }));
    }

    if (
      form.instructor &&
      !instructorLoading &&
      !instructorQuery.trim() &&
      !instructorOptions.some((item) => item._id === form.instructor)
    ) {
      setForm((prev) => ({ ...prev, instructor: "" }));
    }
  }, [
    form.academicInstructor,
    form.academicDepartment,
    form.instructor,
    departmentOptions,
    departmentLoading,
    departmentQuery,
    instructorOptions,
    instructorLoading,
    instructorQuery,
  ]);

  const selectedRegistration = useMemo(
    () =>
      semesterRegistrations.find(
        (item) => item._id === form.semesterRegistration,
      ),
    [semesterRegistrations, form.semesterRegistration],
  );

  const semesterLabel = useMemo(() => {
    const semester = selectedRegistration?.academicSemester;
    if (!semester) {
      return "--";
    }
    if (typeof semester === "string") {
      return semester;
    }
    return `${semester.name ?? ""} ${semester.year ?? ""}`.trim() || "--";
  }, [selectedRegistration]);

  function renderRegistrationOption(
    registration: (typeof semesterRegistrations)[number],
  ) {
    const sem = registration.academicSemester;
    let semLabel = "";
    if (typeof sem === "string") {
      semLabel = sem;
    } else {
      semLabel = `${sem?.name ?? ""} ${sem?.year ?? ""}`.trim();
    }
    const statusShift = `${registration.status} | ${registration.shift}`;
    return [semLabel || "--", statusShift].filter(Boolean).join(" | ");
  }

  const [offeredSummaryLoading, setOfferedSummaryLoading] = useState(false);
  const [offeredSummaryError, setOfferedSummaryError] = useState<string | null>(
    null,
  );
  const [offeredLabels, setOfferedLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (!form.semesterRegistration) {
      setOfferedLabels([]);
      setOfferedSummaryError(null);
      setOfferedSummaryLoading(false);
      return;
    }
    let active = true;
    setOfferedSummaryLoading(true);
    setOfferedSummaryError(null);
    getOfferedSubjects({
      page: 1,
      limit: 1000,
      semesterRegistration: form.semesterRegistration,
      fields: "subject,days,startTime,endTime,scheduleBlocks",
    })
      .then((payload) => {
        if (!active) return;
        const labels: string[] = [];
        for (const item of payload.result ?? []) {
          const subjectTitle =
            typeof item.subject === "string"
              ? item.subject
              : (item.subject?.title ?? "Subject");
          const schedule = formatOfferedSubjectSchedule(item);
          labels.push(
            schedule ? `${subjectTitle} - ${schedule}` : subjectTitle,
          );
        }
        setOfferedLabels(labels);
      })
      .catch((err) => {
        if (!active) return;
        setOfferedSummaryError(
          err instanceof Error
            ? err.message
            : "Unable to load offered subjects.",
        );
        setOfferedLabels([]);
      })
      .finally(() => {
        if (!active) return;
        setOfferedSummaryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, form.semesterRegistration]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.instructor || !form.maxCapacity) {
      showToast({
        variant: "error",
        title: "Missing fields",
        description: "Please fill all required fields.",
      });
      return;
    }

    if (!activePeriodConfig || !schedulablePeriods.length) {
      showToast({
        variant: "error",
        title: "Period configuration unavailable",
        description:
          "An active period configuration is required before scheduling offered subjects.",
      });
      return;
    }

    if (!rooms.length) {
      showToast({
        variant: "error",
        title: "No active rooms found",
        description: "Create at least one active room before scheduling.",
      });
      return;
    }

    if (form.scheduleBlocks.length === 0) {
      showToast({
        variant: "error",
        title: "Add schedule blocks",
        description: "Please create at least one schedule block.",
      });
      return;
    }

    if (!isObjectId(form.instructor)) {
      showToast({
        variant: "error",
        title: "Invalid selection",
        description: "Please select a valid instructor.",
      });
      return;
    }

    const maxCapacity = Number(form.maxCapacity);
    if (!Number.isFinite(maxCapacity) || maxCapacity <= 0) {
      showToast({
        variant: "error",
        title: "Invalid capacity",
        description: "Max capacity must be a positive number.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const scheduleBlocks = buildScheduleBlocksOrThrow({
        blocks: form.scheduleBlocks,
        periods: schedulablePeriods,
        roomsById,
        maxCapacity,
      });

      if (isEdit && offeredSubject?._id) {
        const payload: OfferedSubjectUpdateInput = {
          instructor: form.instructor,
          maxCapacity,
          scheduleBlocks,
        };
        await updateOfferedSubjectAction(offeredSubject._id, payload);
      } else {
        if (
          !form.semesterRegistration ||
          !form.academicInstructor ||
          !form.academicDepartment ||
          !form.subject
        ) {
          showToast({
            variant: "error",
            title: "Missing fields",
            description: "Please complete all required fields.",
          });
          setSubmitting(false);
          return;
        }

        const requiredIds: Array<[string, string]> = [
          ["Semester registration", form.semesterRegistration],
          ["Academic instructor", form.academicInstructor],
          ["Academic department", form.academicDepartment],
          ["Subject", form.subject],
        ];

        for (const [label, value] of requiredIds) {
          if (!isObjectId(value)) {
            showToast({
              variant: "error",
              title: "Invalid selection",
              description: `Please select a valid ${label.toLowerCase()}.`,
            });
            setSubmitting(false);
            return;
          }
        }

        const payload: OfferedSubjectInput = {
          semesterRegistration: form.semesterRegistration,
          academicInstructor: form.academicInstructor,
          academicDepartment: form.academicDepartment,
          subject: form.subject,
          instructor: form.instructor,
          maxCapacity,
          scheduleBlocks,
        };

        await createOfferedSubjectAction(payload);
      }

      showToast({
        variant: "success",
        title: isEdit ? "Offered subject updated" : "Offered subject created",
        description: isEdit
          ? "Schedule and room assignment updated successfully."
          : "Offered subject created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title:
          error instanceof Error
            ? error.message
            : isEdit
              ? "Unable to update offered subject."
              : "Unable to create offered subject.",
        description: isEdit ? "Update failed." : "Create failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? "Update Offered Subject" : "Create Offered Subject"}
        description={
          isEdit
            ? "Update instructor, capacity, and schedule blocks."
            : "Create a new offered subject using rooms and active periods."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Academic Instructor
              </label>
              <input
                type="search"
                value={academicInstructorQuery}
                onChange={(event) =>
                  setAcademicInstructorQuery(event.target.value)
                }
                disabled={isEdit}
                placeholder="Search academic instructor"
                className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              />
              <select
                value={form.academicInstructor}
                onChange={(event) =>
                  updateField("academicInstructor", event.target.value)
                }
                disabled={isEdit}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              >
                <option value="" className="bg-(--surface) text-(--text)">
                  Select academic instructor
                </option>
                {academicInstructorOptions.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    className="bg-(--surface) text-(--text)"
                  >
                    {item.name}
                  </option>
                ))}
              </select>
              {academicInstructorLoading ? (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Loading instructors...
                </p>
              ) : academicInstructorError ? (
                <p className="mt-2 text-xs text-red-400">
                  {academicInstructorError}
                </p>
              ) : (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Showing up to 50 results. Type to search.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Academic Department
              </label>
              <input
                type="search"
                value={departmentQuery}
                onChange={(event) => setDepartmentQuery(event.target.value)}
                disabled={isEdit || !form.academicInstructor}
                placeholder="Search department"
                className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              />
              <select
                value={form.academicDepartment}
                onChange={(event) =>
                  updateField("academicDepartment", event.target.value)
                }
                disabled={isEdit || !form.academicInstructor}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              >
                <option value="" className="bg-(--surface) text-(--text)">
                  Select department
                </option>
                {departmentOptions.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    className="bg-(--surface) text-(--text)"
                  >
                    {item.name}
                  </option>
                ))}
              </select>
              {!form.academicInstructor ? (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Select academic instructor to load departments.
                </p>
              ) : departmentLoading ? (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Loading departments...
                </p>
              ) : departmentError ? (
                <p className="mt-2 text-xs text-red-400">{departmentError}</p>
              ) : (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Showing up to 50 results. Type to search.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Instructor
              </label>
              <input
                type="search"
                value={instructorQuery}
                onChange={(event) => setInstructorQuery(event.target.value)}
                disabled={isEdit || !form.academicInstructor}
                placeholder="Search instructor"
                className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              />
              <select
                value={form.instructor}
                onChange={(event) =>
                  updateField("instructor", event.target.value)
                }
                disabled={isEdit || !form.academicInstructor}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              >
                <option value="" className="bg-(--surface) text-(--text)">
                  Select instructor
                </option>
                {instructorOptions.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    className="bg-(--surface) text-(--text)"
                  >
                    {resolveName(item.name)} ({item.designation})
                  </option>
                ))}
              </select>
              {!form.academicInstructor ? (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Select academic instructor to load instructors.
                </p>
              ) : instructorLoading ? (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Loading instructors...
                </p>
              ) : instructorError ? (
                <p className="mt-2 text-xs text-red-400">{instructorError}</p>
              ) : (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Showing up to 50 results. Type to search.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Semester Registration
              </label>
              <select
                value={form.semesterRegistration}
                onChange={(event) =>
                  updateField("semesterRegistration", event.target.value)
                }
                disabled={isEdit}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              >
                <option value="" className="bg-(--surface) text-(--text)">
                  Select registration
                </option>
                {semesterRegistrations.map((registration) => (
                  <option
                    key={registration._id}
                    value={registration._id}
                    className="bg-(--surface) text-(--text)"
                  >
                    {renderRegistrationOption(registration)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-(--text-dim)">
                Academic Semester:{" "}
                <span className="font-medium">{semesterLabel}</span>
              </p>
              <div className="mt-2 text-xs">
                {offeredSummaryLoading ? (
                  <p className="text-(--text-dim)">
                    Loading offered subjects...
                  </p>
                ) : offeredSummaryError ? (
                  <p className="text-red-400">{offeredSummaryError}</p>
                ) : offeredLabels.length > 0 ? (
                  <p className="text-(--text-dim)">
                    Offered subjects ({offeredLabels.length}):{" "}
                    <span className="text-(--text)">
                      {offeredLabels.join(", ")}
                    </span>
                  </p>
                ) : (
                  <p className="text-(--text-dim)">
                    No subjects offered yet in this registration.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Subject
              </label>
              <input
                type="search"
                value={subjectQuery}
                onChange={(event) => setSubjectQuery(event.target.value)}
                disabled={isEdit}
                placeholder="Search subject"
                className="focus-ring mt-2 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              />
              <select
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                disabled={isEdit}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
              >
                <option value="" className="bg-(--surface) text-(--text)">
                  Select subject
                </option>
                {subjectOptions.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    className="bg-(--surface) text-(--text)"
                  >
                    {item.title}
                  </option>
                ))}
              </select>
              {subjectLoading ? (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Loading subjects...
                </p>
              ) : subjectError ? (
                <p className="mt-2 text-xs text-red-400">{subjectError}</p>
              ) : (
                <p className="mt-2 text-xs text-(--text-dim)">
                  Showing up to 50 results. Type to search.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Max Capacity
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={form.maxCapacity}
                  onChange={(event) =>
                    updateField("maxCapacity", event.target.value)
                  }
                  className="focus-ring h-11 flex-1 rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-(--line) bg-(--surface) p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Scheduling Support
                </p>
                <p className="mt-1 text-(--text-dim)">
                  Offered subjects now use room-based schedule blocks from the
                  active period configuration.
                </p>
              </div>
              <div className="text-xs text-(--text-dim)">
                <Link
                  href="/dashboard/admin/period-configs"
                  className="font-medium text-(--accent) underline-offset-4 hover:underline"
                >
                  Manage period configs
                </Link>
                {" | "}
                <Link
                  href="/dashboard/admin/rooms"
                  className="font-medium text-(--accent) underline-offset-4 hover:underline"
                >
                  Manage rooms
                </Link>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAgenticPlannerOpen(true)}
                disabled={
                  !form.semesterRegistration ||
                  !form.academicInstructor ||
                  !form.academicDepartment
                }
                className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--accent) px-4 text-sm font-semibold text-(--accent) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                AI Plan
              </button>
              <p className="text-xs text-(--text-dim)">
                Agentic AI: Plan multiple subjects for instructors in this
                department based on credits, room types, and busy slots.
              </p>
            </div>

            {supportLoading ? (
              <p className="mt-3 text-(--text-dim)">
                Loading rooms and active periods...
              </p>
            ) : supportError ? (
              <p className="mt-3 text-red-400">{supportError}</p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
                  <p className="font-medium">
                    Active Config: {activePeriodConfig?.label ?? "--"}
                  </p>
                  <p className="mt-1 text-xs text-(--text-dim)">
                    Effective from{" "}
                    {activePeriodConfig?.effectiveFrom
                      ? activePeriodConfig.effectiveFrom.slice(0, 10)
                      : "--"}{" "}
                    | {rooms.length} active room{rooms.length === 1 ? "" : "s"}{" "}
                    available
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {schedulablePeriods.length ? (
                    schedulablePeriods.map((period) => (
                      <span
                        key={period.periodNo}
                        className="rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-xs text-(--text-dim)"
                      >
                        P{period.periodNo}: {period.startTime}-{period.endTime}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-(--text-dim)">
                      No teachable periods found in the active configuration.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-(--line) bg-(--surface) p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Instructor Availability
            </p>
            {!form.instructor || !form.semesterRegistration ? (
              <p className="mt-2 text-(--text-dim)">
                Select instructor and semester registration to see busy slots.
              </p>
            ) : busyLoading ? (
              <p className="mt-2 text-(--text-dim)">Loading schedules...</p>
            ) : busyError ? (
              <p className="mt-2 text-red-400">{busyError}</p>
            ) : busySlots.length === 0 ? (
              <p className="mt-2 text-(--text-dim)">
                No busy slots found for this instructor in the selected
                registration.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {busySlots.map((slot) => {
                  const subjectTitle =
                    typeof slot.subject === "string"
                      ? slot.subject
                      : slot.subject?.title;
                  const daysLabel = slot.days?.length
                    ? slot.days.join(", ")
                    : "--";
                  const timeLabel =
                    slot.startTime && slot.endTime
                      ? `${slot.startTime} - ${slot.endTime}`
                      : "--";
                  return (
                    <div
                      key={slot._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--line) px-3 py-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {subjectTitle ?? "Assigned Subject"}
                        </p>
                        <p className="text-xs text-(--text-dim)">{daysLabel}</p>
                      </div>
                      <span className="text-xs font-semibold text-(--text)">
                        {timeLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Schedule Blocks
                </p>
                <p className="mt-1 text-sm text-(--text-dim)">
                  Add separate blocks for theory, practical, or tutorial
                  sessions with assigned rooms.
                </p>
              </div>
              <button
                type="button"
                onClick={addScheduleBlock}
                className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text) transition hover:bg-(--surface-muted)"
              >
                Add Block
              </button>
            </div>

            <div className="space-y-3">
              {form.scheduleBlocks.map((block, index) => {
                const selectedPeriods = resolveSelectedPeriods(
                  block,
                  schedulablePeriods,
                );
                const selectedRoom = roomsById.get(block.room);
                const maxCount = resolveMaxContiguousCount(
                  schedulablePeriods,
                  block.startPeriod,
                );
                const periodCountOptions =
                  maxCount > 0
                    ? Array.from(
                        { length: maxCount },
                        (_, optionIndex) => optionIndex + 1,
                      )
                    : [1];

                return (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-(--line) bg-(--surface) p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Block {index + 1}</p>
                        <p className="mt-1 text-xs text-(--text-dim)">
                          {selectedPeriods.length
                            ? `${selectedPeriods[0].startTime}-${selectedPeriods[selectedPeriods.length - 1].endTime} | Periods ${selectedPeriods
                                .map((period) => period.periodNo)
                                .join(", ")}`
                            : "Select room and contiguous periods from the active config."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScheduleBlock(block.id)}
                        disabled={form.scheduleBlocks.length === 1}
                        className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-red-500/40 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1.6fr_1fr_1fr]">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                          Class Type
                        </label>
                        <select
                          value={block.classType}
                          onChange={(event) =>
                            updateScheduleBlock(block.id, (current) => ({
                              ...current,
                              classType: event.target
                                .value as OfferedSubjectClassType,
                            }))
                          }
                          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
                        >
                          {OFFERED_SUBJECT_CLASS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                          Day
                        </label>
                        <select
                          value={block.day}
                          onChange={(event) =>
                            updateScheduleBlock(block.id, (current) => ({
                              ...current,
                              day: event.target
                                .value as OfferedSubjectEditableScheduleBlock["day"],
                            }))
                          }
                          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
                        >
                          <option value="">Select day</option>
                          {OFFERED_SUBJECT_DAYS.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                          Room
                        </label>
                        <select
                          value={block.room}
                          onChange={(event) =>
                            updateScheduleBlock(block.id, (current) => ({
                              ...current,
                              room: event.target.value,
                            }))
                          }
                          disabled={supportLoading || !rooms.length}
                          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
                        >
                          <option value="">Select room</option>
                          {rooms.map((room) => (
                            <option key={room._id} value={room._id}>
                              {resolveRoomLabel(room)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                          Start Period
                        </label>
                        <select
                          value={block.startPeriod}
                          onChange={(event) =>
                            updateScheduleBlock(block.id, (current) => {
                              const nextStartPeriod = event.target.value;
                              const nextMaxCount = resolveMaxContiguousCount(
                                schedulablePeriods,
                                nextStartPeriod,
                              );
                              const currentCount = Number(current.periodCount);
                              return {
                                ...current,
                                startPeriod: nextStartPeriod,
                                periodCount:
                                  currentCount > 0 &&
                                  currentCount <= nextMaxCount
                                    ? current.periodCount
                                    : nextMaxCount > 0
                                      ? "1"
                                      : "",
                              };
                            })
                          }
                          disabled={!schedulablePeriods.length}
                          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
                        >
                          <option value="">Select period</option>
                          {schedulablePeriods.map((period) => (
                            <option
                              key={period.periodNo}
                              value={period.periodNo}
                            >
                              P{period.periodNo} ({period.startTime}-
                              {period.endTime})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                          Period Count
                        </label>
                        <select
                          value={block.periodCount}
                          onChange={(event) =>
                            updateScheduleBlock(block.id, (current) => ({
                              ...current,
                              periodCount: event.target.value,
                            }))
                          }
                          disabled={
                            !block.startPeriod || !schedulablePeriods.length
                          }
                          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) disabled:opacity-70"
                        >
                          {!block.startPeriod ? (
                            <option value="">Select start period first</option>
                          ) : null}
                          {periodCountOptions.map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm">
                      <p className="font-medium">
                        {selectedPeriods.length
                          ? `${selectedPeriods[0].startTime} to ${selectedPeriods[selectedPeriods.length - 1].endTime}`
                          : "Waiting for a valid contiguous period selection"}
                      </p>
                      <p className="mt-1 text-xs text-(--text-dim)">
                        {selectedRoom
                          ? `${selectedRoom.roomName} capacity ${selectedRoom.capacity}`
                          : "Select a room to validate capacity."}
                      </p>
                      {selectedRoom &&
                      form.maxCapacity &&
                      Number(form.maxCapacity) > selectedRoom.capacity ? (
                        <p className="mt-2 text-xs text-amber-300">
                          Room capacity is below the current max capacity.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <AgenticPlannerModal
        open={isAgenticPlannerOpen}
        onClose={() => setIsAgenticPlannerOpen(false)}
        semesterRegistrationId={form.semesterRegistration}
        academicInstructorId={form.academicInstructor}
        academicDepartmentId={form.academicDepartment}
        onSaved={onSaved}
      />
    </>
  );
}
