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
import { ConflictsPanel } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/panels/conflicts-panel";
import { RoomsAvailabilityPanel } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/panels/rooms-availability-panel";
import { InstructorsAvailabilityPanel } from "@/components/dashboard/admin/curriculum-planning/manual-workspace/panels/instructors-availability-panel";
import { loadStep1SupportData } from "@/lib/api/dashboard/admin/curriculum-planning";
import type { CurriculumPlanningStep1Data } from "@/lib/type/dashboard/admin/curriculum-planning";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import {
  buildInstructorPeriodOccupancySet,
  buildSemesterRoomOccupancySet,
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
  const router = useRouter();
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

  const draftApi = useDraftRoutine(params?.maxCapacity ?? 40);
  const { draft, reset, setSubjectId, setInstructorId, setRoomId, addBlock, removeBlock } = draftApi;

  const roomAvailability = useRoomAvailabilityData(Boolean(isComplete && params && draft.roomId));
  const roomAvailabilityError = roomAvailability.error;

  const roomOccupancyOfferings = useMemo(() => {
    if (roomAvailability.offeredSubjects.length > 0) {
      return roomAvailability.offeredSubjects;
    }
    return offerings;
  }, [roomAvailability.offeredSubjects, offerings]);

  const roomOccupancySlots = useMemo(
    () => buildSemesterRoomOccupancySet(roomOccupancyOfferings, { allowedPeriodNos }),
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

  const instructorWeekOccupancy = useMemo(
    () => buildInstructorPeriodOccupancySet(instructorWeekOfferings, { allowedPeriodNos }),
    [instructorWeekOfferings, allowedPeriodNos],
  );

  const draftSubjectTitle = useMemo(() => {
    const list = step2?.subjects ?? [];
    const s = list.find((x) => x._id === draft.subjectId);
    return s?.title?.trim() ?? "";
  }, [step2?.subjects, draft.subjectId]);

  const draftInstructorLabel = useMemo(() => {
    const list = step2?.instructors ?? [];
    const i = list.find((x) => x._id === draft.instructorId);
    return i ? resolveInstructorDisplayName(i.name) : "";
  }, [step2?.instructors, draft.instructorId]);

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

  const [slotDialog, setSlotDialog] = useState<{
    day: OfferedSubjectDay;
    startPeriod: number;
  } | null>(null);

  const [pending, startTransition] = useTransition();

  const bootstrapError = [qStep1Support, qPeriod, qRoomsList, qStep2, qOfferings].find(
    (q) => q.isError,
  )?.error;

  const saveDisabledReason = useMemo(() => {
    if (!params) return "Missing planning context.";
    if (!draft.subjectId) return "Select a subject.";
    if (!draft.instructorId) return "Select an instructor.";
    if (!draft.roomId) return "Select a room to unlock conflict-free slot placement.";
    if (roomAvailability.loading) return "Loading room availability for the selected room.";
    if (roomAvailabilityError) return "Room availability could not be verified.";
    if (!draft.blocks.length) return "Add at least one schedule block from the grid.";
    if (preview.isFetching) return "Waiting for conflict preview…";
    if (preview.data?.hasConflict) return "Resolve server-reported conflicts before saving.";
    return null;
  }, [
    params,
    draft.subjectId,
    draft.instructorId,
    draft.roomId,
    roomAvailability.loading,
    roomAvailabilityError,
    draft.blocks.length,
    preview.isFetching,
    preview.data?.hasConflict,
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
      showToast({ variant: "error", title: "Missing context", description: "Planning context is missing." });
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

    // Final atomic conflict check before server action
    for (const b of draft.blocks) {
      for (const sibling of draft.blocks) {
        if (sibling.id === b.id) continue;
        if (blocksShareSlot(b, sibling)) {
          showToast({
            variant: "error",
            title: "Atomic conflict detected",
            description: `Draft blocks overlap on ${b.day}. Resolve the overlap before saving.`,
          });
          return;
        }
        if (sibling.room === b.room && blocksShareSlot(b, sibling)) {
          showToast({
            variant: "error",
            title: "Atomic room conflict detected",
            description: `Room conflict found for ${b.day}. Save aborted.`,
          });
          return;
        }
      }

      // Check room conflict
      const isRoomBusy = Array.from({ length: b.periodCount }).some((_, i) =>
        roomOccupancySlots.has(roomDayPeriodKey(b.room, b.day, b.startPeriod + i))
      );
      if (isRoomBusy) {
        showToast({
          variant: "error",
          title: "Atomic conflict detected",
          description: `Room conflict found for block on ${b.day}. Save aborted.`,
        });
        return;
      }

      // Check instructor conflict against existing semester offerings
      for (const offering of instructorWeekOfferings) {
        if (!offering.scheduleBlocks) continue;
        for (const existingBlock of offering.scheduleBlocks) {
          if (blocksShareSlot(b, existingBlock)) {
            showToast({
              variant: "error",
              title: "Atomic conflict detected",
              description: `Instructor conflict found with "${
                typeof offering.subject === "string" ? "another subject" : offering.subject.title
              }" on ${b.day}. Save aborted.`,
            });
            return;
          }
        }
      }
    }

    startTransition(async () => {
      try {
        await createOfferedSubjectAction({
          semesterRegistration: params.semesterRegistrationId,
          academicInstructor: params.academicInstructorId,
          academicDepartment: params.academicDepartmentId,
          subject: draft.subjectId,
          instructor: draft.instructorId,
          maxCapacity: draft.maxCapacity,
          scheduleBlocks: draft.blocks.map((b) => ({
            classType: b.classType,
            day: b.day,
            room: b.room,
            startPeriod: b.startPeriod,
            periodCount: b.periodCount,
          })),
        });
        showToast({ variant: "success", title: "Offered subject created" });
        preview.invalidateScheduleData();
        router.push("/dashboard/admin/offered-subjects");
      } catch (e) {
        showToast({
          variant: "error",
          title: "Save failed",
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }, [params, draft, saveDisabledReason, preview, router, roomOccupancySlots, instructorWeekOfferings]);

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
          />

            <RoutineGrid
              schedulablePeriods={schedulablePeriods}
              draftBlocks={draft.blocks}
              conflicts={preview.data?.conflicts ?? []}
              onEmptyCell={(day, startPeriod) => setSlotDialog({ day, startPeriod })}
            onRemoveBlock={removeBlock}
              roomId={draft.roomId}
              instructorId={draft.instructorId}
              roomOccupancySlots={roomOccupancySlots}
              instructorWeekOccupancy={instructorWeekOccupancy}
              roomConflictReady={roomConflictReady}
              lockMessage={gridLockMessage}
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
              />
            </StaticPanel>

            <StaticPanel title="Instructor availability" subtitle={availabilityPanelSubtitle}>
              <InstructorsAvailabilityPanel
                instructors={step2?.instructors ?? []}
                instructorWeekOfferings={instructorWeekOfferings}
                instructorWeekLoading={instructorWeekOfferingsQuery.isPending}
                instructorWeekError={instructorWeekError}
                draftInstructorId={draft.instructorId}
                draftBlocks={draft.blocks}
                schedulablePeriods={schedulablePeriods}
                rooms={rooms}
                draftSubjectTitle={draftSubjectTitle}
              />
            </StaticPanel>

            <StaticPanel title="Server conflicts (preview)">
              <ConflictsPanel conflicts={preview.data?.conflicts ?? []} isLoading={preview.isFetching} />
            </StaticPanel>
          </div>

	          <SlotAssignmentDialog
            open={Boolean(slotDialog)}
            day={slotDialog?.day ?? null}
            startPeriod={slotDialog?.startPeriod ?? null}
            schedulablePeriods={schedulablePeriods}
            maxCapacity={draft.maxCapacity}
            rooms={rooms}
            semesterRoomSlots={roomOccupancySlots}
            draftBlocks={draft.blocks}
            instructorWeekOfferings={instructorWeekOfferings}
            editingBlock={null}
            allowedPeriodNos={allowedPeriodNos}
            roomId={draft.roomId}
            onClose={() => setSlotDialog(null)}
	            onSave={(block) => {
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
	                roomOccupancySlots.has(roomDayPeriodKey(block.room, block.day, block.startPeriod + i))
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
