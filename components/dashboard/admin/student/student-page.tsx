"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import { changeUserStatus } from "@/lib/api/user";
import { createStudent, getStudentById, getStudents } from "@/lib/api/student";
import { getAcademicDepartments } from "@/lib/api/academic-department";
import { getAcademicSemesters } from "@/lib/api/academic-semester";
import type { AcademicDepartment, AcademicSemester, StudentProfile, UserStatus } from "@/lib/api/types";
import {
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import {
  EMPTY_CREATE_STUDENT_FORM,
  STUDENT_DEFAULT_META,
  STUDENT_DEFAULT_TABLE_STATE,
  STUDENT_SORT_OPTIONS,
  STUDENT_TABLE_FIELDS,
  STUDENT_TABLE_PAGE_SIZES,
  isStudentBloodGroup,
  isStudentGender,
  resolveUserId,
  type CreateStudentFormValues,
  type StudentTableRow,
} from "@/lib/utils/student/student-utils";
import { readSessionRole } from "@/lib/session";
import { useToastManager } from "@/lib/use-toast-manager";
import { StudentCreateForm } from "@/components/dashboard/admin/student/student-create-form";
import { StudentDetailsModal } from "@/components/dashboard/admin/student/student-details-modal";
import { StudentFilters } from "@/components/dashboard/admin/student/student-filters";
import { StudentTable } from "@/components/dashboard/admin/student/student-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { ToastRegion } from "@/components/ui/toast-region";

type DialogMode = "create" | "details" | null;
type ChangeStudentStatusPayload = { userId: string; status: UserStatus };

export function StudentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const role = readSessionRole();

  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(searchParams, STUDENT_DEFAULT_TABLE_STATE, STUDENT_SORT_OPTIONS),
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [detailRow, setDetailRow] = useState<StudentProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusPendingKey, setStatusPendingKey] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, UserStatus>>({});
  const { toasts, addToast, dismissToast } = useToastManager();

  const createForm = useForm<CreateStudentFormValues>({
    defaultValues: EMPTY_CREATE_STUDENT_FORM,
  });

  // Sync URL with tableState
  const nextQuery = toRouteQuery(tableState, STUDENT_DEFAULT_TABLE_STATE).toString();
  if (typeof window !== "undefined" && nextQuery !== searchParams.toString()) {
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }

  // Main table data query
  const studentsQuery = useQuery({
    queryKey: ["students", tableState],
    queryFn: () => {
      const query = toApiQuery(tableState, STUDENT_DEFAULT_TABLE_STATE, STUDENT_TABLE_FIELDS);
      return getStudents<StudentTableRow>(query);
    },
  });

  const rows = studentsQuery.data?.data?.result ?? [];
  const meta = studentsQuery.data?.data?.meta ?? {
    ...STUDENT_DEFAULT_META,
    total: 0,
    totalPage: 1,
  };
  const loading = studentsQuery.isLoading || studentsQuery.isFetching;

  // Dropdown queries
  const departmentsQuery = useQuery({
    queryKey: ["academic-departments-dropdown"],
    queryFn: () => {
      const q = new URLSearchParams({ fields: "_id,name" });
      return getAcademicDepartments(q);
    },
    staleTime: 5 * 60 * 1000, // dropdowns rarely change, cache 5 min
  });

  const semestersQuery = useQuery({
    queryKey: ["academic-semesters-dropdown"],
    queryFn: () => {
      const q = new URLSearchParams({ fields: "_id,name,year,startMonth,endMonth" });
      return getAcademicSemesters(q);
    },
    staleTime: 5 * 60 * 1000,
  });

  const departments: AcademicDepartment[] = Array.isArray(departmentsQuery.data?.data)
    ? (departmentsQuery.data.data as AcademicDepartment[])
    : [];
  const semesters: AcademicSemester[] = Array.isArray(semestersQuery.data?.data)
    ? (semestersQuery.data.data as AcademicSemester[])
    : [];
  const dropdownLoading = departmentsQuery.isLoading || semestersQuery.isLoading;

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ userId, status }: ChangeStudentStatusPayload) =>
      changeUserStatus(userId, { status }),
  });

  const openCreate = () => {
    createForm.reset(EMPTY_CREATE_STUDENT_FORM);
    setDialogMode("create");
  };

  const openDetails = async (row: StudentTableRow) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);
    try {
      const response = await getStudentById(row.id);
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
    if (!isStudentGender(values.gender)) {
      addToast("error", "Create Failed", "Please select a valid gender.");
      return;
    }
    if (values.bloodGroup && !isStudentBloodGroup(values.bloodGroup)) {
      addToast("error", "Create Failed", "Please select a valid blood group.");
      return;
    }
    const safeBloodGroup =
      values.bloodGroup && isStudentBloodGroup(values.bloodGroup) ? values.bloodGroup : undefined;

    try {
      const response = await createStudentMutation.mutateAsync({
        password: values.password.trim(),
        studentData: {
          name: {
            firstName: values.firstName.trim(),
            middleName: values.middleName.trim() || undefined,
            lastName: values.lastName.trim(),
          },
          gender: values.gender,
          dateOfBirth: values.dateOfBirth || undefined,
          email: values.email.trim(),
          contactNo: values.contactNo.trim(),
          emergencyContactNo: values.emergencyContactNo.trim(),
          bloodGroup: safeBloodGroup,
          presentAddress: values.presentAddress.trim(),
          permanentAddress: values.permanentAddress.trim(),
          admissionSemester: values.admissionSemester,
          academicDepartment: values.academicDepartment,
          guardian: {
            fatherName: values.fatherName.trim(),
            fatherOccupation: values.fatherOccupation.trim(),
            fatherContactNo: values.fatherContactNo.trim(),
            motherName: values.motherName.trim(),
            motherOccupation: values.motherOccupation.trim(),
            motherContactNo: values.motherContactNo.trim(),
          },
          localGuardian: {
            name: values.localGuardianName.trim(),
            occupation: values.localGuardianOccupation.trim(),
            contactNo: values.localGuardianContactNo.trim(),
            address: values.localGuardianAddress.trim(),
          },
          profileImg: undefined,
        },
        file: values.profileFile?.item(0) ?? null,
      });
      addToast("success", "Created", response.message);
      setDialogMode(null);
      createForm.reset(EMPTY_CREATE_STUDENT_FORM);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      addToast("error", "Create Failed", message);
    }
  });

  const handleStatusChange = async (row: StudentTableRow, nextStatus: UserStatus) => {
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
      const response = await changeStatusMutation.mutateAsync({
        userId,
        status: nextStatus,
      });
      setStatusOverrides((prev) => ({ ...prev, [row._id]: nextStatus }));
      addToast("success", "Status Updated", response.message);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
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

      <header className="rounded-2xl border border-(--line) bg-(--surface) p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Students</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-(--text-dim)">
              See all students, change user status from table view, open details, and create a new student.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110"
          >
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create Student
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <StudentFilters
          tableState={tableState}
          rowsPerPage={STUDENT_TABLE_PAGE_SIZES}
          onSearchChange={(value) => setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }))}
          onSortChange={(value) => setTableState((prev) => ({ ...prev, sort: value, page: 1 }))}
          onLimitChange={(value) => setTableState((prev) => ({ ...prev, limit: value, page: 1 }))}
        />

        <StudentTable
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

      <ModalFrame
        open={dialogMode === "create"}
        title="Create Student"
        description="Create student with academic department, admission semester, and profile image."
        onClose={() => setDialogMode(null)}
      >
        <StudentCreateForm
          form={createForm}
          departments={departments}
          semesters={semesters}
          loadingDropdowns={dropdownLoading}
          onSubmit={handleCreate}
          onCancel={() => setDialogMode(null)}
        />
      </ModalFrame>

      <StudentDetailsModal
        open={dialogMode === "details"}
        onClose={() => setDialogMode(null)}
        detailLoading={detailLoading}
        detailRow={detailRow}
        statusOverride={detailRow ? statusOverrides[detailRow._id] : undefined}
      />
    </section>
  );
}

