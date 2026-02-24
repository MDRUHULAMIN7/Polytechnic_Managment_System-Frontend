"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAcademicInstructor,
  getAcademicInstructorById,
  getAcademicInstructors,
  updateAcademicInstructor,
} from "@/lib/api/academic-instructor";
import type { AcademicInstructor } from "@/lib/api/types";
import {
  applySearch,
  applyStartsWithFilter,
  isSameTableState,
  paginateRows,
  parseTableState,
  sortRows,
  tableStateToQuery,
  type TableQueryState,
} from "@/lib/utils/table/table-utils";
import {
  ACADEMIC_INSTRUCTOR_DEFAULT_TABLE_STATE,
  ACADEMIC_INSTRUCTOR_ROWS_PER_PAGE,
  type AcademicInstructorSort,
} from "@/lib/utils/academic-instructor/academic-instructor-utils";
import type {
  AcademicInstructorDialogMode,
  AcademicInstructorFormValues,
} from "@/lib/types/pages/academic.types";
import { useToastManager } from "@/lib/use-toast-manager";

type DialogState = {
  mode: AcademicInstructorDialogMode;
  activeRow: AcademicInstructor | null;
  detailRow: AcademicInstructor | null;
  detailLoading: boolean;
};

type DialogAction =
  | { type: "open-create" }
  | { type: "open-update"; row: AcademicInstructor }
  | { type: "open-details-start" }
  | { type: "open-details-success"; row: AcademicInstructor }
  | { type: "close" };

const INITIAL_DIALOG_STATE: DialogState = {
  mode: null,
  activeRow: null,
  detailRow: null,
  detailLoading: false,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "open-create":
      return { ...state, mode: "create", activeRow: null };
    case "open-update":
      return { ...state, mode: "update", activeRow: action.row };
    case "open-details-start":
      return { ...state, mode: "details", detailLoading: true, detailRow: null };
    case "open-details-success":
      return { ...state, detailLoading: false, detailRow: action.row };
    case "close":
      return { ...state, mode: null, detailLoading: false };
    default:
      return state;
  }
}

export function useAcademicInstructorPageController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [tableState, setTableState] = useState<TableQueryState>(() =>
    parseTableState(searchParams, ACADEMIC_INSTRUCTOR_DEFAULT_TABLE_STATE),
  );
  const [dialogState, dispatchDialog] = useReducer(dialogReducer, INITIAL_DIALOG_STATE);
  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<AcademicInstructorFormValues>({ defaultValues: { name: "" } });
  const updateForm = useForm<AcademicInstructorFormValues>({ defaultValues: { name: "" } });

  // Sync tableState from URL
  useEffect(() => {
    const nextState = parseTableState(searchParams, ACADEMIC_INSTRUCTOR_DEFAULT_TABLE_STATE);
    setTableState((prev) => (isSameTableState(prev, nextState) ? prev : nextState));
  }, [searchParams]);

  // Sync URL from tableState
  useEffect(() => {
    const nextQuery = tableStateToQuery(tableState, ACADEMIC_INSTRUCTOR_DEFAULT_TABLE_STATE).toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router, searchParams, tableState]);

  // Data query
  const instructorsQuery = useQuery({
    queryKey: ["academic-instructors", tableState],
    queryFn: () => getAcademicInstructors(),
  });

  const rows: AcademicInstructor[] = Array.isArray(instructorsQuery.data?.data)
    ? (instructorsQuery.data.data as AcademicInstructor[])
    : [];
  const loading = instructorsQuery.isLoading || instructorsQuery.isFetching;

  const deferredSearchTerm = useDeferredValue(tableState.searchTerm);

  const processedRows = useMemo(() => {
    const searched = applySearch(rows, deferredSearchTerm, (row) => row.name);
    const filtered = applyStartsWithFilter(searched, tableState.startsWith, (row) => row.name);
    return sortRows(filtered, tableState.sort === "-name" ? "desc" : "asc", (row) => row.name);
  }, [deferredSearchTerm, rows, tableState.sort, tableState.startsWith]);

  const pagination = useMemo(
    () => paginateRows(processedRows, { page: tableState.page, limit: tableState.limit }),
    [processedRows, tableState.page, tableState.limit],
  );

  useEffect(() => {
    if (pagination.page !== tableState.page) {
      setTableState((prev) => ({ ...prev, page: pagination.page }));
    }
  }, [pagination.page, tableState.page]);

  const closeDialog = () => dispatchDialog({ type: "close" });

  const setSearchTerm = (value: string) =>
    setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }));

  const setStartsWith = (value: TableQueryState["startsWith"]) =>
    setTableState((prev) => ({ ...prev, startsWith: value, page: 1 }));

  const setSort = (value: AcademicInstructorSort) =>
    setTableState((prev) => ({ ...prev, sort: value, page: 1 }));

  const setLimit = (value: number) =>
    setTableState((prev) => ({ ...prev, limit: value, page: 1 }));

  const goPrevPage = () => setTableState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));

  const goNextPage = () =>
    setTableState((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }));

  const openCreate = () => {
    createForm.reset({ name: "" });
    dispatchDialog({ type: "open-create" });
  };

  const openUpdate = (row: AcademicInstructor) => {
    updateForm.reset({ name: row.name });
    dispatchDialog({ type: "open-update", row });
  };

  const openDetails = async (row: AcademicInstructor) => {
    dispatchDialog({ type: "open-details-start" });
    try {
      const response = await getAcademicInstructorById(row._id);
      dispatchDialog({ type: "open-details-success", row: response.data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load details.";
      toast.error("Details Failed", message);
      dispatchDialog({ type: "close" });
    }
  };

  const submitCreate = async (values: AcademicInstructorFormValues) => {
    try {
      const response = await createAcademicInstructor({ name: values.name.trim() });
      toast.success("Created", response.message);
      dispatchDialog({ type: "close" });
      createForm.reset({ name: "" });
      await queryClient.invalidateQueries({ queryKey: ["academic-instructors"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      toast.error("Create Failed", message);
    }
  };

  const submitUpdate = async (values: AcademicInstructorFormValues) => {
    if (!dialogState.activeRow) return;
    try {
      const response = await updateAcademicInstructor(dialogState.activeRow._id, {
        name: values.name.trim(),
      });
      toast.success("Updated", response.message);
      dispatchDialog({ type: "close" });
      await queryClient.invalidateQueries({ queryKey: ["academic-instructors"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      toast.error("Update Failed", message);
    }
  };

  const handleCreate = createForm.handleSubmit(submitCreate);
  const handleUpdate = updateForm.handleSubmit(submitUpdate);

  return {
    closeDialog,
    createForm,
    detailLoading: dialogState.detailLoading,
    detailRow: dialogState.detailRow,
    dialogMode: dialogState.mode,
    dismissToast,
    goNextPage,
    goPrevPage,
    handleCreate,
    handleUpdate,
    loading,
    openCreate,
    openDetails,
    openUpdate,
    pagination,
    rowsPerPage: ACADEMIC_INSTRUCTOR_ROWS_PER_PAGE,
    setLimit,
    setSearchTerm,
    setSort,
    setStartsWith,
    tableState,
    toasts,
    updateForm,
  };
}
