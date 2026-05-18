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
import { generateMessageId } from "@/utils/common/generateId";
import { Modal } from "./modal";
import { BasicInfoSection } from "./form/basic-info-section";
import { SupportSection } from "./form/support-section";
import { ScheduleBlocksSection } from "./form/schedule-blocks-section";
import { useInstructorBusySlots } from "@/hooks/dashboard/admin/offered-subject/use-instructor-busy-slots";
import { useSemesterRoomOccupancy } from "@/hooks/dashboard/admin/offered-subject/use-semester-room-occupancy";
import { useOfferedSubjectOptions } from "@/hooks/dashboard/admin/offered-subject/use-offered-subject-options";
import {
  isRoomEligibleForClassType,
  isRoomFreeForDayPeriods,
  mergeOccupancyWithSiblingBlocks,
} from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";

function createBlockId(): string {
  return generateMessageId("block");
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

  const {
    occupiedRoomSlots,
    loading: roomOccupancyLoading,
    error: roomOccupancyError,
  } = useSemesterRoomOccupancy({
    open,
    semesterRegistrationId: form.semesterRegistration,
    excludeOfferedSubjectId: offeredSubject?._id,
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

    const selectedRegistration = semesterRegistrations.find(
      (reg) => reg._id === form.semesterRegistration,
    );
    const shift = selectedRegistration?.shift;

    let active = true;
    setSupportLoading(true);
    setSupportError(null);

    Promise.allSettled([
      getActivePeriodConfig(shift),
      getRooms({
        page: 1,
        limit: 400,
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
  }, [open, form.semesterRegistration, semesterRegistrations]);

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
      limit: 50,
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
        maxWidth="max-w-5xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicInfoSection
            form={form}
            updateField={updateField}
            isEdit={isEdit}
            academicInstructorQuery={academicInstructorQuery}
            setAcademicInstructorQuery={setAcademicInstructorQuery}
            academicInstructorOptions={academicInstructorOptions}
            academicInstructorLoading={academicInstructorLoading}
            academicInstructorError={academicInstructorError}
            departmentQuery={departmentQuery}
            setDepartmentQuery={setDepartmentQuery}
            departmentOptions={departmentOptions}
            departmentLoading={departmentLoading}
            departmentError={departmentError}
            instructorQuery={instructorQuery}
            setInstructorQuery={setInstructorQuery}
            instructorOptions={instructorOptions}
            instructorLoading={instructorLoading}
            instructorError={instructorError}
            semesterRegistrations={semesterRegistrations}
            semesterLabel={semesterLabel}
            offeredSummaryLoading={offeredSummaryLoading}
            offeredSummaryError={offeredSummaryError}
            offeredLabels={offeredLabels}
            subjectQuery={subjectQuery}
            setSubjectQuery={setSubjectQuery}
            subjectOptions={subjectOptions}
            subjectLoading={subjectLoading}
            subjectError={subjectError}
            renderRegistrationOption={renderRegistrationOption}
          />

          <SupportSection
            form={form}
            supportLoading={supportLoading}
            supportError={supportError}
            activePeriodConfig={activePeriodConfig}
            rooms={rooms}
            schedulablePeriods={schedulablePeriods}
            busyLoading={busyLoading}
            busyError={busyError}
            busySlots={busySlots}
          />

          <ScheduleBlocksSection
            blocks={form.scheduleBlocks}
            addBlock={addScheduleBlock}
            removeBlock={removeScheduleBlock}
            updateBlock={(id, field, value) => {
              updateScheduleBlock(id, { [field]: value });
            }}
            rooms={rooms}
            roomsById={roomsById}
            schedulablePeriods={schedulablePeriods}
            maxCapacity={Number(form.maxCapacity)}
            isRoomEligibleForClassType={isRoomEligibleForClassType}
            isRoomFreeForDayPeriods={isRoomFreeForDayPeriods}
            mergeOccupancyWithSiblingBlocks={mergeOccupancyWithSiblingBlocks}
            occupiedRoomSlots={occupiedRoomSlots}
            resolveSelectedPeriods={resolveSelectedPeriods}
            resolveMaxContiguousCount={resolveMaxContiguousCount}
            isObjectId={isObjectId}
          />

          <div className="flex items-center justify-end gap-3 border-t border-(--line) pt-6">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring h-11 rounded-xl px-6 text-sm font-bold text-(--text-dim) transition hover:bg-(--surface-muted)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring h-11 rounded-xl bg-(--accent) px-8 text-sm font-bold text-(--accent-ink) shadow-lg shadow-(--accent)/20 transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Offered Subject"
                  : "Create Offered Subject"}
            </button>
          </div>
        </form>
      </Modal>

    </>
  );
}
