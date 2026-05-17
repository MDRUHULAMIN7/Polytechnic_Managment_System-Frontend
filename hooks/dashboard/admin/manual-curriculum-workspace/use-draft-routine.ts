"use client";

import { useCallback, useReducer } from "react";
import type {
  ManualWorkspaceDraft,
  ManualWorkspaceDraftBlock,
  ManualPlanningSubject,
} from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import { generateMessageId } from "@/utils/common/generateId";

type DraftAction =
  | { type: "RESET"; maxCapacity: number }
  | { type: "SET_SUBJECT"; subjectId: string }
  | { type: "SET_INSTRUCTOR"; instructorId: string }
  | { type: "SET_ROOM"; roomId: string }
  | { type: "SET_MAX_CAPACITY"; maxCapacity: number }
  | { type: "ADD_BLOCK"; block: ManualWorkspaceDraftBlock }
  | { type: "REMOVE_BLOCK"; id: string }
  | { type: "REMOVE_BLOCKS"; ids: string[] }
  | { type: "REPLACE_BLOCKS"; blocks: ManualWorkspaceDraftBlock[] }
  | { type: "ADD_PLANNED_SUBJECT"; item: ManualPlanningSubject }
  | { type: "REMOVE_PLANNED_SUBJECT"; subjectId: string; instructorId: string };

function draftReducer(state: ManualWorkspaceDraft, action: DraftAction): ManualWorkspaceDraft {
  switch (action.type) {
    case "RESET":
      return {
        subjectId: "",
        instructorId: "",
        roomId: "",
        maxCapacity: action.maxCapacity,
        blocks: [],
        plannedSubjects: [],
      };
    case "SET_SUBJECT":
      return { ...state, subjectId: action.subjectId };
    case "SET_INSTRUCTOR":
      return { ...state, instructorId: action.instructorId };
    case "SET_ROOM":
      return { ...state, roomId: action.roomId };
    case "SET_MAX_CAPACITY":
      return { ...state, maxCapacity: action.maxCapacity };
    case "ADD_BLOCK":
      return { ...state, blocks: [...state.blocks, action.block] };
    case "REMOVE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.filter((b) => b.id !== action.id),
      };
    case "REMOVE_BLOCKS":
      return {
        ...state,
        blocks: state.blocks.filter((b) => !action.ids.includes(b.id)),
      };
    case "REPLACE_BLOCKS":
      return { ...state, blocks: action.blocks };
    case "ADD_PLANNED_SUBJECT": {
      const exists = state.plannedSubjects.some(
        (p) => p.subjectId === action.item.subjectId && p.instructorId === action.item.instructorId,
      );
      if (exists) return state;
      return { ...state, plannedSubjects: [...state.plannedSubjects, action.item] };
    }
    case "REMOVE_PLANNED_SUBJECT":
      return {
        ...state,
        plannedSubjects: state.plannedSubjects.filter(
          (p) => !(p.subjectId === action.subjectId && p.instructorId === action.instructorId),
        ),
      };
    default:
      return state;
  }
}

export function useDraftRoutine(initialMaxCapacity: number) {
  const [draft, dispatch] = useReducer(draftReducer, {
    subjectId: "",
    instructorId: "",
    roomId: "",
    maxCapacity: initialMaxCapacity,
    blocks: [],
    plannedSubjects: [],
  } satisfies ManualWorkspaceDraft);

  const reset = useCallback(
    (maxCapacity: number) => dispatch({ type: "RESET", maxCapacity }),
    [],
  );
  const setSubjectId = useCallback(
    (subjectId: string) => dispatch({ type: "SET_SUBJECT", subjectId }),
    [],
  );
  const setInstructorId = useCallback(
    (instructorId: string) => dispatch({ type: "SET_INSTRUCTOR", instructorId }),
    [],
  );
  const setRoomId = useCallback(
    (roomId: string) => dispatch({ type: "SET_ROOM", roomId }),
    [],
  );
  const setMaxCapacity = useCallback(
    (maxCapacity: number) => dispatch({ type: "SET_MAX_CAPACITY", maxCapacity }),
    [],
  );
  const addBlock = useCallback((block: Omit<ManualWorkspaceDraftBlock, "id">) => {
    const id = generateMessageId("draft-block");
    dispatch({ type: "ADD_BLOCK", block: { ...block, id } });
  }, []);
  const removeBlock = useCallback((id: string) => {
    dispatch({ type: "REMOVE_BLOCK", id });
  }, []);
  const removeBlocks = useCallback((ids: string[]) => {
    dispatch({ type: "REMOVE_BLOCKS", ids });
  }, []);
  const replaceBlocks = useCallback((blocks: ManualWorkspaceDraftBlock[]) => {
    dispatch({ type: "REPLACE_BLOCKS", blocks });
  }, []);
  const addPlannedSubject = useCallback((item: ManualPlanningSubject) => {
    dispatch({ type: "ADD_PLANNED_SUBJECT", item });
  }, []);
  const removePlannedSubject = useCallback((subjectId: string, instructorId: string) => {
    dispatch({ type: "REMOVE_PLANNED_SUBJECT", subjectId, instructorId });
  }, []);

  return {
    draft,
    reset,
    setSubjectId,
    setInstructorId,
    setRoomId,
    setMaxCapacity,
    addBlock,
    removeBlock,
    removeBlocks,
    replaceBlocks,
    addPlannedSubject,
    removePlannedSubject,
  };
}
