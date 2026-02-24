"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import { changeUserStatus } from "@/lib/api/user";
import {
  createInstructor,
  getInstructorById,
  getInstructors,
} from "@/lib/api/instructor";
import { getAcademicDepartments } from "@/lib/api/academic-department";
import type {
  AcademicDepartment,
  InstructorProfile,
  UserStatus,
} from "@/lib/api/types";
import {
  isSameServerListState,
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import {
  EMPTY_CREATE_INSTRUCTOR_FORM,
  INSTRUCTOR_DEFAULT_META,
  INSTRUCTOR_DEFAULT_TABLE_STATE,
  INSTRUCTOR_SORT_OPTIONS,
  INSTRUCTOR_TABLE_FIELDS,
  INSTRUCTOR_TABLE_PAGE_SIZES,
  isInstructorBloodGroup,
  isInstructorGender,
  resolveUserId,
  type CreateInstructorFormValues,
  type InstructorTableRow,
} from "@/lib/utils/instructor/instructor-utils";
import { readSessionRole } from "@/lib/session";
import { useToastManager } from "@/lib/use-toast-manager";
import { InstructorCreateForm } from "@/components/dashboard/admin/instructor/instructor-create-form";
import { InstructorDetailsModal } from "@/components/dashboard/admin/instructor/instructor-details-modal";
import { InstructorFilters } from "@/components/dashboard/admin/instructor/instructor-filters";
import { InstructorTable } from "@/components/dashboard/admin/instructor/instructor-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";

type DialogMode = "create" | "details" | null;

export function InstructorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const role = readSessionRole();

  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(searchParams, INSTRUCTOR_DEFAULT_TABLE_STATE, INSTRUCTOR_SORT_OPTIONS),
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [detailRow, setDetailRow] = useState<InstructorProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusPendingKey, setStatusPendingKey] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, UserStatus>>({});
  const { toasts, addToast, dismissToast } = useToastManager();

  const createForm = useForm<CreateInstructorFormValues>({
    defaultValues: EMPTY_CREATE_INSTRUCTOR_FORM,
  });

  // Sync URL
  const nextQuery = toRouteQuery(tableState, INSTRUCTOR_DEFAULT_TABLE_STATE).toString();
  if (typeof window !== "undefined" && nextQuery !== searchParams.toString()) {
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }

  // Main table query
  const instructorsQuery = useQuery({
    queryKey: ["instructors", tableState],
    queryFn: () => {
      const query = toApiQuery(tableState, INSTRUCTOR_DEFAULT_TABLE_STATE, INSTRUCTOR_TABLE_FIELDS);
      return getInstructors<InstructorTableRow>(query);
    },
  });

  const rows = instructorsQuery.data?.data?.result ?? [];
  const meta = instructorsQuery.data?.data?.meta ?? {
    ...INSTRUCTOR_DEFAULT_META,
    total: 0,
    totalPage: 1,
  };
  const loading = instructorsQuery.isLoading || instructorsQuery.isFetching;

  // Departments dropdown
  const departmentsQuery = useQuery({
    queryKey: ["academic-departments-dropdown"],
    queryFn: () => {
      const q = new URLSearchParams({ fields: "_id,name" });
      return getAcademicDepartments(q);
    },
    staleTime: 5 * 60 * 1000,
  });

  const departments: AcademicDepartment[] = Array.isArray(departmentsQuery.data?.data)
    ? (departmentsQuery.data.data as AcademicDepartment[])
    : [];

  const openCreate = () => {
    createForm.reset(EMPTY_CREATE_INSTRUCTOR_FORM);
    setDialogMode("create");
  };

  const openDetails = async (row: InstructorTableRow) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);
    try {
      const response = await getInstructorById(row._id);
      setDetailRow(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load details.";
      addToast("error", "Details Failed", message);
      setDialogMode(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (!isInstructorGender(values.gender)) {
      addToast("error", "Create Failed", "Please select a valid gender.");
      return;
    }
    if (!isInstructorBloodGroup(values.bloogGroup)) {
      addToast("error", "Create Failed", "Please select a valid blood group.");
      return;
    }
    try {
      const response = await createInstructor({
        password: values.password.trim(),
        instructor: {
          designation: values.designation.trim(),
          name: {
            firstName: values.firstName.trim(),
            middleName: values.middleName.trim(),
            lastName: values.lastName.trim(),
          },
          gender: values.gender,
          dateOfBirth: values.dateOfBirth || undefined,
          email: values.email.trim(),
          contactNo: values.contactNo.trim(),
          emergencyContactNo: values.emergencyContactNo.trim(),
          bloogGroup: values.bloogGroup,
          presentAddress: values.presentAddress.trim(),
          permanentAddress: values.permanentAddress.trim(),
          academicDepartment: values.academicDepartment,
          profileImg: undefined,
        },
        file: values.profileFile?.item(0) ?? null,
      });
      addToast("success", "Created", response.message);
      setDialogMode(null);
      createForm.reset(EMPTY_CREATE_INSTRUCTOR_FORM);
      await queryClient.invalidateQueries({ queryKey: ["instructors"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      addToast("error", "Create Failed", message);
    }
  });

  const handleStatusChange = async (row: InstructorTableRow, nextStatus: UserStatus) => {
    if (role !== "superAdmin") {
      addToast("error", "Permission Denied", "Only super admin can change user status.");
      return;
    }
    const userId = resolveUserId(row);
    if (!userId) {
      addToast("error", "Status Failed", "Missing linked user id.");
      return;
    }
    const pendingKey = `${row._id}:${nextStatus}`;
    setStatusPendingKey(pendingKey);
    try {
      const response = await changeUserStatus(userId, { status: nextStatus });
      setStatusOverrides((prev) => ({ ...prev, [row._id]: nextStatus }));
      addToast("success", "Status Updated", response.message);
      await queryClient.invalidateQueries({ queryKey: ["instructors"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status update failed.";
      addToast("error", "Status Failed", message);
    } finally {
      setStatusPendingKey(null);
    }
  };

  const totalPages = Math.max(1, meta.totalPage || 1);
  const currentPage = Math.max(1, Math.min(tableState.page, totalPages));

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Instructors"
        subtitle="See all instructors, change user status from table view, open details, and create a new instructor."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110"
          >
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create Instructor
          </button>
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <InstructorFilters
          tableState={tableState}
          rowsPerPage={INSTRUCTOR_TABLE_PAGE_SIZES}
          onSearchChange={(value) => setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }))}
          onSortChange={(value) => setTableState((prev) => ({ ...prev, sort: value, page: 1 }))}
          onLimitChange={(value) => setTableState((prev) => ({ ...prev, limit: value, page: 1 }))}
        />

        <InstructorTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          statusPendingKey={statusPendingKey}
          statusOverrides={statusOverrides}
          onDetails={openDetails}
          onStatusChange={handleStatusChange}
          onPrevPage={() => setTableState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          onNextPage={() => setTableState((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
        />
      </section>

      <ModalFrame open={dialogMode === "create"} title="Create Instructor" description="Create instructor and assign an academic department." onClose={() => setDialogMode(null)}>
        <InstructorCreateForm
          form={createForm}
          departments={departments}
          departmentsLoading={departmentsQuery.isLoading}
          onSubmit={handleCreate}
          onCancel={() => setDialogMode(null)}
        />
      </ModalFrame>

      <InstructorDetailsModal
        open={dialogMode === "details"}
        onClose={() => setDialogMode(null)}
        detailLoading={detailLoading}
        detailRow={detailRow}
        statusOverride={detailRow ? statusOverrides[detailRow._id] : undefined}
      />
    </section>
  );
}

