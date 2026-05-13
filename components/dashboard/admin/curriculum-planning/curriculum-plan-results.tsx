/**
 * Curriculum Planning - Results & Advanced Management Interface
 * Displays the AI-generated curriculum in a professional grid format
 * with inline editing, drag-and-drop simulation, and real-time validation.
 */

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Edit2,
  RefreshCcw,
  Save,
  X,
  Undo,
  Redo,
  Info,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { updateOfferedSubjectAction } from "@/actions/dashboard/admin/offered-subject";
import {
  checkScheduleConflicts,
  loadRooms,
  loadStep2SupportData,
} from "@/lib/api/dashboard/admin/curriculum-planning";
import type {
  ConflictInfo,
  CurriculumPlanningBlock,
  CurriculumPlanningStep1Data,
  CurriculumPlanExecutionResult,
  CurriculumPlanResult,
  PeriodConfig,
  Period,
} from "@/lib/type/dashboard/admin/curriculum-planning";
import type {
  OfferedSubjectDay,
  OfferedSubjectScheduleBlock,
  OfferedSubjectUpdateInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import { OFFERED_SUBJECT_DAYS } from "@/lib/type/dashboard/admin/offered-subject/constants";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { showToast } from "@/utils/common/toast";

interface CurriculumPlanResultsProps {
  step1Data: CurriculumPlanningStep1Data;
  blocks: CurriculumPlanningBlock[];
  result: CurriculumPlanExecutionResult;
  onCreateAnother: () => void;
  onBackToOfferedSubjects: () => void;
  onFinalSave?: (result: CurriculumPlanExecutionResult) => Promise<void>;
  isPreSave?: boolean;
}

export function CurriculumPlanResults({
  step1Data,
  blocks,
  result,
  onBackToOfferedSubjects,
  onFinalSave,
  isPreSave = false,
}: CurriculumPlanResultsProps) {
  const normalizeDay = useCallback((rawDay: unknown): OfferedSubjectDay | null => {
    if (typeof rawDay !== "string") return null;

    const cleaned = rawDay.trim();
    if (!cleaned) return null;

    const lowered = cleaned.toLowerCase();
    const dayMap: Record<string, OfferedSubjectDay> = {
      sat: "Sat",
      saturday: "Sat",
      sun: "Sun",
      sunday: "Sun",
      mon: "Mon",
      monday: "Mon",
      tue: "Tue",
      tues: "Tue",
      tuesday: "Tue",
      wed: "Wed",
      wednesday: "Wed",
      thu: "Thu",
      thur: "Thu",
      thurs: "Thu",
      thursday: "Thu",
      fri: "Fri",
      friday: "Fri",
    };

    return dayMap[lowered] ?? null;
  }, []);

  // --- State Management ---
  const [localResult, setLocalResult] = useState(result);
  const [history, setHistory] = useState<CurriculumPlanExecutionResult[]>([result]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<OfferedSubjectScheduleBlock[] | null>(null);
  const [editConflicts, setEditConflicts] = useState<ConflictInfo[]>([]);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [viewMode, setViewMode] = useState<"list" | "routine">("list");
  const [isRoutineFullscreen, setIsRoutineFullscreen] = useState(false);
  const [isConflictChecking, setIsConflictChecking] = useState(false);
  const searchQuery: string = "";
  const filterType: "ALL" | "THEORY" | "LAB" = "ALL";

  const sortedPeriods = useMemo(() => {
    return periodConfig?.periods
      ? [...periodConfig.periods].sort((left, right) => left.periodNo - right.periodNo)
      : [];
  }, [periodConfig]);

  // --- Initialization ---
  useEffect(() => {
    setLocalResult(result);
    setHistory([result]);
    setHistoryIndex(0);
  }, [result]);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [roomsData, supportData] = await Promise.all([
          loadRooms(),
          loadStep2SupportData(step1Data.academicDepartmentId, step1Data.semesterRegistrationId),
        ]);

        if (isActive) {
          setRooms(roomsData.filter((room: Room) => room.isActive !== false));
          setSubjects(supportData.subjects);
          setInstructors(supportData.instructors);
          setPeriodConfig(supportData.periodConfig);
        }
      } catch (loadError) {
        if (isActive) {
          showToast({
            variant: "error",
            title: "Data Loading Error",
            description: loadError instanceof Error
              ? loadError.message
              : "Failed to load support data for the routine view.",
          });
        }
      } finally {
        // no-op: dataLoading state is not used in render
      }
    };

    void loadData();

    return () => { isActive = false; };
  }, [step1Data]);

  useEffect(() => {
    if (!isRoutineFullscreen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRoutineFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isRoutineFullscreen]);

  // --- Memoized Data ---
  const blockById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);

  const resolveRoomLabel = useCallback((room: OfferedSubjectScheduleBlock["room"]) => {
    if (typeof room !== "string") {
      return room ? `${room.roomName} ${room.roomNumber}`.trim() : "Unassigned Room";
    }
    const matchedRoom = rooms.find((item) => item._id === room);
    return matchedRoom ? `${matchedRoom.roomName} ${matchedRoom.roomNumber}`.trim() : room || "Unassigned Room";
  }, [rooms]);

  const filteredResults = useMemo(() => {
    return localResult.results.filter((res) => {
      const matchesSearch = !searchQuery || 
        (res.subjectId as string).toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.scheduleBlocks.some(sb => resolveRoomLabel(sb.room).toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === "ALL" || 
        res.scheduleBlocks.some(sb => sb.classType.toUpperCase() === filterType);

      return matchesSearch && matchesType;
    });
  }, [localResult.results, searchQuery, filterType, resolveRoomLabel]);

  const visibleDays = useMemo(() => {
    const scheduledDays = new Set(
      filteredResults
        .flatMap((res) => res.scheduleBlocks.map((sb) => normalizeDay(sb.day)))
        .filter((day): day is OfferedSubjectDay => Boolean(day)),
    );

    if (scheduledDays.size === 0) {
      return OFFERED_SUBJECT_DAYS.filter((day) => ["Sun", "Mon", "Tue", "Wed", "Thu"].includes(day));
    }

    return OFFERED_SUBJECT_DAYS.filter((day) => scheduledDays.has(day));
  }, [filteredResults, normalizeDay]);

  // --- Helpers ---
  function resolveRoomId(room: OfferedSubjectScheduleBlock["room"]) {
    return typeof room === "string" ? room : room?._id ?? "";
  }

  function resolveSubjectTitle(subjectId: string) {
    const subject = subjects.find((s) => s._id === subjectId);
    return subject?.title || subjectId;
  }

  function resolveInstructorName(instructorId: string) {
    const instructor = instructors.find((i) => i._id === instructorId);
    return instructor ? resolveName(instructor.name) : instructorId;
  }

  function resolveTimeRange(startPeriod: number, periodCount: number) {
    if (sortedPeriods.length) {
      const startP = sortedPeriods.find((p: Period) => p.periodNo === startPeriod);
      const endP = sortedPeriods.find((p: Period) => p.periodNo === startPeriod + periodCount - 1);
      
      if (startP && endP) {
        return `${startP.startTime} - ${endP.endTime}`;
      }
    }

    // Fallback if config missing
    const startHour = 8 + Math.floor((startPeriod - 1) * 0.75);
    const startMin = ((startPeriod - 1) * 45) % 60;
    const endHour = 8 + Math.floor((startPeriod - 1 + periodCount) * 0.75);
    const endMin = ((startPeriod - 1 + periodCount) * 45) % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(startHour)}:${pad(startMin)} - ${pad(endHour)}:${pad(endMin)}`;
  }

  const getSavedOfferedSubjectId = useCallback((blockId: string) => {
    let savedIndex = 0;
    for (const blockResult of localResult.results) {
      if (blockResult.success && blockResult.scheduleBlocks.length > 0) {
        if (blockResult.blockId === blockId) {
          return localResult.createdOfferedSubjects[savedIndex] ?? null;
        }
        savedIndex += 1;
      }
    }
    return null;
  }, [localResult.results, localResult.createdOfferedSubjects]);

  // --- History System ---
  const pushHistory = useCallback((nextResult: CurriculumPlanExecutionResult) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextResult);
    if (nextHistory.length > 20) nextHistory.shift(); // Limit history
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setLocalResult(nextResult);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setLocalResult(prev);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setLocalResult(next);
    }
  };

  // --- Editing Logic ---
  function handleEditStart(blockResult: CurriculumPlanResult) {
    setEditingBlockId(blockResult.blockId);
    setEditingSchedule(
      blockResult.scheduleBlocks.map((sb) => ({
        ...sb,
        room: resolveRoomId(sb.room),
      })),
    );
    setEditConflicts(blockResult.conflicts);
  }

  function handleCancelEdit() {
    setEditingBlockId(null);
    setEditingSchedule(null);
    setEditConflicts([]);
  }

  useEffect(() => {
    if (!editingBlockId || !editingSchedule) return;

    const blockResult = localResult.results.find((item) => item.blockId === editingBlockId);
    if (!blockResult) return;

    const excludeOfferedSubjectId = getSavedOfferedSubjectId(editingBlockId);
    const maxCapacity = blockById.get(editingBlockId)?.maxCapacity ?? 40;

    const timeout = window.setTimeout(async () => {
      setIsConflictChecking(true);
      try {
        const preview = await checkScheduleConflicts({
          semesterRegistrationId: step1Data.semesterRegistrationId,
          academicDepartmentId: step1Data.academicDepartmentId,
          instructorId: blockResult.instructorId,
          maxCapacity,
          scheduleBlocks: editingSchedule,
          excludeOfferedSubjectId,
        });
        setEditConflicts((preview.conflicts ?? []) as ConflictInfo[]);
      } catch {
        // keep UI responsive even if preview fails
      } finally {
        setIsConflictChecking(false);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [
    blockById,
    editingBlockId,
    editingSchedule,
    getSavedOfferedSubjectId,
    localResult.results,
    step1Data.academicDepartmentId,
    step1Data.semesterRegistrationId,
  ]);

  async function handleSaveEdit() {
    if (!editingBlockId || !editingSchedule) return;

    const blockResult = localResult.results.find((item) => item.blockId === editingBlockId);
    if (!blockResult) return;

    if (isPreSave) {
      const maxCapacity = blockById.get(editingBlockId)?.maxCapacity ?? 40;
      const excludeOfferedSubjectId = getSavedOfferedSubjectId(editingBlockId);

      setIsSaving(true);
      try {
        const preview = await checkScheduleConflicts({
          semesterRegistrationId: step1Data.semesterRegistrationId,
          academicDepartmentId: step1Data.academicDepartmentId,
          instructorId: blockResult.instructorId,
          maxCapacity,
          scheduleBlocks: editingSchedule,
          excludeOfferedSubjectId,
        });

        const nextConflicts = (preview.conflicts ?? []) as ConflictInfo[];
        setEditConflicts(nextConflicts);

        if (preview.hasConflict) {
          showToast({
            variant: "error",
            title: "Conflicts Detected",
            description: nextConflicts[0]?.message ?? "Please resolve conflicts before saving.",
          });
          return;
        }

        const nextResults = localResult.results.map((item) =>
          item.blockId === editingBlockId
            ? { ...item, scheduleBlocks: editingSchedule, conflicts: nextConflicts }
            : item,
        );

        const nextResult: CurriculumPlanExecutionResult = {
          ...localResult,
          results: nextResults,
          summary: {
            ...localResult.summary,
            totalConflicts: nextResults.flatMap((r) => r.conflicts),
          },
        };

        pushHistory(nextResult);
        handleCancelEdit();
        showToast({
          variant: "success",
          title: "Adjustment Applied",
          description: "Routine updated locally. Don't forget to save.",
        });
      } catch (error) {
        showToast({
          variant: "error",
          title: "Conflict Check Failed",
          description: error instanceof Error ? error.message : "Unable to validate conflicts.",
        });
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const offeredSubjectId = getSavedOfferedSubjectId(editingBlockId);
    if (!offeredSubjectId) {
      showToast({ variant: "error", title: "Error", description: "This block cannot be edited at this time." });
      return;
    }

    setIsSaving(true);
    try {
      const maxCapacity = blockById.get(editingBlockId)?.maxCapacity ?? 40;
      const preview = await checkScheduleConflicts({
        semesterRegistrationId: step1Data.semesterRegistrationId,
        academicDepartmentId: step1Data.academicDepartmentId,
        instructorId: blockResult.instructorId,
        maxCapacity,
        scheduleBlocks: editingSchedule,
        excludeOfferedSubjectId: offeredSubjectId,
      });
      const nextConflicts = (preview.conflicts ?? []) as ConflictInfo[];
      setEditConflicts(nextConflicts);

      if (preview.hasConflict) {
        showToast({
          variant: "error",
          title: "Conflicts Detected",
          description: nextConflicts[0]?.message ?? "Please resolve conflicts before saving.",
        });
        return;
      }

      const payload: OfferedSubjectUpdateInput = {
        instructor: blockResult.instructorId,
        maxCapacity,
        scheduleBlocks: editingSchedule.map((sb) => ({
          classType: sb.classType,
          day: sb.day,
          room: resolveRoomId(sb.room),
          startPeriod: sb.startPeriod,
          periodCount: sb.periodCount,
        })),
      };

      await updateOfferedSubjectAction(offeredSubjectId, payload);

      const nextResults = localResult.results.map((item) =>
        item.blockId === editingBlockId
          ? { ...item, scheduleBlocks: editingSchedule, conflicts: nextConflicts }
          : item
      );

      const nextResult: CurriculumPlanExecutionResult = {
        ...localResult,
        results: nextResults,
        summary: {
          ...localResult.summary,
          totalConflicts: nextResults.flatMap(r => r.conflicts),
        }
      };

      pushHistory(nextResult);
      handleCancelEdit();
      showToast({ variant: "success", title: "Routine Updated", description: "The schedule has been updated successfully." });
    } catch (error) {
      showToast({ variant: "error", title: "Update Failed", description: error instanceof Error ? error.message : "Error updating schedule." });
    } finally {
      setIsSaving(false);
    }
  }

  // --- Visual Components ---
  const successfulResults = localResult.results.filter(r => r.success);
  const failedResults = localResult.results.filter(r => !r.success);

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-slate-50/50 p-4 lg:p-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white rounded-4xl p-8 shadow-sm border border-slate-100"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Suggested Routine</h1>
          <p className="text-slate-500 font-medium">{successfulResults.length} subjects planned</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => {
                setViewMode("list");
                setIsRoutineFullscreen(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              List View
            </button>
            <button 
              onClick={() => {
                setViewMode("routine");
                setIsRoutineFullscreen(true);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "routine" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Routine View
            </button>
          </div>

          <div className="h-10 w-px bg-slate-200 mx-2 self-center" />

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={undo} 
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-white rounded-xl transition disabled:opacity-30" title="Undo"
            >
              <Undo className="h-4 w-4 text-slate-600" />
            </button>
            <button 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-white rounded-xl transition disabled:opacity-30" title="Redo"
            >
              <Redo className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <div className="h-10 w-px bg-slate-200 mx-2 self-center" />

          <button
            onClick={onBackToOfferedSubjects}
            className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => onFinalSave?.(localResult)}
            className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-md shadow-green-200"
          >
            <Save className="h-4 w-4" />
            Finalize & Save
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {viewMode === "routine" ? (
            <motion.div
              key="routine"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`xl:col-span-9 space-y-6 ${
                isRoutineFullscreen
                  ? "fixed inset-0 z-40 overflow-auto bg-slate-50/95 p-4 lg:p-8 backdrop-blur-sm"
                  : ""
              }`}
            >
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                {isRoutineFullscreen && (
                  <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Routine View</h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Press Esc or use button to exit full screen
                      </p>
                    </div>
                    <button
                      onClick={() => setIsRoutineFullscreen(false)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Minimize2 className="h-4 w-4" />
                      Exit Full Screen
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-r border-slate-100 w-32">
                      Day / Period
                    </th>
                    {sortedPeriods.map((period, i) => {
                      if (period.isBreak) {
                        return (
                          <th key={i} className="p-4 text-center bg-amber-50/30 border-b border-slate-100 w-16">
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest rotate-90 whitespace-nowrap">
                              {period.title || "BREAK"}
                            </div>
                            <div className="text-[7px] font-bold text-amber-400 mt-2 lowercase">
                              {period.startTime}-{period.endTime}
                            </div>
                          </th>
                        );
                      }
                      
                      return (
                        <th key={i} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                          Period {period.periodNo}
                          <div className="text-[8px] font-bold text-slate-400 mt-1 lowercase tracking-normal">
                            {period.startTime}-{period.endTime}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visibleDays.map((day) => (
                    <tr key={day} className="group">
                      <td className="p-4 border-b border-r border-slate-100 bg-slate-50/20 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                        {day}
                      </td>
                      {periodConfig?.periods?.map((period, periodIdx) => {
                        const periodNo = period.periodNo;
                        const matchedBlock = filteredResults.find((res) =>
                          res.scheduleBlocks.some(
                            (sb) =>
                              normalizeDay(sb.day) === day &&
                              periodNo >= sb.startPeriod &&
                              periodNo < sb.startPeriod + sb.periodCount,
                          ),
                        );

                        const scheduleBlock = matchedBlock?.scheduleBlocks.find(
                          (sb) =>
                            normalizeDay(sb.day) === day &&
                            periodNo >= sb.startPeriod &&
                            periodNo < sb.startPeriod + sb.periodCount,
                        );

                        const isCoveredByBlock = Boolean(scheduleBlock);

                        if (period.isBreak) {
                          // If this break column is covered by a spanning block,
                          // skip it so the starting td's `colSpan` keeps table layout consistent.
                          if (isCoveredByBlock && scheduleBlock && periodNo !== scheduleBlock.startPeriod) {
                            return null;
                          }

                          return (
                            <td
                              key={periodIdx}
                              className="bg-amber-50/10 border-b border-slate-100"
                            />
                          );
                        }

                        if (scheduleBlock && matchedBlock) {
                          if (periodNo !== scheduleBlock.startPeriod) return null;

                          const isTheory = scheduleBlock.classType.toUpperCase() === "THEORY";

                          return (
                            <td
                              key={periodIdx}
                              colSpan={scheduleBlock.periodCount}
                              className="p-1.5 border-b border-r border-slate-100 transition-all align-top"
                            >
                                  <motion.div
                                onClick={() => handleEditStart(matchedBlock)}
                                    className={`relative flex flex-col min-h-[132px] rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-md
                                  ${
                                    isTheory
                                      ? "bg-blue-50/40 border-blue-200 hover:border-blue-400"
                                      : "bg-fuchsia-50/40 border-fuchsia-200 hover:border-fuchsia-400"
                                  }`}
                              >
                                <div className="flex items-start justify-between mb-3 gap-2">
                                  <h4
                                        className="text-[12px] font-extrabold leading-snug text-slate-900 line-clamp-3"
                                  >
                                    {resolveSubjectTitle(matchedBlock.subjectId)}
                                  </h4>
                                  <span
                                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0
                                      ${
                                        isTheory ? "bg-blue-600 text-white" : "bg-fuchsia-600 text-white"
                                      }`}
                                  >
                                    {isTheory ? "THEORY" : "LAB"}
                                  </span>
                                </div>

                                <div className="space-y-1.5 mt-auto">
                                  <p className="text-[10px] font-bold text-slate-500 truncate">
                                    {resolveInstructorName(matchedBlock.instructorId)}
                                  </p>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-medium text-slate-400">
                                      {resolveRoomLabel(scheduleBlock.room)}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={periodIdx}
                            className="p-1.5 border-b border-r border-slate-100 transition"
                          >
                            <div className="h-full min-h-35 w-full rounded-2xl border border-dashed border-slate-100" />
                          </td>
                        );
                      })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid gap-4">
                {filteredResults.map((res) => (
                  <div 
                    key={res.blockId} 
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`h-16 w-16 rounded-3xl flex items-center justify-center shrink-0 border
                        ${res.success ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                        {res.success ? <Calendar className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">{resolveSubjectTitle(res.subjectId)}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {resolveInstructorName(res.instructorId)}
                          </span>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                            {res.scheduleBlocks.length} Session(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex flex-col items-end gap-1 mr-4">
                        {res.scheduleBlocks.map((sb, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sb.day}</span>
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                              {resolveTimeRange(sb.startPeriod, sb.periodCount)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleEditStart(res)}
                        className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          {/* Failed / Warning Section */}
          {failedResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest ml-4">
                <AlertCircle className="h-4 w-4" />
                Planning Warnings
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {failedResults.map((block) => (
                  <div key={block.blockId} className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm flex gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{resolveSubjectTitle(block.subjectId)}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{block.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Edit Overlay */}
      <AnimatePresence>
        {editingBlockId && editingSchedule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay)/70 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-(--surface) rounded-3xl shadow-2xl overflow-hidden border border-(--line)"
            >
              <div className="bg-(--surface-muted) p-6 sm:p-8 border-b border-(--line) flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-(--accent) flex items-center justify-center text-(--accent-ink)">
                    <Edit2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-(--text)">Modify Routine Block</h3>
                    <p className="text-xs font-bold text-(--text-dim) uppercase tracking-widest mt-1">
                      Manual Adjustment {isConflictChecking ? "· checking..." : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="h-10 w-10 rounded-xl bg-(--surface) border border-(--line) flex items-center justify-center text-(--text-dim) hover:text-(--text) transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {editingSchedule.map((sb, idx) => (
                  <div key={idx} className="bg-(--surface-muted)/40 rounded-3xl p-6 border border-(--line) space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest ml-1">Day</label>
                        <select 
                          value={sb.day}
                          onChange={(e) => {
                            const next = [...editingSchedule];
                            next[idx].day = e.target.value as OfferedSubjectDay;
                            setEditingSchedule(next);
                          }}
                          className="w-full h-12 px-4 rounded-2xl bg-(--surface) border border-(--line) focus:border-(--accent) focus:ring-4 focus:ring-(--accent)/10 transition text-sm font-bold text-(--text)"
                        >
                          {OFFERED_SUBJECT_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest ml-1">Room Assignment</label>
                        <select 
                          value={resolveRoomId(sb.room)}
                          onChange={(e) => {
                            const next = [...editingSchedule];
                            next[idx].room = e.target.value;
                            setEditingSchedule(next);
                          }}
                          className="w-full h-12 px-4 rounded-2xl bg-(--surface) border border-(--line) focus:border-(--accent) focus:ring-4 focus:ring-(--accent)/10 transition text-sm font-bold text-(--text)"
                        >
                          <option value="">Auto Select</option>
                          {rooms.map(r => (
                            <option key={r._id} value={r._id}>
                              {r.roomName} {r.roomNumber} ({r.roomType})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest ml-1">Start Period</label>
                        <input 
                          type="number" min={1} max={8}
                          value={sb.startPeriod}
                          onChange={(e) => {
                            const next = [...editingSchedule];
                            next[idx].startPeriod = parseInt(e.target.value);
                            setEditingSchedule(next);
                          }}
                          className="w-full h-12 px-4 rounded-2xl bg-(--surface) border border-(--line) focus:border-(--accent) focus:ring-4 focus:ring-(--accent)/10 transition text-sm font-bold text-(--text)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-(--text-dim) uppercase tracking-widest ml-1">Duration (Periods)</label>
                        <input 
                          type="number" min={1} max={4}
                          value={sb.periodCount}
                          onChange={(e) => {
                            const next = [...editingSchedule];
                            next[idx].periodCount = parseInt(e.target.value);
                            setEditingSchedule(next);
                          }}
                          className="w-full h-12 px-4 rounded-2xl bg-(--surface) border border-(--line) focus:border-(--accent) focus:ring-4 focus:ring-(--accent)/10 transition text-sm font-bold text-(--text)"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {editConflicts.length > 0 && (
                  <div className="bg-red-500/10 rounded-3xl p-6 border border-red-500/20 flex gap-4">
                    <Info className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-red-700 uppercase tracking-wider">Conflicts Detected</h4>
                      <ul className="mt-2 space-y-1">
                        {editConflicts.map((c, i) => (
                          <li key={i} className="text-xs text-red-700 font-medium">• {c.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 bg-(--surface-muted) border-t border-(--line) flex gap-3">
                <button 
                  onClick={handleCancelEdit}
                  className="flex-1 h-14 rounded-2xl bg-(--surface) border border-(--line) text-(--text) font-bold hover:bg-(--surface-alt) transition shadow-sm"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving || editConflicts.length > 0}
                  className="flex-2 h-14 rounded-2xl bg-(--accent) text-(--accent-ink) font-bold hover:brightness-95 transition shadow-lg shadow-(--accent)/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Adjustments
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-200/60">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Theory: <span className="text-blue-500">blue cards</span>
            </span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Lab / Practical: <span className="text-fuchsia-500">violet cards</span>
            </span>
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          AI Suggested Routine · Poly Management System
        </p>
      </div>
    </div>
  );
}
