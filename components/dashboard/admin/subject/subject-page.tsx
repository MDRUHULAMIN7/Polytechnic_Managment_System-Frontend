"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { CirclePlus } from "lucide-react";
import { getInstructors } from "@/lib/api/instructor";
import {
  assignInstructorsToSubject,
  createSubject,
  deleteSubject,
  getInstructorsWithSubject,
  getSubjectById,
  getSubjects,
  removeInstructorsFromSubject,
  updateSubject,
} from "@/lib/api/subject";
import type { SubjectProfile } from "@/lib/api/types";
import {
  isSameServerListState,
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import { readSessionRole } from "@/lib/session";
import {
  EMPTY_CREATE_SUBJECT_FORM,
  EMPTY_UPDATE_SUBJECT_FORM,
  SUBJECT_DEFAULT_META,
  SUBJECT_DEFAULT_TABLE_STATE,
  SUBJECT_SORT_OPTIONS,
  SUBJECT_TABLE_FIELDS,
  SUBJECT_TABLE_PAGE_SIZES,
  parseNumericInput,
  type CreateSubjectFormValues,
  type SubjectOption,
  resolveActivePreRequisiteIds,
  resolveInstructorFullName,
  type InstructorAssignOption,
  type SubjectTableRow,
  type UpdateSubjectFormValues,
} from "@/lib/utils/subject/subject-utils";
import { useToastManager } from "@/lib/use-toast-manager";
import { SubjectAssignModal } from "@/components/dashboard/admin/subject/subject-assign-modal";
import { SubjectCreateForm } from "@/components/dashboard/admin/subject/subject-create-form";
import { SubjectDetailsModal } from "@/components/dashboard/admin/subject/subject-details-modal";
import { SubjectFilters } from "@/components/dashboard/admin/subject/subject-filters";
import { SubjectTable } from "@/components/dashboard/admin/subject/subject-table";
import { SubjectUpdateForm } from "@/components/dashboard/admin/subject/subject-update-form";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";

type DialogMode = "create" | "update" | "details" | "assign" | null;
type SubjectPageProps = {
  viewOnly?: boolean;
  viewRole?: "instructor" | "student";
};

export function SubjectPage({
  viewOnly = false,
  viewRole = "instructor",
}: SubjectPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SubjectTableRow[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [meta, setMeta] = useState(SUBJECT_DEFAULT_META);
  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(
      searchParams,
      SUBJECT_DEFAULT_TABLE_STATE,
      SUBJECT_SORT_OPTIONS,
    ),
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [activeRow, setActiveRow] = useState<SubjectTableRow | null>(null);
  const [detailRow, setDetailRow] = useState<SubjectProfile | null>(null);
  const [detailInstructorNames, setDetailInstructorNames] = useState<string[]>(
    [],
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [instructorOptions, setInstructorOptions] = useState<
    InstructorAssignOption[]
  >([]);
  const [assignedInstructorIds, setAssignedInstructorIds] = useState<string[]>(
    [],
  );
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>(
    [],
  );

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toasts, addToast, dismissToast } = useToastManager();

  const createForm = useForm<CreateSubjectFormValues>({
    defaultValues: EMPTY_CREATE_SUBJECT_FORM,
  });

  const updateForm = useForm<UpdateSubjectFormValues>({
    defaultValues: EMPTY_UPDATE_SUBJECT_FORM,
  });

  const fetchRows = useCallback(
    async (requestState: ServerListState) => {
      setLoading(true);
      try {
        const query = toApiQuery(
          requestState,
          SUBJECT_DEFAULT_TABLE_STATE,
          SUBJECT_TABLE_FIELDS,
        );
        const response = await getSubjects<SubjectTableRow>(query);
        const nextRows = response.data?.result ?? [];
        const nextMeta = response.data?.meta ?? {
          page: requestState.page,
          limit: requestState.limit,
          total: nextRows.length,
          totalPage: 1,
        };

        setRows(nextRows);
        setMeta(nextMeta);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load subjects.";
        setRows([]);
        setMeta((prev) => ({ ...prev, total: 0, totalPage: 1 }));
        addToast("error", "Load Failed", message);
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const fetchAssignmentData = useCallback(
    async (subjectId: string) => {
      try {
        const [instructorResponse, assignmentResponse] = await Promise.all([
          getInstructors<InstructorAssignOption>(
            new URLSearchParams("fields=_id,id,name,designation,email"),
          ),
          getInstructorsWithSubject(subjectId),
        ]);

        const allInstructors = instructorResponse.data?.result ?? [];
        const assigned = assignmentResponse.data?.instructors ?? [];
        const assignedIds = assigned.map((item) =>
          typeof item === "string" ? item : item._id,
        );

        setInstructorOptions(allInstructors);
        setAssignedInstructorIds(assignedIds);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load instructors for subject.";
        addToast("error", "Assign Load Failed", message);
      }
    },
    [addToast],
  );

  const fetchSubjectOptions = useCallback(
    async () => {
      try {
        const query = new URLSearchParams({
          page: "1",
          limit: "1000",
          sort: "title",
          fields: "_id,title,prefix,code",
        });
        const response = await getSubjects<SubjectOption>(query);
        setSubjectOptions(response.data?.result ?? []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load pre-requisite options.";
        addToast("error", "Pre-Req Load Failed", message);
      }
    },
    [addToast],
  );

  useEffect(() => {
    const nextState = parseServerListState(
      searchParams,
      SUBJECT_DEFAULT_TABLE_STATE,
      SUBJECT_SORT_OPTIONS,
    );
    setTableState((prev) =>
      isSameServerListState(prev, nextState) ? prev : nextState,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextQuery = toRouteQuery(tableState, SUBJECT_DEFAULT_TABLE_STATE).toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;

    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router, searchParams, tableState]);

  useEffect(() => {
    const role = readSessionRole();
    if (viewOnly) {
      if (role !== viewRole) {
        router.replace("/dashboard/forbidden");
      }
      return;
    }

    if (role !== "admin" && role !== "superAdmin") {
      router.replace("/dashboard/forbidden");
    }
  }, [router, viewOnly, viewRole]);

  useEffect(() => {
    void fetchRows(tableState);
  }, [fetchRows, tableState]);

  useEffect(() => {
    if (viewOnly) return;
    void fetchSubjectOptions();
  }, [fetchSubjectOptions, viewOnly]);

  const openCreate = () => {
    createForm.reset(EMPTY_CREATE_SUBJECT_FORM);
    setDialogMode("create");
  };

  const openUpdate = (row: SubjectTableRow) => {
    setActiveRow(row);
    const selectedPreRequisiteIds = resolveActivePreRequisiteIds(row);

    updateForm.reset({
      title: row.title,
      prefix: row.prefix,
      code: String(row.code),
      credits: String(row.credits),
      regulation: String(row.regulation),
      preRequisiteSubjectIds: selectedPreRequisiteIds,
    });
    setDialogMode("update");
  };

  const openDetails = async (row: SubjectTableRow) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);
    setDetailInstructorNames([]);
    try {
      const [subjectResult, assignmentResult] = await Promise.allSettled([
        getSubjectById(row._id),
        getInstructorsWithSubject(row._id),
      ]);

      if (subjectResult.status === "rejected") {
        throw subjectResult.reason;
      }

      setDetailRow(subjectResult.value.data);

      if (assignmentResult.status === "fulfilled") {
        const assigned = assignmentResult.value.data?.instructors ?? [];
        const names = assigned
          .map((item) =>
            typeof item === "string" ? item : resolveInstructorFullName(item),
          )
          .filter((name) => Boolean(name) && name !== "-");
        setDetailInstructorNames(names);
      } else {
        const message =
          assignmentResult.reason instanceof Error
            ? assignmentResult.reason.message
            : "Failed to load assigned instructors for this subject.";
        addToast("error", "Instructor Load Failed", message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load details.";
      addToast("error", "Details Failed", message);
      setDialogMode(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAssign = async (row: SubjectTableRow) => {
    setActiveRow(row);
    setDialogMode("assign");
    setAssignLoading(true);
    setSelectedInstructorIds([]);
    setInstructorOptions([]);
    setAssignedInstructorIds([]);
    try {
      await fetchAssignmentData(row._id);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    const code = parseNumericInput(values.code);
    const credits = parseNumericInput(values.credits);
    const regulation = parseNumericInput(values.regulation);

    if (code === null || credits === null || regulation === null) {
      addToast(
        "error",
        "Create Failed",
        "Code, credits, and regulation must be valid numbers.",
      );
      return;
    }

    try {
      const preRequisiteSubjectIds = [
        ...new Set(values.preRequisiteSubjectIds || []),
      ];
      const preRequisiteSubjects = preRequisiteSubjectIds.map((subjectId) => ({
        subject: subjectId,
      }));
      const payload = {
        title: values.title.trim(),
        prefix: values.prefix.trim(),
        code,
        credits,
        regulation,
        ...(preRequisiteSubjects.length > 0 ? { preRequisiteSubjects } : {}),
      };
      const response = await createSubject(payload);
      addToast("success", "Created", response.message);
      setDialogMode(null);
      createForm.reset(EMPTY_CREATE_SUBJECT_FORM);
      await fetchRows(tableState);
      await fetchSubjectOptions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      addToast("error", "Create Failed", message);
    }
  });

  const handleUpdate = updateForm.handleSubmit(async (values) => {
    if (!activeRow) return;
    const code = parseNumericInput(values.code);
    const credits = parseNumericInput(values.credits);
    const regulation = parseNumericInput(values.regulation);

    if (code === null || credits === null || regulation === null) {
      addToast(
        "error",
        "Update Failed",
        "Code, credits, and regulation must be valid numbers.",
      );
      return;
    }

    try {
      const selectedPreReqIds = [
        ...new Set(values.preRequisiteSubjectIds || []),
      ];
      const currentPreReqIds = resolveActivePreRequisiteIds(activeRow);
      const deletedPreReqIds = currentPreReqIds.filter(
        (subjectId) => !selectedPreReqIds.includes(subjectId),
      );
      const preRequisiteSubjects = [
        ...selectedPreReqIds.map((subjectId) => ({ subject: subjectId })),
        ...deletedPreReqIds.map((subjectId) => ({
          subject: subjectId,
          isDeleted: true,
        })),
      ];

      const payload = {
        title: values.title.trim(),
        prefix: values.prefix.trim(),
        code,
        credits,
        regulation,
        ...(preRequisiteSubjects.length > 0 ? { preRequisiteSubjects } : {}),
      };
      const response = await updateSubject(activeRow._id, payload);
      addToast("success", "Updated", response.message);
      setDialogMode(null);
      await fetchRows(tableState);
      await fetchSubjectOptions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      addToast("error", "Update Failed", message);
    }
  });

  const handleDelete = async (row: SubjectTableRow) => {
    const confirmed = window.confirm(`Delete subject "${row.title}"?`);
    if (!confirmed) return;

    setDeletingId(row._id);
    try {
      const response = await deleteSubject(row._id);
      addToast("success", "Deleted", response.message);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed.";
      addToast("error", "Delete Failed", message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleInstructorSelection = (instructorId: string) => {
    setSelectedInstructorIds((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId],
    );
  };

  const refreshAssignedInstructors = useCallback(async () => {
    if (!activeRow) return;
    const response = await getInstructorsWithSubject(activeRow._id);
    const assigned = response.data?.instructors ?? [];
    const assignedIds = assigned.map((item) =>
      typeof item === "string" ? item : item._id,
    );
    setAssignedInstructorIds(assignedIds);
  }, [activeRow]);

  const handleAssignSelected = async () => {
    if (!activeRow) return;
    const toAssign = selectedInstructorIds.filter(
      (id) => !assignedInstructorIds.includes(id),
    );
    if (toAssign.length === 0) {
      addToast(
        "info",
        "No Change",
        "Select at least one not-yet-assigned instructor.",
      );
      return;
    }

    setAssignSubmitting(true);
    try {
      const response = await assignInstructorsToSubject(activeRow._id, {
        instructors: toAssign,
      });
      addToast("success", "Assigned", response.message);
      await refreshAssignedInstructors();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Assign failed.";
      addToast("error", "Assign Failed", message);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (!activeRow) return;
    const toRemove = selectedInstructorIds.filter((id) =>
      assignedInstructorIds.includes(id),
    );
    if (toRemove.length === 0) {
      addToast(
        "info",
        "No Change",
        "Select at least one assigned instructor to remove.",
      );
      return;
    }

    setAssignSubmitting(true);
    try {
      const response = await removeInstructorsFromSubject(activeRow._id, {
        instructors: toRemove,
      });
      addToast("success", "Removed", response.message);
      await refreshAssignedInstructors();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Remove failed.";
      addToast("error", "Remove Failed", message);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const totalPages = Math.max(1, meta.totalPage || 1);
  const currentPage = Math.max(1, Math.min(tableState.page, totalPages));

  const assignSubjectTitle = useMemo(
    () => activeRow?.title ?? "-",
    [activeRow],
  );
  const updatePreRequisiteOptions = useMemo(
    () => subjectOptions.filter((subject) => subject._id !== activeRow?._id),
    [activeRow?._id, subjectOptions],
  );

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Subjects"
        subtitle={
          viewOnly
            ? "See all subjects in responsive table, view details, and see instructors assigned with a subject."
            : "See all subjects in responsive table, create/update/delete from table, view details, and assign/remove instructors."
        }
        action={
          viewOnly ? undefined : (
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110"
            >
              <CirclePlus className="h-4 w-4" aria-hidden />
              Create Subject
            </button>
          )
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <SubjectFilters
          tableState={tableState}
          rowsPerPage={SUBJECT_TABLE_PAGE_SIZES}
          onSearchChange={(value) =>
            setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }))
          }
          onSortChange={(value) =>
            setTableState((prev) => ({ ...prev, sort: value, page: 1 }))
          }
          onLimitChange={(value) =>
            setTableState((prev) => ({ ...prev, limit: value, page: 1 }))
          }
        />

        <SubjectTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          deletingId={deletingId}
          onDetails={openDetails}
          onUpdate={openUpdate}
          onAssign={openAssign}
          onDelete={handleDelete}
          onPrevPage={() =>
            setTableState((prev) => ({
              ...prev,
              page: Math.max(1, prev.page - 1),
            }))
          }
          onNextPage={() =>
            setTableState((prev) => ({
              ...prev,
              page: Math.min(totalPages, prev.page + 1),
            }))
          }
          viewOnly={viewOnly}
        />
      </section>

      {!viewOnly ? (
        <ModalFrame
          open={dialogMode === "create"}
          title="Create Subject"
          description="Create a new subject."
          onClose={() => setDialogMode(null)}
        >
          <SubjectCreateForm
            form={createForm}
            onSubmit={handleCreate}
            onCancel={() => setDialogMode(null)}
            availableSubjects={subjectOptions}
          />
        </ModalFrame>
      ) : null}

      {!viewOnly ? (
        <ModalFrame
          open={dialogMode === "update"}
          title="Update Subject"
          description="Update subject information."
          onClose={() => setDialogMode(null)}
        >
          <SubjectUpdateForm
            form={updateForm}
            onSubmit={handleUpdate}
            onCancel={() => setDialogMode(null)}
            availableSubjects={updatePreRequisiteOptions}
          />
        </ModalFrame>
      ) : null}

      <SubjectDetailsModal
        open={dialogMode === "details"}
        onClose={() => setDialogMode(null)}
        detailLoading={detailLoading}
        detailRow={detailRow}
        assignedInstructors={detailInstructorNames}
      />

      {!viewOnly ? (
        <SubjectAssignModal
          open={dialogMode === "assign"}
          onClose={() => setDialogMode(null)}
          subjectTitle={assignSubjectTitle}
          instructors={instructorOptions}
          assignedInstructorIds={assignedInstructorIds}
          selectedInstructorIds={selectedInstructorIds}
          loading={assignLoading}
          submitting={assignSubmitting}
          onToggle={toggleInstructorSelection}
          onAssign={handleAssignSelected}
          onRemove={handleRemoveSelected}
        />
      ) : null}
    </section>
  );
}

