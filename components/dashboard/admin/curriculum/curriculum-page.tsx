"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { CirclePlus } from "lucide-react";
import { getAcademicDepartments } from "@/lib/api/academic-department";
import { createCurriculum, deleteCurriculum, getCurriculumById, getCurriculums, updateCurriculum } from "@/lib/api/curriculum";
import { getSemesterRegistrations } from "@/lib/api/semester-registration";
import { getSubjects } from "@/lib/api/subject";
import type { Curriculum } from "@/lib/api/types";
import {
  isSameServerListState,
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import { readSessionRole } from "@/lib/session";
import type {
  CurriculumAcademicDepartmentOption,
  CurriculumDialogMode,
  CurriculumFormValues,
  CurriculumSemesterRegistrationOption,
  CurriculumSort,
  CurriculumSubjectOption,
} from "@/lib/types/pages/curriculum/curriculum.types";
import { useToastManager } from "@/lib/use-toast-manager";
import {
  buildCurriculumFormDefaults,
  CURRICULUM_DEFAULT_META,
  CURRICULUM_DEFAULT_TABLE_STATE,
  CURRICULUM_ROWS_PER_PAGE,
  CURRICULUM_SORT_OPTIONS,
  CURRICULUM_TABLE_FIELDS,
  EMPTY_CURRICULUM_FORM,
  isValidSession,
  parseRegulation,
  resolveAcademicSemesterLabel,
  resolveSemesterRegistrationLabel,
} from "@/lib/utils/curriculum/curriculum-utils";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";
import { CurriculumTable } from "./curriculum-table";
import { CurriculumForm } from "./curriculum-form";
import { CurriculumFilters } from "./curriculum-filters";
import { CurriculumDetailsContent } from "./curriculum-details-content";

type CurriculumPageProps = {
  viewOnly?: boolean;
  viewRole?: "instructor" | "student";
};

export function CurriculumPage({
  viewOnly = false,
  viewRole = "instructor",
}: CurriculumPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Curriculum[]>([]);
  const [meta, setMeta] = useState(CURRICULUM_DEFAULT_META);
  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(
      searchParams,
      CURRICULUM_DEFAULT_TABLE_STATE,
      CURRICULUM_SORT_OPTIONS,
    ),
  );
  const [dialogMode, setDialogMode] = useState<CurriculumDialogMode>(null);
  const [activeRow, setActiveRow] = useState<Curriculum | null>(null);
  const [detailRow, setDetailRow] = useState<Curriculum | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [departments, setDepartments] = useState<CurriculumAcademicDepartmentOption[]>([]);
  const [semesterRegistrations, setSemesterRegistrations] = useState<CurriculumSemesterRegistrationOption[]>([]);
  const [subjects, setSubjects] = useState<CurriculumSubjectOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<CurriculumFormValues>({
    defaultValues: EMPTY_CURRICULUM_FORM,
  });
  const updateForm = useForm<CurriculumFormValues>({
    defaultValues: EMPTY_CURRICULUM_FORM,
  });

  const fetchRows = useCallback(
    async (requestState: ServerListState) => {
      setLoading(true);
      try {
        const query = toApiQuery(
          requestState,
          CURRICULUM_DEFAULT_TABLE_STATE,
          CURRICULUM_TABLE_FIELDS,
        );
        const response = await getCurriculums(query);
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
          error instanceof Error ? error.message : "Failed to load curriculums.";
        setRows([]);
        setMeta((prev) => ({
          ...prev,
          total: 0,
          totalPage: 1,
          page: requestState.page,
          limit: requestState.limit,
        }));
        toast.error("Load Failed", message);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);

    const departmentQuery = new URLSearchParams({
      page: "1",
      limit: "1000",
      sort: "name",
      fields: "_id,name",
    });
    const semesterRegistrationQuery = new URLSearchParams({
      page: "1",
      limit: "1000",
      sort: "-createdAt",
      fields: "_id,academicSemester,shift,status,startDate,endDate",
    });
    const subjectQuery = new URLSearchParams({
      page: "1",
      limit: "1000",
      sort: "title",
      fields: "_id,title,prefix,code,credits,regulation",
    });

    if (viewOnly) {
      const [departmentResponse, semesterRegistrationResponse, subjectResponse] =
        await Promise.allSettled([
          getAcademicDepartments(departmentQuery),
          getSemesterRegistrations(semesterRegistrationQuery),
          getSubjects<CurriculumSubjectOption>(subjectQuery),
        ]);

      setDepartments(
        departmentResponse.status === "fulfilled"
          ? ((departmentResponse.value.data ?? []) as CurriculumAcademicDepartmentOption[])
          : [],
      );
      setSemesterRegistrations(
        semesterRegistrationResponse.status === "fulfilled"
          ? ((semesterRegistrationResponse.value.data?.result ?? []) as CurriculumSemesterRegistrationOption[])
          : [],
      );
      setSubjects(
        subjectResponse.status === "fulfilled"
          ? ((subjectResponse.value.data?.result ?? []) as CurriculumSubjectOption[])
          : [],
      );
      setOptionsLoading(false);
      return;
    }

    try {
      const [departmentResponse, semesterRegistrationResponse, subjectResponse] =
        await Promise.all([
          getAcademicDepartments(departmentQuery),
          getSemesterRegistrations(semesterRegistrationQuery),
          getSubjects<CurriculumSubjectOption>(subjectQuery),
        ]);

      setDepartments((departmentResponse.data ?? []) as CurriculumAcademicDepartmentOption[]);
      setSemesterRegistrations(
        (semesterRegistrationResponse.data?.result ?? []) as CurriculumSemesterRegistrationOption[],
      );
      setSubjects((subjectResponse.data?.result ?? []) as CurriculumSubjectOption[]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load create/update options.";
      setDepartments([]);
      setSemesterRegistrations([]);
      setSubjects([]);
      toast.error("Options Load Failed", message);
    } finally {
      setOptionsLoading(false);
    }
  }, [toast, viewOnly]);

  useEffect(() => {
    const nextState = parseServerListState(
      searchParams,
      CURRICULUM_DEFAULT_TABLE_STATE,
      CURRICULUM_SORT_OPTIONS,
    );
    setTableState((prev) =>
      isSameServerListState(prev, nextState) ? prev : nextState,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextQuery = toRouteQuery(tableState, CURRICULUM_DEFAULT_TABLE_STATE).toString();
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
    void fetchOptions();
  }, [fetchOptions]);

  const departmentNameById = useMemo(
    () => new Map(departments.map((department) => [department._id, department.name])),
    [departments],
  );

  const semesterLabelById = useMemo(() => {
    const map = new Map<string, string>();
    semesterRegistrations.forEach((registration) => {
      if (
        registration.academicSemester &&
        typeof registration.academicSemester !== "string"
      ) {
        map.set(
          registration.academicSemester._id,
          resolveAcademicSemesterLabel(registration.academicSemester),
        );
      }
    });
    return map;
  }, [semesterRegistrations]);

  const semesterRegistrationLabelById = useMemo(
    () =>
      new Map(
        semesterRegistrations.map((registration) => [
          registration._id,
          resolveSemesterRegistrationLabel(registration),
        ]),
      ),
    [semesterRegistrations],
  );

  const subjectLabelById = useMemo(
    () =>
      new Map(subjects.map((subject) => [subject._id, subject.title])),
    [subjects],
  );

  const buildPayload = (values: CurriculumFormValues) => {
    if (!values.academicDepartment) {
      toast.error("Validation Failed", "Please select an academic department.");
      return null;
    }
    if (!values.semisterRegistration) {
      toast.error("Validation Failed", "Please select a semester registration.");
      return null;
    }

    const regulation = parseRegulation(values.regulation);
    if (regulation === null) {
      toast.error("Validation Failed", "Regulation must be a valid positive number.");
      return null;
    }

    const session = values.session.trim();
    if (!isValidSession(session)) {
      toast.error("Validation Failed", 'Session must be in "YYYY-YYYY" format.');
      return null;
    }

    const subjects = [...new Set((values.subjects || []).filter(Boolean))];
    if (!subjects.length) {
      toast.error("Validation Failed", "Please select at least one subject.");
      return null;
    }

    return {
      academicDepartment: values.academicDepartment,
      semisterRegistration: values.semisterRegistration,
      regulation,
      session,
      subjects,
    };
  };

  const buildUpdatePayload = (values: CurriculumFormValues) => {
    const basePayload = buildPayload(values);
    if (!basePayload) return null;

    const selectedRegistration = semesterRegistrations.find(
      (registration) => registration._id === values.semisterRegistration,
    );

    let academicSemesterId = "";
    if (selectedRegistration?.academicSemester) {
      academicSemesterId =
        typeof selectedRegistration.academicSemester === "string"
          ? selectedRegistration.academicSemester
          : selectedRegistration.academicSemester._id;
    }

    return {
      ...basePayload,
      ...(academicSemesterId ? { academicSemester: academicSemesterId } : {}),
    };
  };

  const openCreate = () => {
    createForm.reset(EMPTY_CURRICULUM_FORM);
    setDialogMode("create");
  };

  const openUpdate = (row: Curriculum) => {
    setActiveRow(row);
    updateForm.reset(buildCurriculumFormDefaults(row));
    setDialogMode("update");
  };

  const openDetails = async (row: Curriculum) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);
    try {
      const response = await getCurriculumById(row._id);
      setDetailRow(response.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load details.";
      toast.error("Details Failed", message);
      setDialogMode(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    const payload = buildPayload(values);
    if (!payload) return;

    try {
      const response = await createCurriculum(payload);
      toast.success("Created", response.message);
      createForm.reset(EMPTY_CURRICULUM_FORM);
      setDialogMode(null);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      toast.error("Create Failed", message);
    }
  });

  const handleUpdate = updateForm.handleSubmit(async (values) => {
    if (!activeRow) return;

    const payload = buildUpdatePayload(values);
    if (!payload) return;

    try {
      const response = await updateCurriculum(activeRow._id, payload);
      toast.success("Updated", response.message);
      setDialogMode(null);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      toast.error("Update Failed", message);
    }
  });

  const handleDelete = async (row: Curriculum) => {
    const confirmed = window.confirm("Delete this curriculum? This action cannot be undone.");
    if (!confirmed) return;

    setDeletingId(row._id);
    try {
      const response = await deleteCurriculum(row._id);
      toast.success("Deleted", response.message);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed.";
      toast.error("Delete Failed", message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, meta.totalPage || 1);
  const currentPage = Math.max(1, Math.min(tableState.page, totalPages));

  useEffect(() => {
    if (currentPage === tableState.page) return;
    setTableState((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage, tableState.page]);

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Curriculums"
        subtitle={
          viewOnly
            ? "See all curriculums in a responsive table and open details."
            : "Manage curriculum records with academic department, semester registration, and subject assignments."
        }
        action={
          viewOnly ? undefined : (
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink)"
            >
              <CirclePlus className="h-4 w-4" aria-hidden />
              Create Curriculum
            </button>
          )
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <CurriculumFilters
          searchTerm={tableState.searchTerm}
          sort={tableState.sort as CurriculumSort}
          limit={tableState.limit}
          rowsPerPage={CURRICULUM_ROWS_PER_PAGE}
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

        <CurriculumTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          deletingId={deletingId}
          departmentNameById={departmentNameById}
          semesterLabelById={semesterLabelById}
          onDetails={openDetails}
          onUpdate={openUpdate}
          onDelete={handleDelete}
          onPrevPage={() =>
            setTableState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
          }
          onNextPage={() =>
            setTableState((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
          }
          viewOnly={viewOnly}
        />
      </section>

      {!viewOnly ? (
        <ModalFrame
          open={dialogMode === "create"}
          title="Create Curriculum"
          description="Select department, semester registration, session, regulation, and subjects."
          onClose={() => setDialogMode(null)}
        >
          <CurriculumForm
            mode="create"
            form={createForm}
            onSubmit={handleCreate}
            onCancel={() => setDialogMode(null)}
            submitLabel="Create"
            submittingLabel="Creating..."
            departments={departments}
            semesterRegistrations={semesterRegistrations}
            subjects={subjects}
            optionsLoading={optionsLoading}
          />
        </ModalFrame>
      ) : null}

      {!viewOnly ? (
        <ModalFrame
          open={dialogMode === "update"}
          title="Update Curriculum"
          description="Update curriculum metadata and subjects."
          onClose={() => setDialogMode(null)}
        >
          <CurriculumForm
            mode="update"
            form={updateForm}
            onSubmit={handleUpdate}
            onCancel={() => setDialogMode(null)}
            submitLabel="Update"
            submittingLabel="Updating..."
            departments={departments}
            semesterRegistrations={semesterRegistrations}
            subjects={subjects}
            optionsLoading={optionsLoading}
          />
        </ModalFrame>
      ) : null}

      <ModalFrame
        open={dialogMode === "details"}
        title="Curriculum Details"
        description="Single curriculum details with mapped relations and subjects."
        onClose={() => setDialogMode(null)}
      >
        <CurriculumDetailsContent
          detailLoading={detailLoading}
          detailRow={detailRow}
          departmentNameById={departmentNameById}
          semesterLabelById={semesterLabelById}
          semesterRegistrationLabelById={semesterRegistrationLabelById}
          subjectLabelById={subjectLabelById}
        />
      </ModalFrame>
    </section>
  );
}
