"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { CirclePlus } from "lucide-react";
import {
  createSemesterRegistration,
  deleteSemesterRegistration,
  getAcademicSemesterOptions,
  getSemesterRegistrationById,
  getSemesterRegistrations,
  updateSemesterRegistration,
} from "@/lib/api/semester-registration";
import type { AcademicSemester, SemesterRegistration } from "@/lib/api/types";
import {
  isSameServerListState,
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import { readSessionRole } from "@/lib/session";
import type {
  SemesterRegistrationDialogMode,
  SemesterRegistrationFormValues,
  SemesterRegistrationSort,
} from "@/lib/types/pages/semester-registration/semester-registration.types";
import { useToastManager } from "@/lib/use-toast-manager";
import {
  buildSemesterRegistrationFormDefaults,
  EMPTY_SEMESTER_REGISTRATION_FORM,
  isSemesterRegistrationShift,
  isSemesterRegistrationStatus,
  parseTotalCredit,
  SEMESTER_REGISTRATION_DEFAULT_META,
  SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE,
  SEMESTER_REGISTRATION_ROWS_PER_PAGE,
  SEMESTER_REGISTRATION_SORT_OPTIONS,
  SEMESTER_REGISTRATION_TABLE_FIELDS,
  toIsoDateTime,
} from "@/lib/utils/semester-registration/semester-registration-utils";
import { SemesterRegistrationDetailsContent } from "@/components/dashboard/admin/semester-registration/semester-registration-details-content";
import { SemesterRegistrationFilters } from "@/components/dashboard/admin/semester-registration/semester-registration-filters";
import { SemesterRegistrationForm } from "@/components/dashboard/admin/semester-registration/semester-registration-form";
import { SemesterRegistrationTable } from "@/components/dashboard/admin/semester-registration/semester-registration-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";

type SemesterRegistrationPageProps = {
  viewOnly?: boolean;
  viewRole?: "instructor" | "student";
};

export function SemesterRegistrationPage({
  viewOnly = false,
  viewRole = "instructor",
}: SemesterRegistrationPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SemesterRegistration[]>([]);
  const [meta, setMeta] = useState(SEMESTER_REGISTRATION_DEFAULT_META);
  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(
      searchParams,
      SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE,
      SEMESTER_REGISTRATION_SORT_OPTIONS,
    ),
  );
  const [dialogMode, setDialogMode] =
    useState<SemesterRegistrationDialogMode>(null);
  const [activeRow, setActiveRow] = useState<SemesterRegistration | null>(null);
  const [detailRow, setDetailRow] = useState<SemesterRegistration | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [semesterOptions, setSemesterOptions] = useState<AcademicSemester[]>([]);
  const [semesterOptionsLoading, setSemesterOptionsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<SemesterRegistrationFormValues>({
    defaultValues: EMPTY_SEMESTER_REGISTRATION_FORM,
  });
  const updateForm = useForm<SemesterRegistrationFormValues>({
    defaultValues: EMPTY_SEMESTER_REGISTRATION_FORM,
  });

  const fetchRows = useCallback(
    async (requestState: ServerListState) => {
      setLoading(true);
      try {
        const query = toApiQuery(
          requestState,
          SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE,
          SEMESTER_REGISTRATION_TABLE_FIELDS,
        );
        const response = await getSemesterRegistrations(query);
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
          error instanceof Error
            ? error.message
            : "Failed to load semester registrations.";
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

  const fetchSemesterOptions = useCallback(async () => {
    try {
      setSemesterOptionsLoading(true);
      const response = await getAcademicSemesterOptions();
      setSemesterOptions(response.data ?? []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load academic semester options.";
      setSemesterOptions([]);
      toast.error("Semester Load Failed", message);
    } finally {
      setSemesterOptionsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const nextState = parseServerListState(
      searchParams,
      SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE,
      SEMESTER_REGISTRATION_SORT_OPTIONS,
    );
    setTableState((prev) =>
      isSameServerListState(prev, nextState) ? prev : nextState,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextQuery = toRouteQuery(
      tableState,
      SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE,
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
    if (viewOnly) return;
    void fetchSemesterOptions();
  }, [fetchSemesterOptions, viewOnly]);

  const buildPayload = (values: SemesterRegistrationFormValues) => {
    if (!values.academicSemester) {
      toast.error("Validation Failed", "Please select an academic semester.");
      return null;
    }

    if (!isSemesterRegistrationStatus(values.status)) {
      toast.error("Validation Failed", "Please select a valid status.");
      return null;
    }

    if (!isSemesterRegistrationShift(values.shift)) {
      toast.error("Validation Failed", "Please select a valid shift.");
      return null;
    }

    const totalCredit = parseTotalCredit(values.totalCredit);
    if (totalCredit === null) {
      toast.error(
        "Validation Failed",
        "Total credit must be a valid positive number.",
      );
      return null;
    }

    const startTime = Date.parse(values.startDate);
    const endTime = Date.parse(values.endDate);

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      toast.error("Validation Failed", "Start and end date must be valid.");
      return null;
    }

    if (endTime <= startTime) {
      toast.error(
        "Validation Failed",
        "End date must be later than start date.",
      );
      return null;
    }

    return {
      academicSemester: values.academicSemester,
      status: values.status,
      shift: values.shift,
      startDate: toIsoDateTime(values.startDate),
      endDate: toIsoDateTime(values.endDate),
      totalCredit,
    };
  };

  const openCreate = () => {
    createForm.reset(EMPTY_SEMESTER_REGISTRATION_FORM);
    setDialogMode("create");
  };

  const openUpdate = (row: SemesterRegistration) => {
    setActiveRow(row);
    updateForm.reset(buildSemesterRegistrationFormDefaults(row));
    setDialogMode("update");
  };

  const openDetails = async (row: SemesterRegistration) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);

    try {
      const response = await getSemesterRegistrationById(row._id);
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
      const response = await createSemesterRegistration(payload);
      toast.success("Created", response.message);
      createForm.reset(EMPTY_SEMESTER_REGISTRATION_FORM);
      setDialogMode(null);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      toast.error("Create Failed", message);
    }
  });

  const handleUpdate = updateForm.handleSubmit(async (values) => {
    if (!activeRow) return;

    const payload = buildPayload(values);
    if (!payload) return;

    try {
      const response = await updateSemesterRegistration(activeRow._id, payload);
      toast.success("Updated", response.message);
      setDialogMode(null);
      await fetchRows(tableState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      toast.error("Update Failed", message);
    }
  });

  const handleDelete = async (row: SemesterRegistration) => {
    const confirmed = window.confirm(
      "Delete this semester registration? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(row._id);
    try {
      const response = await deleteSemesterRegistration(row._id);
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
        title="Semester Registration"
        subtitle={
          viewOnly
            ? "See all semester registrations in a responsive table and open details."
            : "See all registrations in a responsive table, open details, create, update, and delete."
        }
        action={
          viewOnly ? undefined : (
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink)"
            >
              <CirclePlus className="h-4 w-4" aria-hidden />
              Create Registration
            </button>
          )
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <SemesterRegistrationFilters
          sort={tableState.sort as SemesterRegistrationSort}
          limit={tableState.limit}
          rowsPerPage={SEMESTER_REGISTRATION_ROWS_PER_PAGE}
          onSortChange={(value) =>
            setTableState((prev) => ({ ...prev, sort: value, page: 1 }))
          }
          onLimitChange={(value) =>
            setTableState((prev) => ({ ...prev, limit: value, page: 1 }))
          }
        />

        <SemesterRegistrationTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          deletingId={deletingId}
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
          title="Create Semester Registration"
          description="Select academic semester, status, shift, timeline, and total credit."
          onClose={() => setDialogMode(null)}
        >
          <SemesterRegistrationForm
            form={createForm}
            onSubmit={handleCreate}
            onCancel={() => setDialogMode(null)}
            submitLabel="Create"
            submittingLabel="Creating..."
            semesters={semesterOptions}
            semestersLoading={semesterOptionsLoading}
          />
        </ModalFrame>
      ) : null}

      {!viewOnly ? (
        <ModalFrame
          open={dialogMode === "update"}
          title="Update Semester Registration"
          description="Update registration information and save."
          onClose={() => setDialogMode(null)}
        >
          <SemesterRegistrationForm
            form={updateForm}
            onSubmit={handleUpdate}
            onCancel={() => setDialogMode(null)}
            submitLabel="Update"
            submittingLabel="Updating..."
            semesters={semesterOptions}
            semestersLoading={semesterOptionsLoading}
          />
        </ModalFrame>
      ) : null}

      <ModalFrame
        open={dialogMode === "details"}
        title="Semester Registration Details"
        description="Single semester registration detail view."
        onClose={() => setDialogMode(null)}
      >
        <SemesterRegistrationDetailsContent
          detailLoading={detailLoading}
          detailRow={detailRow}
        />
      </ModalFrame>
    </section>
  );
}
