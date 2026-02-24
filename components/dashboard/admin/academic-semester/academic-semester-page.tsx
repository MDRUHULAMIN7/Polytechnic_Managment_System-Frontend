"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import {
  createAcademicSemester,
  getAcademicSemesterById,
  getAcademicSemesters,
  updateAcademicSemester,
} from "@/lib/api/academic-semester";
import type { AcademicSemester } from "@/lib/api/types";
import {
  ACADEMIC_SEMESTER_EMPTY_FORM,
  ACADEMIC_SEMESTER_NAME_CODE,
  ACADEMIC_SEMESTER_ROW_SIZES,
  isAcademicSemesterMonth,
  isAcademicSemesterName,
} from "@/lib/utils/academic-semester/academic-semester-utils";
import type {
  AcademicSemesterDialogMode,
  AcademicSemesterFormValues,
} from "@/lib/types/pages/academic.types";
import { readSessionRole } from "@/lib/session";
import { useToastManager } from "@/lib/use-toast-manager";
import { AcademicSemesterDetailsContent } from "@/components/dashboard/admin/academic-semester/academic-semester-details-content";
import { AcademicSemesterFilters } from "@/components/dashboard/admin/academic-semester/academic-semester-filters";
import { AcademicSemesterForm } from "@/components/dashboard/admin/academic-semester/academic-semester-form";
import { AcademicSemesterTable } from "@/components/dashboard/admin/academic-semester/academic-semester-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";

type AcademicSemesterPageProps = {
  viewOnly?: boolean;
  viewRole?: "instructor" | "student";
};

export function AcademicSemesterPage({
  viewOnly = false,
  viewRole = "instructor",
}: AcademicSemesterPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [mode, setMode] = useState<AcademicSemesterDialogMode>(null);
  const [activeRow, setActiveRow] = useState<AcademicSemester | null>(null);
  const [detailRow, setDetailRow] = useState<AcademicSemester | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<AcademicSemesterFormValues>({ defaultValues: ACADEMIC_SEMESTER_EMPTY_FORM });
  const updateForm = useForm<AcademicSemesterFormValues>({ defaultValues: ACADEMIC_SEMESTER_EMPTY_FORM });

  const createName = createForm.watch("name");
  const updateName = updateForm.watch("name");
  const createCode = isAcademicSemesterName(createName) ? ACADEMIC_SEMESTER_NAME_CODE[createName] : "";
  const updateCode = isAcademicSemesterName(updateName) ? ACADEMIC_SEMESTER_NAME_CODE[updateName] : "";

  // Data query — fetch all, filter client-side (no pagination params sent to server)
  const semestersQuery = useQuery({
    queryKey: ["academic-semesters"],
    queryFn: () => getAcademicSemesters(),
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rows: AcademicSemester[] = Array.isArray(semestersQuery.data?.data)
    ? (semestersQuery.data.data as AcademicSemester[])
    : [];
  const loading = semestersQuery.isLoading || semestersQuery.isFetching;

  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      `${row.name} ${row.code} ${row.year} ${row.startMonth} ${row.endMonth}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [rows, search]);

  const pagination = useMemo(() => {
    const total = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: filteredRows.slice(start, start + limit),
      total,
      page: safePage,
      totalPages,
    };
  }, [filteredRows, limit, page]);

  useEffect(() => {
    if (page !== pagination.page) setPage(pagination.page);
  }, [page, pagination.page]);

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

  const openCreate = () => {
    createForm.reset(ACADEMIC_SEMESTER_EMPTY_FORM);
    setMode("create");
  };

  const openUpdate = (row: AcademicSemester) => {
    setActiveRow(row);
    updateForm.reset({ name: row.name, year: row.year, startMonth: row.startMonth, endMonth: row.endMonth });
    setMode("update");
  };

  const openDetails = async (row: AcademicSemester) => {
    setMode("details");
    setDetailRow(null);
    setDetailLoading(true);
    try {
      const response = await getAcademicSemesterById(row._id);
      setDetailRow(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load details.";
      toast.error("Details Failed", message);
      setMode(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitCreate = createForm.handleSubmit(async (values) => {
    if (!isAcademicSemesterName(values.name) || !isAcademicSemesterMonth(values.startMonth) || !isAcademicSemesterMonth(values.endMonth)) return;
    try {
      const response = await createAcademicSemester({
        name: values.name,
        code: ACADEMIC_SEMESTER_NAME_CODE[values.name],
        year: values.year.trim(),
        startMonth: values.startMonth,
        endMonth: values.endMonth,
      });
      toast.success("Created", response.message);
      setMode(null);
      await queryClient.invalidateQueries({ queryKey: ["academic-semesters"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      toast.error("Create Failed", message);
    }
  });

  const submitUpdate = updateForm.handleSubmit(async (values) => {
    if (!activeRow) return;
    if (!isAcademicSemesterName(values.name) || !isAcademicSemesterMonth(values.startMonth) || !isAcademicSemesterMonth(values.endMonth)) return;
    try {
      const response = await updateAcademicSemester(activeRow._id, {
        name: values.name,
        code: ACADEMIC_SEMESTER_NAME_CODE[values.name],
        year: values.year.trim(),
        startMonth: values.startMonth,
        endMonth: values.endMonth,
      });
      toast.success("Updated", response.message);
      setMode(null);
      await queryClient.invalidateQueries({ queryKey: ["academic-semesters"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      toast.error("Update Failed", message);
    }
  });

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Academic Semester"
        subtitle={
          viewOnly
            ? "See all academic semesters in a responsive table and open details."
            : "See all, create, update, and view details of academic semesters."
        }
        action={
          viewOnly ? undefined : (
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink)"
            >
              <CirclePlus className="h-4 w-4" aria-hidden />
              Create
            </button>
          )
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <AcademicSemesterFilters
          search={search}
          limit={limit}
          rowsPerPage={ACADEMIC_SEMESTER_ROW_SIZES}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          onLimitChange={(value) => { setLimit(value); setPage(1); }}
        />

        <AcademicSemesterTable
          loading={loading}
          pagination={pagination}
          onDetails={openDetails}
          onUpdate={openUpdate}
          onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
          viewOnly={viewOnly}
        />
      </section>

      {!viewOnly ? (
        <ModalFrame open={mode === "create"} title="Create Academic Semester" description="Provide semester information." onClose={() => setMode(null)}>
          <AcademicSemesterForm form={createForm} code={createCode} onSubmit={submitCreate} onCancel={() => setMode(null)} submitLabel="Create" submittingLabel="Creating..." />
        </ModalFrame>
      ) : null}

      {!viewOnly ? (
        <ModalFrame open={mode === "update"} title="Update Academic Semester" description="Edit semester information and save." onClose={() => setMode(null)}>
          <AcademicSemesterForm form={updateForm} code={updateCode} onSubmit={submitUpdate} onCancel={() => setMode(null)} submitLabel="Update" submittingLabel="Updating..." />
        </ModalFrame>
      ) : null}

      <ModalFrame open={mode === "details"} title="Academic Semester Details" description="Single semester detail view." onClose={() => setMode(null)}>
        <AcademicSemesterDetailsContent detailLoading={detailLoading} detailRow={detailRow} />
      </ModalFrame>
    </section>
  );
}
