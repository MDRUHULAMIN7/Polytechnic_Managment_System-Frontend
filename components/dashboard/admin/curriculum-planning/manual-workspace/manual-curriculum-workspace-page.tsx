"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useManualWorkspaceBootstrapQueries } from "@/hooks/dashboard/admin/manual-curriculum-workspace/use-manual-workspace-bootstrap-queries";
import { useManualWorkspaceRouteParams, buildManualWorkspaceSearch } from "@/hooks/dashboard/admin/manual-curriculum-workspace/use-manual-workspace-route-params";
import { useDraftRoutine } from "@/hooks/dashboard/admin/manual-curriculum-workspace/use-draft-routine";
import { blocksShareSlot } from "@/utils/dashboard/admin/manual-curriculum-workspace/draft-routine";
import { useSchedulePreviewQuery } from "@/hooks/dashboard/admin/manual-curriculum-workspace/use-schedule-preview-query";
import { CurriculumPlanningStep1 } from "@/components/dashboard/admin/curriculum-planning/step-1-setup";
import { RoutineGrid } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/routine-grid";
import { SlotAssignmentDialog } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/slot-assignment-dialog";
import { ManualWorkspaceToolbar } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/manual-workspace-toolbar";
import { ManualPlanningTracker } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/manual-planning-tracker";
import { ConflictsPanel } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/panels/conflicts-panel";
import { RoomsAvailabilityPanel } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/panels/rooms-availability-panel";
import { InstructorsAvailabilityPanel } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/panels/instructors-availability-panel";
import { loadStep1SupportData } from "@/lib/api/dashboard/admin/curriculum-planning";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { CurriculumPlanningStep1Data } from "@/lib/type/dashboard/admin/curriculum-planning";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import {
  buildInstructorPeriodOccupancyMap,
  buildSemesterRoomOccupancyMap,
  mergeInstructorOccupancyMapWithDraft,
  mergeRoomOccupancyMapWithDraft,
  roomDayPeriodKey,
} from "@/utils/dashboard/admin/manual-curriculum-workspace/occupancy";
import { buildAvailabilityPanelSubtitle } from "@/utils/dashboard/admin/manual-curriculum-workspace/availability-caption";
import { createOfferedSubjectAction } from "@/actions/dashboard/admin/offered-subject";
import { showToast } from "@/utils/common/toast";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useQuery } from "@tanstack/react-query";
import { manualWorkspaceKeys } from "@/lib/api/dashboard/admin/manual-workspace-query-keys";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { resolveInstructorDisplayName } from "@/utils/dashboard/admin/instructor/resolve-display-name";
import { useRoomAvailabilityData } from "@/hooks/dashboard/admin/room/use-room-availability";

function StaticPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-sm">
      <header className="flex items-center justify-between border-b border-(--line) bg-(--surface-muted) px-3 py-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-(--text)">
            {title}
          </span>
          {subtitle ? (
            <div className="mt-1 text-[10px] font-normal normal-case leading-snug text-(--text-dim)">
              {subtitle}
            </div>
          ) : null}
        </div>
      </header>
      <div className="p-3">{children}</div>
    </div>
  );
}

function WorkspaceSetupGate() {
  const router = useRouter();
  const supportQuery = useQuery({
    queryKey: manualWorkspaceKeys.step1Support(),
    queryFn: loadStep1SupportData,
    staleTime: 60_000,
  });

  const handleNext = useCallback(
    (data: CurriculumPlanningStep1Data) => {
      const search = buildManualWorkspaceSearch(data);
      router.push(`/dashboard/admin/curriculum-planning/workspace${search}`);
    },
    [router],
  );

  if (supportQuery.isPending) {
    return <div className="rounded-xl border border-(--line) p-8 text-sm text-(--text-dim)">Loading setup…</div>;
  }
  if (supportQuery.isError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        {supportQuery.error instanceof Error ? supportQuery.error.message : "Failed to load setup."}
      </div>
    );
  }
  if (!supportQuery.data) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <CurriculumPlanningStep1 supportData={supportQuery.data} onNext={handleNext} />
    </div>
  );
}

