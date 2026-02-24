"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { CirclePlus } from "lucide-react";
import {
  createOfferedSubject,
  deleteOfferedSubject,
  getOfferedSubjectById,
  getMyOfferedSubjects,
  getOfferedSubjects,
  updateOfferedSubject,
} from "@/lib/api/offered-subject";
import { getAcademicDepartments } from "@/lib/api/academic-department";
import { getAcademicInstructors } from "@/lib/api/academic-instructor";
import { getInstructors } from "@/lib/api/instructor";
import { getSemesterRegistrations } from "@/lib/api/semester-registration";
import { getSubjects } from "@/lib/api/subject";
import type { OfferedSubject } from "@/lib/api/types";
import {
  isSameServerListState,
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import { readSessionRole } from "@/lib/session";
import type {
  OfferedSubjectDialogMode,
  OfferedSubjectFormValues,
  OfferedSubjectSort,
  OfferedSubjectCreatePayload,
  OfferedSubjectUpdatePayload,
  OfferedSubjectInstructorOption,
  OfferedSubjectSubjectOption,
  OfferedSubjectAcademicDepartmentOption,
  OfferedSubjectAcademicInstructorOption,
  OfferedSubjectSemesterRegistrationOption,
} from "@/lib/types/pages/offered-subject/offered-subject.types";
import { useToastManager } from "@/lib/use-toast-manager";
import {
  buildOfferedSubjectFormDefaults,
  EMPTY_OFFERED_SUBJECT_FORM,
  isOfferedSubjectDay,
  OFFERED_SUBJECT_DEFAULT_META,
  OFFERED_SUBJECT_DEFAULT_TABLE_STATE,
  OFFERED_SUBJECT_ROWS_PER_PAGE,
  OFFERED_SUBJECT_SORT_OPTIONS,
  OFFERED_SUBJECT_TABLE_FIELDS,
  parsePositiveInteger,
  resolveAcademicSemesterName,
  resolveAcademicDepartmentLabel,
  resolveInstructorLabel,
  resolveInstructorOptionLabel,
  resolveSubjectTitle,
} from "@/lib/utils/offered-subject/offered-subject-utils";
import { OfferedSubjectDetailsContent } from "@/components/dashboard/admin/offered-subject/offered-subject-details-content";
import { OfferedSubjectFilters } from "@/components/dashboard/admin/offered-subject/offered-subject-filters";
import { OfferedSubjectForm } from "@/components/dashboard/admin/offered-subject/offered-subject-form";
import { OfferedSubjectTable } from "@/components/dashboard/admin/offered-subject/offered-subject-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";

function toMinutes(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function isValidClassSchedule(startTime: string, endTime: string) {
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (startMinutes === null || endMinutes === null) return false;

  const duration = endMinutes - startMinutes;
  const collegeStart = 8 * 60 + 30;
  const collegeEnd = 18 * 60 + 45;

  return (
    startMinutes >= collegeStart &&
    endMinutes <= collegeEnd &&
    endMinutes > startMinutes &&
    duration >= 45 &&
    duration <= 135
  );
}

function normalizeDays(values: string[]) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const parsed = values.filter(isOfferedSubjectDay);
  if (parsed.length !== values.length || parsed.length === 0) return null;
  return [...new Set(parsed)];
}

type OfferedSubjectPageProps = {
  viewOnly?: boolean;
  viewRole?: "instructor" | "student";
};

export function OfferedSubjectPage({
  viewOnly = false,
  viewRole = "instructor",
}: OfferedSubjectPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OfferedSubject[]>([]);
  const [meta, setMeta] = useState(OFFERED_SUBJECT_DEFAULT_META);
  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(
      searchParams,
      OFFERED_SUBJECT_DEFAULT_TABLE_STATE,
      OFFERED_SUBJECT_SORT_OPTIONS,
    ),
  );
  const [dialogMode, setDialogMode] = useState<OfferedSubjectDialogMode>(null);
  const [activeRow, setActiveRow] = useState<OfferedSubject | null>(null);
  const [detailRow, setDetailRow] = useState<OfferedSubject | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<OfferedSubjectSubjectOption[]>([]);
  const [instructors, setInstructors] = useState<OfferedSubjectInstructorOption[]>([]);
  const [academicDepartments, setAcademicDepartments] = useState<
    OfferedSubjectAcademicDepartmentOption[]
  >([]);
  const [academicInstructors, setAcademicInstructors] = useState<
    OfferedSubjectAcademicInstructorOption[]
  >([]);
  const [semesterRegistrations, setSemesterRegistrations] = useState<
    OfferedSubjectSemesterRegistrationOption[]
  >([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<OfferedSubjectFormValues>({
    defaultValues: EMPTY_OFFERED_SUBJECT_FORM,
  });
  const updateForm = useForm<OfferedSubjectFormValues>({
    defaultValues: EMPTY_OFFERED_SUBJECT_FORM,
  });

  const fetchRows = useCallback(
    async (requestState: ServerListState) => {
      setLoading(true);
      try {
        const query = toApiQuery(
          requestState,
          OFFERED_SUBJECT_DEFAULT_TABLE_STATE,
          OFFERED_SUBJECT_TABLE_FIELDS,
        );
        if (viewOnly && viewRole === "student") {
          const response = await getMyOfferedSubjects(query);
          const nextRows = response.data ?? [];
          const nextMeta = response.meta ?? {
            page: requestState.page,
            limit: requestState.limit,
            total: nextRows.length,
            totalPage: Math.max(
              1,
              Math.ceil(nextRows.length / requestState.limit),
            ),
          };

          setRows(nextRows);
          setMeta(nextMeta);
          return;
        }

        const response = await getOfferedSubjects(query);
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
          error instanceof Error ? error.message : "Failed to load offered subjects.";
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
    [toast, viewOnly, viewRole],
  );

  const fetchOptions = useCallback(
    async () => {
      setOptionsLoading(true);
      const subjectQuery = new URLSearchParams({
        page: "1",
        limit: "1000",
        sort: "title",
        fields: "_id,title,prefix,code",
      });
      const instructorQuery = new URLSearchParams({
        page: "1",
        limit: "1000",
        sort: "name",
        fields: "_id,id,name,designation",
      });
      const semesterRegistrationQuery = new URLSearchParams({
        page: "1",
        limit: "1000",
        sort: "-createdAt",
        fields: "academicSemester,shift,status,startDate,endDate",
      });

      if (viewOnly) {
        const [subjectsResponse, instructorsResponse, academicDepartmentsResponse] =
          await Promise.allSettled([
            getSubjects<OfferedSubjectSubjectOption>(subjectQuery),
            getInstructors<OfferedSubjectInstructorOption>(instructorQuery),
            getAcademicDepartments(),
          ]);

        setSubjects(
          subjectsResponse.status === "fulfilled"
            ? subjectsResponse.value.data?.result ?? []
            : [],
        );
        setInstructors(
          instructorsResponse.status === "fulfilled"
            ? instructorsResponse.value.data?.result ?? []
            : [],
        );
        setAcademicDepartments(
          academicDepartmentsResponse.status === "fulfilled"
            ? academicDepartmentsResponse.value.data ?? []
            : [],
        );
        setAcademicInstructors([]);
        setSemesterRegistrations([]);
        setOptionsLoading(false);
        return;
      }

      try {
        const [
          subjectsResponse,
          instructorsResponse,
          academicDepartmentsResponse,
          academicInstructorsResponse,
          semesterRegistrationsResponse,
        ] = await Promise.all([
          getSubjects<OfferedSubjectSubjectOption>(subjectQuery),
          getInstructors<OfferedSubjectInstructorOption>(instructorQuery),
          getAcademicDepartments(),
          getAcademicInstructors(),
          getSemesterRegistrations(semesterRegistrationQuery),
        ]);

        setSubjects(subjectsResponse.data?.result ?? []);
        setInstructors(instructorsResponse.data?.result ?? []);
        setAcademicDepartments(academicDepartmentsResponse.data ?? []);
        setAcademicInstructors(academicInstructorsResponse.data ?? []);
        setSemesterRegistrations(
          (semesterRegistrationsResponse.data?.result ?? []).filter(
            (item) => item.status !== "ENDED",
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load dropdown options.";
        setSubjects([]);
        setInstructors([]);
        setAcademicDepartments([]);
        setAcademicInstructors([]);
        setSemesterRegistrations([]);
        toast.error("Options Load Failed", message);
      } finally {
        setOptionsLoading(false);
      }
    },
    [toast, viewOnly],
  );

  useEffect(() => {
    const nextState = parseServerListState(
      searchParams,
      OFFERED_SUBJECT_DEFAULT_TABLE_STATE,
      OFFERED_SUBJECT_SORT_OPTIONS,
    );
    setTableState((prev) =>
      isSameServerListState(prev, nextState) ? prev : nextState,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextQuery = toRouteQuery(
      tableState,
      OFFERED_SUBJECT_DEFAULT_TABLE_STATE,
    ).toString();
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

  const subjectLabelById = useMemo(
    () => new Map(subjects.map((item) => [item._id, item.title])),
    [subjects],
  );
  const instructorLabelById = useMemo(
    () => new Map(instructors.map((item) => [item._id, resolveInstructorOptionLabel(item)])),
    [instructors],
  );
  const departmentLabelById = useMemo(
    () => new Map(academicDepartments.map((item) => [item._id, item.name])),
    [academicDepartments],
  );
  const resolveRowSubject = useCallback(
    (row: OfferedSubject) => {
      if (typeof row.subject !== "string") return resolveSubjectTitle(row.subject);
      return subjectLabelById.get(row.subject) || row.subject;
    },
    [subjectLabelById],
  );

  const resolveRowInstructor = useCallback(
    (row: OfferedSubject) => {
      if (typeof row.instructor !== "string")
        return resolveInstructorLabel(row.instructor);
      return instructorLabelById.get(row.instructor) || row.instructor;
    },
    [instructorLabelById],
  );

  const resolveRowDepartment = useCallback(
    (row: OfferedSubject) => {
      if (typeof row.academicDepartment !== "string")
        return resolveAcademicDepartmentLabel(row.academicDepartment);
      return departmentLabelById.get(row.academicDepartment) || row.academicDepartment;
    },
    [departmentLabelById],
  );

  const resolveRowSemesterRegistration = useCallback(
    (row: OfferedSubject) => {
      return resolveAcademicSemesterName(row.academicSemester);
    },
    [],
  );

  const openCreate = () => {
    createForm.reset(EMPTY_OFFERED_SUBJECT_FORM);
    setDialogMode("create");
  };

  const openUpdate = (row: OfferedSubject) => {
    setActiveRow(row);
    updateForm.reset(buildOfferedSubjectFormDefaults(row));
    setDialogMode("update");
  };

  const openDetails = async (row: OfferedSubject) => {
    if (viewOnly && viewRole === "student") {
      setDetailRow(row);
      setDetailLoading(false);
      setDialogMode("details");
      return;
    }

    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);

    try {
      const response = await getOfferedSubjectById(row._id);
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

  const createPayloadFromValues = (
    values: OfferedSubjectFormValues,
  ): OfferedSubjectCreatePayload | null => {
    if (
      !values.semesterRegistration ||
      !values.academicInstructor ||
      !values.academicDepartment ||
      !values.subject ||
      !values.instructor
    ) {
      toast.error("Validation Failed", "Please select all required dropdown values.");
      return null;
    }

    const section = parsePositiveInteger(values.section);
    if (section === null) {
      toast.error("Validation Failed", "Section must be a positive number.");
      return null;
    }

    const maxCapacity = parsePositiveInteger(values.maxCapacity);
    if (maxCapacity === null) {
      toast.error("Validation Failed", "Max capacity must be a positive number.");
      return null;
    }

    const days = normalizeDays(values.days);
    if (!days) {
      createForm.setError("days", {
        type: "manual",
        message: "Select at least one valid day.",
      });
      return null;
    }
    createForm.clearErrors("days");

    if (!isValidClassSchedule(values.startTime, values.endTime)) {
      toast.error(
        "Validation Failed",
        "Class time must be between 08:30 and 18:45, duration 45-135 minutes, and start must be before end.",
      );
      return null;
    }

    return {
      semesterRegistration: values.semesterRegistration,
      academicInstructor: values.academicInstructor,
      academicDepartment: values.academicDepartment,
      subject: values.subject,
      instructor: values.instructor,
      section,
      maxCapacity,
      days,
      startTime: values.startTime,
      endTime: values.endTime,
    };
  };

  const updatePayloadFromValues = (
    values: OfferedSubjectFormValues,
  ): OfferedSubjectUpdatePayload | null => {
    if (!values.instructor) {
      toast.error("Validation Failed", "Please select an instructor.");
      return null;
    }

    const maxCapacity = parsePositiveInteger(values.maxCapacity);
    if (maxCapacity === null) {
      toast.error("Validation Failed", "Max capacity must be a positive number.");
      return null;
    }

    const days = normalizeDays(values.days);
    if (!days) {
      updateForm.setError("days", {
        type: "manual",
        message: "Select at least one valid day.",
      });
      return null;
    }
    updateForm.clearErrors("days");

    if (!isValidClassSchedule(values.startTime, values.endTime)) {
      toast.error(
        "Validation Failed",
        "Class time must be between 08:30 and 18:45, duration 45-135 minutes, and start must be before end.",
      );
      return null;
    }

    return {
      instructor: values.instructor,
      maxCapacity,
      days,
      startTime: values.startTime,
      endTime: values.endTime,
    };
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    const payload = createPayloadFromValues(values);
    if (!payload) return;

    try {
      const response = await createOfferedSubject(payload);
      toast.success("Created", response.message);
      createForm.reset(EMPTY_OFFERED_SUBJECT_FORM);
      setDialogMode(null);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      toast.error("Create Failed", message);
    }
  });

  const handleUpdate = updateForm.handleSubmit(async (values) => {
    if (!activeRow) return;
    const payload = updatePayloadFromValues(values);
    if (!payload) return;

    try {
      const response = await updateOfferedSubject(activeRow._id, payload);
      toast.success("Updated", response.message);
      setDialogMode(null);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      toast.error("Update Failed", message);
    }
  });

  const handleDelete = async (row: OfferedSubject) => {
    const confirmed = window.confirm(
      "Delete this offered subject? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(row._id);
    try {
      const response = await deleteOfferedSubject(row._id);
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
        title="Offered Subject"
        subtitle={
          viewOnly
            ? viewRole === "student"
              ? "See your offered subjects in a responsive table and open details."
              : "See all offered subjects in a responsive table and open details."
            : "See all offered subjects in responsive table, view details, create, update, and delete."
        }
        action={
          viewOnly ? undefined : (
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink)"
            >
              <CirclePlus className="h-4 w-4" aria-hidden />
              Create Offered Subject
            </button>
          )
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <OfferedSubjectFilters
          sort={tableState.sort as OfferedSubjectSort}
          limit={tableState.limit}
          rowsPerPage={OFFERED_SUBJECT_ROWS_PER_PAGE}
          onSortChange={(value) =>
            setTableState((prev) => ({ ...prev, sort: value, page: 1 }))
          }
          onLimitChange={(value) =>
            setTableState((prev) => ({ ...prev, limit: value, page: 1 }))
          }
        />

        <OfferedSubjectTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          deletingId={deletingId}
          resolveSubject={resolveRowSubject}
          resolveInstructor={resolveRowInstructor}
          resolveDepartment={resolveRowDepartment}
          resolveSemesterRegistration={resolveRowSemesterRegistration}
          onDetails={openDetails}
          onUpdate={openUpdate}
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
          title="Create Offered Subject"
          description="Select semester registration, subject, instructors, department, days, and schedule."
          onClose={() => setDialogMode(null)}
        >
          <OfferedSubjectForm
            mode="create"
            form={createForm}
            onSubmit={handleCreate}
            onCancel={() => setDialogMode(null)}
            submitLabel="Create"
            submittingLabel="Creating..."
            subjects={subjects}
            instructors={instructors}
            academicDepartments={academicDepartments}
            academicInstructors={academicInstructors}
            semesterRegistrations={semesterRegistrations}
            optionsLoading={optionsLoading}
          />
        </ModalFrame>
      ) : null}

      {!viewOnly ? (
        <ModalFrame
          open={dialogMode === "update"}
          title="Update Offered Subject"
          description="Update instructor, capacity, days, and schedule."
          onClose={() => setDialogMode(null)}
        >
          <OfferedSubjectForm
            mode="update"
            form={updateForm}
            onSubmit={handleUpdate}
            onCancel={() => setDialogMode(null)}
            submitLabel="Update"
            submittingLabel="Updating..."
            subjects={subjects}
            instructors={instructors}
            academicDepartments={academicDepartments}
            academicInstructors={academicInstructors}
            semesterRegistrations={semesterRegistrations}
            optionsLoading={optionsLoading}
          />
        </ModalFrame>
      ) : null}

      <ModalFrame
        open={dialogMode === "details"}
        title="Offered Subject Details"
        description="Single offered subject detail view."
        onClose={() => setDialogMode(null)}
      >
        <OfferedSubjectDetailsContent
          detailLoading={detailLoading}
          detailRow={detailRow}
        />
      </ModalFrame>
    </section>
  );
}

