"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import {
  createAcademicDepartment,
  getAcademicDepartmentById,
  getAcademicDepartments,
  updateAcademicDepartment,
} from "@/lib/api/academic-department";
import { getAcademicInstructors } from "@/lib/api/academic-instructor";
import type { AcademicDepartment } from "@/lib/api/types";
import {
  ACADEMIC_DEPARTMENT_DEFAULT_TABLE_STATE,
  ACADEMIC_DEPARTMENT_ROWS_PER_PAGE,
  resolveAcademicDepartmentInstructorId,
  resolveAcademicDepartmentInstructorName,
} from "@/lib/utils/academic-department/academic-department-utils";
import {
  applySearch,
  applyStartsWithFilter,
  buildBackendQuery,
  isSameTableState,
  parseTableState,
  paginateRows,
  sortRows,
  tableStateToQuery,
  type TableQueryState,
} from "@/lib/utils/table/table-utils";
import type {
  AcademicDepartmentDialogMode,
  AcademicDepartmentFormValues,
} from "@/lib/types/pages/academic.types";
import { useToastManager } from "@/lib/use-toast-manager";
import { AcademicDepartmentDetailsContent } from "@/components/dashboard/admin/academic-department/academic-department-details-content";
import { AcademicDepartmentFilters } from "@/components/dashboard/admin/academic-department/academic-department-filters";
import { AcademicDepartmentForm } from "@/components/dashboard/admin/academic-department/academic-department-form";
import { AcademicDepartmentTable } from "@/components/dashboard/admin/academic-department/academic-department-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { ToastRegion } from "@/components/ui/toast-region";
import { PageHeader } from "@/components/ui/page-header";