function ManualCurriculumWorkspaceInner() {
  const { params, isComplete } = useManualWorkspaceRouteParams();
  const queries = useManualWorkspaceBootstrapQueries(params);
  const [qStep1Support, qPeriod, qRoomsList, qStep2, qOfferings] = queries;

  const periodConfig = qPeriod.data;
  const schedulablePeriods = useMemo(
    () =>
      [...(periodConfig?.periods ?? [])]
        .filter((p) => p.isActive !== false && p.isBreak !== true)
        .sort((a, b) => a.periodNo - b.periodNo),
    [periodConfig],
  );

  const allowedPeriodNos = useMemo(() => {
    const nums = schedulablePeriods
      .map((p) => Number(p.periodNo))
      .filter((n) => Number.isFinite(n));
    return new Set(nums);
  }, [schedulablePeriods]);

  const selectedSemesterRegistration = useMemo(() => {
    const list = qStep1Support.data?.semesterRegistrations ?? [];
    return list.find((r) => r._id === params?.semesterRegistrationId);
  }, [qStep1Support.data?.semesterRegistrations, params?.semesterRegistrationId]);

  const availabilityPanelSubtitle = useMemo(
    () =>
      buildAvailabilityPanelSubtitle(
        selectedSemesterRegistration,
        periodConfig,
        schedulablePeriods.length,
      ),
    [selectedSemesterRegistration, periodConfig, schedulablePeriods.length],
  );

  const rooms = qRoomsList.data?.result ?? [];
  const step2 = qStep2.data;
  const offerings = useMemo(
    () => (Array.isArray(qOfferings.data) ? qOfferings.data : []),
    [qOfferings.data],
  );

  const {
    draft,
    setSubjectId,
    setInstructorId,
    setRoomId,
    addBlock,
    removeBlock,
    removeBlocks,
    addPlannedSubject,
    removePlannedSubject,
    reset,
  } = useDraftRoutine(params?.maxCapacity ?? 40);

  const roomAvailability = useRoomAvailabilityData(Boolean(isComplete && params && draft.roomId));
  const roomAvailabilityError = roomAvailability.error;

  const roomOccupancyOfferings = useMemo(() => {
    if (roomAvailability.offeredSubjects.length > 0) {
      return roomAvailability.offeredSubjects;
    }
    return offerings;
  }, [roomAvailability.offeredSubjects, offerings]);

  const roomOccupancyMap = useMemo(
    () => buildSemesterRoomOccupancyMap(roomOccupancyOfferings, { allowedPeriodNos }),
    [roomOccupancyOfferings, allowedPeriodNos],
  );

  const roomConflictReady = !draft.roomId || (!roomAvailability.loading && !roomAvailabilityError);

  const instructorWeekOfferingsQuery = useQuery({
    queryKey: manualWorkspaceKeys.instructorWeekOfferings(draft.instructorId),
    queryFn: async () => {
      const payload = await getOfferedSubjects({
        page: 1,
        limit: 1000,
        sort: "-createdAt",
        instructor: draft.instructorId,
        fields: "subject,instructor,scheduleBlocks,semesterRegistration,maxCapacity",
      });
      return payload.result ?? [];
    },
    enabled: Boolean(isComplete && params && draft.instructorId),
    staleTime: 30_000,
  });

  const instructorWeekOfferings = useMemo(
    () => (Array.isArray(instructorWeekOfferingsQuery.data) ? instructorWeekOfferingsQuery.data : []),
    [instructorWeekOfferingsQuery.data],
  );

  const instructorWeekError =
    instructorWeekOfferingsQuery.error instanceof Error
      ? instructorWeekOfferingsQuery.error.message
      : instructorWeekOfferingsQuery.isError
        ? "Failed to load instructor offerings."
        : null;

  const instructorWeekOccupancyMap = useMemo(
    () => buildInstructorPeriodOccupancyMap(instructorWeekOfferings, { allowedPeriodNos }),
    [instructorWeekOfferings, allowedPeriodNos],
  );

  const selectedSubject = useMemo(() => {
    const list = step2?.subjects ?? [];
    return list.find((x) => x._id === draft.subjectId);
  }, [step2?.subjects, draft.subjectId]);

  const draftSubjectTitle = useMemo(() => {
    return selectedSubject?.title?.trim() ?? "";
  }, [selectedSubject]);

  const draftInstructorLabel = useMemo(() => {
    const list = step2?.instructors ?? [];
    const i = list.find((x) => x._id === draft.instructorId);
    return i ? resolveInstructorDisplayName(i.name) : "";
  }, [step2?.instructors, draft.instructorId]);

  // Global roomOccupancyMap should include current draft blocks
  const liveRoomOccupancyMap = useMemo(() => {
    return mergeRoomOccupancyMapWithDraft(roomOccupancyMap, draft.blocks, {
      allowedPeriodNos,
      draftSubjectTitle,
      draftInstructorLabel,
    });
  }, [roomOccupancyMap, draft.blocks, allowedPeriodNos, draftSubjectTitle, draftInstructorLabel]);

  const liveInstructorOccupancyMap = useMemo(() => {
    return mergeInstructorOccupancyMapWithDraft(
      instructorWeekOccupancyMap,
      draft.instructorId,
      draft.blocks,
      {
        allowedPeriodNos,
        draftSubjectTitle,
        draftInstructorLabel,
      },
    );
  }, [
    instructorWeekOccupancyMap,
    draft.instructorId,
    draft.blocks,
    allowedPeriodNos,
    draftSubjectTitle,
    draftInstructorLabel,
  ]);

  const offeringsError = qOfferings.isError
    ? qOfferings.error instanceof Error
      ? qOfferings.error.message
      : "Failed to load semester offerings."
    : null;

  const planningContextKey = params
    ? `${params.semesterRegistrationId}:${params.academicDepartmentId}:${params.academicInstructorId}:${params.maxCapacity}`
    : "";
  const prevPlanningKey = useRef("");

  useEffect(() => {
    if (!planningContextKey || !params) return;
    if (prevPlanningKey.current === planningContextKey) return;
    prevPlanningKey.current = planningContextKey;
    reset(params.maxCapacity);
  }, [planningContextKey, params, reset]);

  const preview = useSchedulePreviewQuery(params, draft);

  const roomConflicts = useMemo(() => {
    return (preview.data?.conflicts ?? []).filter(
      (c) => c.type === "ROOM_CONFLICT" || c.type === "ROOM_CAPACITY",
    );
  }, [preview.data?.conflicts]);

  const instructorConflicts = useMemo(() => {
    return (preview.data?.conflicts ?? []).filter((c) => c.type === "INSTRUCTOR_CONFLICT");
  }, [preview.data?.conflicts]);

  const otherConflicts = useMemo(() => {
    return (preview.data?.conflicts ?? []).filter(
      (c) =>
        c.type !== "ROOM_CONFLICT" &&
        c.type !== "ROOM_CAPACITY" &&
        c.type !== "INSTRUCTOR_CONFLICT",
    );
  }, [preview.data?.conflicts]);

  const conflictingBlockIds = useMemo(() => {
    const ids = new Set<string>();
    // 1. Preview conflicts (server-side, specific to current instructor)
    for (const c of preview.data?.conflicts ?? []) {
      const block = draft.blocks[c.blockIndex];
      if (block) ids.add(block.id);
    }

    // 2. Global validation for ALL blocks in draft (client-side)
    for (const b of draft.blocks) {
      // Check room conflict against baseline DB (roomOccupancyMap)
      const isRoomBusyInDB = Array.from({ length: b.periodCount }).some((_, i) =>
        roomOccupancyMap.has(roomDayPeriodKey(b.room, b.day, b.startPeriod + i)),
      );
      if (isRoomBusyInDB) ids.add(b.id);

      // Check for internal draft conflicts (overlapping rooms or instructors in draft)
      const isInternalConflict = draft.blocks.some(
        (other) =>
          other.id !== b.id &&
          blocksShareSlot(b, other) &&
          (other.room === b.room || other.instructorId === b.instructorId),
      );
      if (isInternalConflict) ids.add(b.id);
    }
    return ids;
  }, [preview.data?.conflicts, draft.blocks, roomOccupancyMap]);

  const [slotDialog, setSlotDialog] = useState<{
    day: OfferedSubjectDay;
    startPeriod: number;
  } | null>(null);

  const [pending, startTransition] = useTransition();

  const bootstrapError = [qStep1Support, qPeriod, qRoomsList, qStep2, qOfferings].find(
    (q) => q.isError,
  )?.error;

  const saveDisabledReason = useMemo(() => {
    if (!params) return "প্ল্যানিং কনটেক্সট খুঁজে পাওয়া যায়নি।";
    if (draft.blocks.length === 0) return "গবেষণাপত্রে অন্তত একটি শিডিউল ব্লক যোগ করুন।";

    // Group blocks by subject and instructor to validate each set
    const groups = new Map<string, ManualWorkspaceDraftBlock[]>();
    for (const b of draft.blocks) {
      const key = `${b.subjectId}:${b.instructorId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(b);
    }

    for (const [key, blocks] of groups.entries()) {
      const [subjectId] = key.split(":");
      const subject = step2?.subjects.find((s) => s._id === subjectId);
      if (!subject) continue;

      const theoryCount = blocks.filter((b) => b.classType === "theory").length;
      const practicalCount = blocks.filter((b) => b.classType === "practical").length;

      // 1. Weekly Theory Classes Confirmation
      const requiredTheory = subject.theoryPeriodsPerWeek ?? 0;
      if (theoryCount > requiredTheory) {
        return `${subject.title}: থিওরি ক্লাসের সংখ্যা পিরিয়ড (${requiredTheory}) এর বেশি হতে পারবে না। বর্তমানে: ${theoryCount}`;
      }
      if (theoryCount < requiredTheory) {
        return `${subject.title}: থিওরি ক্লাসের সংখ্যা পিরিয়ড (${requiredTheory}) এর কম হতে পারবে না। বর্তমানে: ${theoryCount}`;
      }

      // 2. Practical Class Calculation Logic
      const requiredPracticalPeriods = subject.practicalPeriodsPerWeek ?? 0;
      const expectedPracticalClasses = Math.floor(requiredPracticalPeriods / 3);
      if (practicalCount > expectedPracticalClasses) {
        return `${subject.title}: প্র্যাকটিক্যাল ক্লাসের সংখ্যা অনুপাত অনুযায়ী (${expectedPracticalClasses}) এর বেশি হতে পারবে না। বর্তমানে: ${practicalCount}`;
      }
      if (practicalCount < expectedPracticalClasses) {
        return `${subject.title}: প্র্যাকটিক্যাল ক্লাসের সংখ্যা অনুপাত অনুযায়ী (${expectedPracticalClasses}) এর কম হতে পারবে না। বর্তমানে: ${practicalCount}`;
      }

      // 3. Total Classes vs Credits
      const totalClasses = theoryCount + practicalCount;
      if (totalClasses > subject.credits) {
        return `${subject.title}: মোট ক্লাস সংখ্যা ক্রেডিটের (${subject.credits}) বেশি হতে পারবে না। বর্তমানে: ${totalClasses}`;
      }
      if (totalClasses < subject.credits) {
        return `${subject.title}: মোট ক্লাস সংখ্যা ক্রেডিটের (${subject.credits}) এর কম হতে পারবে না। বর্তমানে: ${totalClasses}`;
      }

      // 4. No multiple classes of same subject in a day
      const daysWithClasses = new Set<string>();
      for (const b of blocks) {
        if (daysWithClasses.has(b.day)) {
          return `${subject.title}: একদিনে একই সাবজেক্টের একাধিক ক্লাস বরাদ্দ করা যাবে না (${b.day})`;
        }
        daysWithClasses.add(b.day);
      }
    }

    if (preview.isFetching) return "কনফ্লিক্ট চেক করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...";
    if (preview.data?.hasConflict || conflictingBlockIds.size > 0) {
      return "সব কনফ্লিক্ট (লাল ব্লকগুলো) সমাধান করে পুনরায় চেষ্টা করুন।";
    }
    return null;
  }, [
    params,
    draft.blocks,
    step2?.subjects,
    preview.isFetching,
    preview.data?.hasConflict,
    conflictingBlockIds.size,
  ]);

  const gridLockMessage = useMemo(() => {
    if (!draft.subjectId) return "Select a subject first.";
    if (!draft.instructorId) return "Select an instructor to unlock only instructor-free periods.";
    if (!draft.roomId) {
      return "Instructor-busy periods are blocked now. Select a room to also block room-busy periods.";
    }
    if (roomAvailability.loading) return "Loading room-busy periods for the selected room.";
    if (roomAvailabilityError) {
      return "Room availability could not be verified, so slot placement stays locked.";
    }
    return null;
  }, [draft.instructorId, draft.roomId, draft.subjectId, roomAvailability.loading, roomAvailabilityError]);

  const handleSave = useCallback(() => {
    if (!params) {
      showToast({
        variant: "error",
        title: "Missing context",
        description: "Planning context is missing.",
      });
      return;
    }

    if (saveDisabledReason) {
      showToast({
        variant: "error",
        title: "Cannot save routine",
        description: saveDisabledReason,
      });
      return;
    }

    // Group blocks by subject and instructor to create multiple offered subjects
    const groups = new Map<string, ManualWorkspaceDraftBlock[]>();
    for (const b of draft.blocks) {
      const key = `${b.subjectId}:${b.instructorId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(b);
    }

    if (groups.size === 0) {
      showToast({
        variant: "error",
        title: "No blocks found",
        description: "গবেষণাপত্রে কোনো শিডিউল ব্লক পাওয়া যায়নি।",
      });
      return;
    }

    startTransition(async () => {
      try {
        let successCount = 0;
        const savedBlockIds: string[] = [];

        for (const [key, blocks] of groups.entries()) {
          const [subjectId, instructorId] = key.split(":");

          await createOfferedSubjectAction({
            semesterRegistration: params.semesterRegistrationId,
            academicInstructor: params.academicInstructorId,
            academicDepartment: params.academicDepartmentId,
            subject: subjectId,
            instructor: instructorId,
            maxCapacity: draft.maxCapacity,
            scheduleBlocks: blocks.map((b) => ({
              classType: b.classType,
              day: b.day,
              room: b.room,
              startPeriod: b.startPeriod,
              periodCount: b.periodCount,
            })),
          });

          successCount++;
          savedBlockIds.push(...blocks.map((b) => b.id));
        }

        showToast({
          variant: "success",
          title: "Save successful",
          description: `সফলভাবে ${successCount} টি সাবজেক্ট অফার করা হয়েছে।`,
        });

        // Remove all successfully saved blocks from the draft
        removeBlocks(savedBlockIds);
        preview.invalidateScheduleData();
      } catch (e) {
        showToast({
          variant: "error",
          title: "Save failed",
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }, [params, draft, saveDisabledReason, preview, removeBlocks]);

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Manual curriculum workspace"
          description="Choose academic instructor, department, semester, and capacity. You will move to the realtime planning surface next."
          action={
            <Link
              href="/dashboard/admin/curriculum-planning"
              className="focus-ring text-sm font-semibold text-(--accent)"
            >
              ← Back to curriculum planning
            </Link>
          }
        />
        <WorkspaceSetupGate />
      </div>
    );
  }

  const loadingCritical =
    qStep1Support.isPending ||
    qPeriod.isPending ||
    (qStep2.isPending && params) ||
    (qOfferings.isPending && params);

  return (
    <div className="space-y-4">
      <DashboardPageHeader
        title="Manual realtime routine"
        description="Offered-subject busy/free uses every row in the DB for your chosen semester registration; columns follow the active period config (teaching periods only)."
        action={
          <Link
            href="/dashboard/admin/curriculum-planning/workspace"
            className="focus-ring text-sm font-semibold text-(--accent)"
          >
            Change setup
          </Link>
        }
      />

      {bootstrapError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {bootstrapError instanceof Error ? bootstrapError.message : "Failed to load workspace data."}
        </div>
      ) : null}

      {loadingCritical ? (
        <div className="rounded-xl border border-(--line) p-6 text-sm text-(--text-dim)">Loading workspace…</div>
      ) : (
        <div className="relative min-h-[calc(100vh-12rem)] space-y-4">
          <ManualWorkspaceToolbar
            subjects={step2?.subjects ?? []}
            instructors={step2?.instructors ?? []}
            rooms={rooms}
            subjectId={draft.subjectId}
            instructorId={draft.instructorId}
            roomId={draft.roomId}
            maxCapacity={draft.maxCapacity}
            onSubjectChange={setSubjectId}
            onInstructorChange={setInstructorId}
            onRoomChange={setRoomId}
            onSave={handleSave}
            saving={pending}
            saveDisabledReason={saveDisabledReason}
            onAddPlannedSubject={addPlannedSubject}
            plannedSubjects={draft.plannedSubjects}
          />

          <ManualPlanningTracker
            subjects={step2?.subjects ?? []}
            instructors={step2?.instructors ?? []}
            plannedSubjects={draft.plannedSubjects}
            draftBlocks={draft.blocks}
            onRemovePlannedSubject={removePlannedSubject}
            onSelectSubject={(sId, iId) => {
              setSubjectId(sId);
              setInstructorId(iId);
            }}
            activeSubjectId={draft.subjectId}
            activeInstructorId={draft.instructorId}
          />

          <RoutineGrid
            schedulablePeriods={schedulablePeriods}
            draftBlocks={draft.blocks}
            conflicts={preview.data?.conflicts ?? []}
            onEmptyCell={(day, startPeriod) => setSlotDialog({ day, startPeriod })}
            onRemoveBlock={removeBlock}
            roomId={draft.roomId}
            instructorId={draft.instructorId}
            roomOccupancyMap={liveRoomOccupancyMap}
            instructorWeekOccupancyMap={liveInstructorOccupancyMap}
            roomConflictReady={roomConflictReady}
            lockMessage={gridLockMessage}
            subjectTitle={draftSubjectTitle}
            instructorLabel={draftInstructorLabel}
            rooms={rooms}
            subjects={step2?.subjects ?? []}
            instructors={step2?.instructors ?? []}
            conflictingBlockIds={conflictingBlockIds}
          />

          <div className="grid grid-cols-1 gap-6">
            <StaticPanel title="Room availability" subtitle={availabilityPanelSubtitle}>
              <RoomsAvailabilityPanel
                rooms={rooms}
                schedulablePeriods={schedulablePeriods}
                offerings={offerings}
                offeringsLoading={qOfferings.isPending}
                offeringsError={offeringsError}
                draftBlocks={draft.blocks}
                draftSubjectTitle={draftSubjectTitle}
                draftInstructorLabel={draftInstructorLabel}
                allowedPeriodNos={allowedPeriodNos}
                subjects={step2?.subjects ?? []}
                instructors={step2?.instructors ?? []}
                conflicts={roomConflicts}
                conflictsLoading={preview.isFetching}
              />
            </StaticPanel>

            <StaticPanel title="Instructor availability" subtitle={availabilityPanelSubtitle}>
              <InstructorsAvailabilityPanel
                instructorWeekOfferings={instructorWeekOfferings}
                instructorWeekLoading={instructorWeekOfferingsQuery.isPending}
                instructorWeekError={instructorWeekError}
                draftInstructorId={draft.instructorId}
                draftBlocks={draft.blocks}
                schedulablePeriods={schedulablePeriods}
                rooms={rooms}
                subjects={step2?.subjects ?? []}
                draftSubjectTitle={draftSubjectTitle}
                instructorLabel={draftInstructorLabel}
                conflicts={instructorConflicts}
                conflictsLoading={preview.isFetching}
              />
            </StaticPanel>

            <StaticPanel title="Other conflicts (preview)">
              <ConflictsPanel
                conflicts={otherConflicts}
                isLoading={preview.isFetching}
              />
            </StaticPanel>
          </div>

          <SlotAssignmentDialog
            open={Boolean(slotDialog)}
            day={slotDialog?.day ?? null}
            startPeriod={slotDialog?.startPeriod ?? null}
            schedulablePeriods={schedulablePeriods}
            maxCapacity={draft.maxCapacity}
            rooms={rooms}
            semesterRoomSlots={new Set(liveRoomOccupancyMap.keys())}
            draftBlocks={draft.blocks}
            instructorWeekOfferings={instructorWeekOfferings}
            editingBlock={null}
            allowedPeriodNos={allowedPeriodNos}
            roomId={draft.roomId}
            subjectId={draft.subjectId}
            subject={selectedSubject ?? null}
            instructorId={draft.instructorId}
            onClose={() => setSlotDialog(null)}
            onSave={(block) => {
              // The block coming from dialog already has subjectId and instructorId
              const draftInstructorOverlap = draft.blocks.some((existingBlock) =>
                blocksShareSlot(block, existingBlock),
              );
              if (draftInstructorOverlap) {
                showToast({
                  variant: "error",
                  title: "Instructor overlap",
                  description: "This draft block overlaps another selected block.",
                });
                return;
              }

              const draftRoomOverlap = draft.blocks.some(
                (existingBlock) =>
                  existingBlock.room === block.room &&
                  blocksShareSlot(block, existingBlock),
              );
              if (draftRoomOverlap) {
                showToast({
                  variant: "error",
                  title: "Room occupancy conflict",
                  description: "This room is already used by another draft block in the same slot.",
                });
                return;
              }

              // Final safety check before adding to draft
              const isRoomBusy = Array.from({ length: block.periodCount }).some((_, i) =>
                liveRoomOccupancyMap.has(roomDayPeriodKey(block.room, block.day, block.startPeriod + i))
              );
              if (isRoomBusy) {
                showToast({
                  variant: "error",
                  title: "Room occupancy conflict",
                  description: "This room is already occupied during one of the selected periods.",
                });
                return;
              }
              addBlock(block);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ManualCurriculumWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-(--text-dim)">Loading workspace…</div>}>
      <ManualCurriculumWorkspaceInner />
    </Suspense>
  );
}