export function AcademicDepartmentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [tableState, setTableState] = useState<TableQueryState>(() =>
    parseTableState(searchParams, ACADEMIC_DEPARTMENT_DEFAULT_TABLE_STATE),
  );
  const [dialogMode, setDialogMode] =
    useState<AcademicDepartmentDialogMode>(null);
  const [activeRow, setActiveRow] = useState<AcademicDepartment | null>(null);
  const [detailRow, setDetailRow] = useState<AcademicDepartment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<AcademicDepartmentFormValues>({
    defaultValues: { name: "", academicInstructor: "" },
  });
  const updateForm = useForm<AcademicDepartmentFormValues>({
    defaultValues: { name: "", academicInstructor: "" },
  });

  // Sync tableState from URL
  useEffect(() => {
    const nextState = parseTableState(
      searchParams,
      ACADEMIC_DEPARTMENT_DEFAULT_TABLE_STATE,
    );
    setTableState((prev) =>
      isSameTableState(prev, nextState) ? prev : nextState,
    );
  }, [searchParams]);

  // Sync URL from tableState
  useEffect(() => {
    const nextQuery = tableStateToQuery(
      tableState,
      ACADEMIC_DEPARTMENT_DEFAULT_TABLE_STATE,
    ).toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router, searchParams, tableState]);

  // Data query
  const departmentsQuery = useQuery({
    queryKey: ["academic-departments", tableState],
    queryFn: () => getAcademicDepartments(buildBackendQuery(tableState)),
  });

  const rows: AcademicDepartment[] = Array.isArray(departmentsQuery.data?.data)
    ? (departmentsQuery.data.data as AcademicDepartment[])
    : [];
  const loading = departmentsQuery.isLoading || departmentsQuery.isFetching;

  // Instructors dropdown
  const instructorsQuery = useQuery({
    queryKey: ["academic-instructors-dropdown"],
    queryFn: () => getAcademicInstructors(),
    staleTime: 5 * 60 * 1000,
  });

  const instructors = instructorsQuery.data?.data ?? [];
  const instructorsLoading = instructorsQuery.isLoading;

  // Client-side filter/sort/paginate
  const processedRows = useMemo(() => {
    const searched = applySearch(
      rows,
      tableState.searchTerm,
      (row) => `${row.name} ${resolveAcademicDepartmentInstructorName(row)}`,
    );
    const filtered = applyStartsWithFilter(
      searched,
      tableState.startsWith,
      (row) => row.name,
    );
    return sortRows(
      filtered,
      tableState.sort === "-name" ? "desc" : "asc",
      (row) => row.name,
    );
  }, [rows, tableState.searchTerm, tableState.startsWith, tableState.sort]);

  const pagination = useMemo(
    () =>
      paginateRows(processedRows, {
        page: tableState.page,
        limit: tableState.limit,
      }),
    [processedRows, tableState.page, tableState.limit],
  );

  useEffect(() => {
    if (pagination.page !== tableState.page) {
      setTableState((prev) => ({ ...prev, page: pagination.page }));
    }
  }, [pagination.page, tableState.page]);

  const openCreate = () => {
    createForm.reset({ name: "", academicInstructor: "" });
    setDialogMode("create");
  };

  const openUpdate = (row: AcademicDepartment) => {
    setActiveRow(row);
    updateForm.reset({
      name: row.name,
      academicInstructor: resolveAcademicDepartmentInstructorId(row),
    });
    setDialogMode("update");
  };

  const openDetails = async (row: AcademicDepartment) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);
    try {
      const response = await getAcademicDepartmentById(row._id);
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
    try {
      const response = await createAcademicDepartment({
        name: values.name.trim(),
        academicInstructor: values.academicInstructor,
      });
      toast.success("Created", response.message);
      setDialogMode(null);
      createForm.reset({ name: "", academicInstructor: "" });
      await queryClient.invalidateQueries({
        queryKey: ["academic-departments"],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      toast.error("Create Failed", message);
    }
  });

  const handleUpdate = updateForm.handleSubmit(async (values) => {
    if (!activeRow) return;
    try {
      const response = await updateAcademicDepartment(activeRow._id, {
        name: values.name.trim(),
        academicInstructor: values.academicInstructor,
      });
      toast.success("Updated", response.message);
      setDialogMode(null);
      await queryClient.invalidateQueries({
        queryKey: ["academic-departments"],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      toast.error("Update Failed", message);
    }
  });

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Academic Department"
        subtitle="Manage Academic Departments"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110"
          >
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create
          </button>
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <AcademicDepartmentFilters
          tableState={tableState}
          rowsPerPage={ACADEMIC_DEPARTMENT_ROWS_PER_PAGE}
          onSearchChange={(value) =>
            setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }))
          }
          onStartsWithChange={(value) =>
            setTableState((prev) => ({ ...prev, startsWith: value, page: 1 }))
          }
          onSortChange={(value) =>
            setTableState((prev) => ({ ...prev, sort: value, page: 1 }))
          }
          onLimitChange={(value) =>
            setTableState((prev) => ({ ...prev, limit: value, page: 1 }))
          }
        />

        <AcademicDepartmentTable
          loading={loading}
          pagination={pagination}
          onDetails={openDetails}
          onUpdate={openUpdate}
          onPrevPage={() =>
            setTableState((prev) => ({
              ...prev,
              page: Math.max(1, prev.page - 1),
            }))
          }
          onNextPage={() =>
            setTableState((prev) => ({
              ...prev,
              page: Math.min(pagination.totalPages, prev.page + 1),
            }))
          }
        />
      </section>

      <ModalFrame
        open={dialogMode === "create"}
        title="Create Academic Department"
        description="Provide department information and select an academic instructor."
        onClose={() => setDialogMode(null)}
      >
        <AcademicDepartmentForm
          form={createForm}
          onSubmit={handleCreate}
          onCancel={() => setDialogMode(null)}
          idPrefix="create"
          submitLabel="Create"
          submittingLabel="Creating..."
          instructors={instructors}
          instructorsLoading={instructorsLoading}
        />
      </ModalFrame>

      <ModalFrame
        open={dialogMode === "update"}
        title="Update Academic Department"
        description="Edit department information and save changes."
        onClose={() => setDialogMode(null)}
      >
        <AcademicDepartmentForm
          form={updateForm}
          onSubmit={handleUpdate}
          onCancel={() => setDialogMode(null)}
          idPrefix="update"
          submitLabel="Update"
          submittingLabel="Updating..."
          instructors={instructors}
          instructorsLoading={instructorsLoading}
        />
      </ModalFrame>

      <ModalFrame
        open={dialogMode === "details"}
        title="Academic Department Details"
        description="Single academic department detail view."
        onClose={() => setDialogMode(null)}
      >
        <AcademicDepartmentDetailsContent
          detailLoading={detailLoading}
          detailRow={detailRow}
        />
      </ModalFrame>
    </section>
  );
}
