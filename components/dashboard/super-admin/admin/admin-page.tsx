"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import { createAdmin, getAdminById, getAdmins } from "@/lib/api/admin";
import { changeUserStatus } from "@/lib/api/user";
import type { AdminProfile, UserStatus } from "@/lib/api/types";
import {
  ADMIN_DEFAULT_META,
  type AdminTableRow,
  type AdminTableState,
  type CreateAdminFormValues,
  ADMIN_TABLE_PAGE_SIZES,
  EMPTY_CREATE_ADMIN_FORM,
  buildCreateAdminPayload,
  isAdminBloodGroup,
  isAdminGender,
  isSameAdminTableState,
  parseAdminTableState,
  resolveAdminUserId,
  resolveAdminUserStatus,
  toAdminApiQuery,
  toAdminRouteQuery,
} from "@/lib/utils/admin/admin-utils";
import { useToastManager } from "@/lib/use-toast-manager";
import { AdminFilters } from "@/components/dashboard/super-admin/admin/admin-filters";
import { AdminCreateForm } from "@/components/dashboard/super-admin/admin/admin-create-form";
import { AdminDetailsModal } from "@/components/dashboard/super-admin/admin/admin-details-modal";
import { AdminTable } from "@/components/dashboard/super-admin/admin/admin-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { ToastRegion } from "@/components/ui/toast-region";

type DialogMode = "create" | "details" | null;

export function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [tableState, setTableState] = useState<AdminTableState>(() =>
    parseAdminTableState(searchParams),
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [detailRow, setDetailRow] = useState<AdminProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);
  const { toasts, addToast, dismissToast } = useToastManager();

  const createForm = useForm<CreateAdminFormValues>({
    defaultValues: EMPTY_CREATE_ADMIN_FORM,
  });

  // Sync URL with tableState
  const nextQuery = toAdminRouteQuery(tableState).toString();
  if (typeof window !== "undefined" && nextQuery !== searchParams.toString()) {
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }

  // Main table query
  const adminsQuery = useQuery({
    queryKey: ["admins", tableState],
    queryFn: () => getAdmins<AdminTableRow>(toAdminApiQuery(tableState)),
  });

  const rows = adminsQuery.data?.data?.result ?? [];
  const meta = adminsQuery.data?.data?.meta ?? {
    ...ADMIN_DEFAULT_META,
    total: 0,
    totalPage: 1,
  };
  const loading = adminsQuery.isLoading || adminsQuery.isFetching;

  const openCreate = () => {
    createForm.reset(EMPTY_CREATE_ADMIN_FORM);
    setDialogMode("create");
  };

  const openDetails = async (row: AdminTableRow) => {
    setDialogMode("details");
    setDetailLoading(true);
    setDetailRow(null);
    try {
      const response = await getAdminById(row._id);
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
    if (!isAdminGender(values.gender)) {
      addToast("error", "Create Failed", "Please select a valid gender.");
      return;
    }
    if (!isAdminBloodGroup(values.bloogGroup)) {
      addToast("error", "Create Failed", "Please select a valid blood group.");
      return;
    }
    try {
      const response = await createAdmin(buildCreateAdminPayload(values));
      addToast("success", "Created", response.message);
      setDialogMode(null);
      createForm.reset(EMPTY_CREATE_ADMIN_FORM);
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed.";
      addToast("error", "Create Failed", message);
    }
  });

  const handleStatusChange = async (row: AdminTableRow) => {
    const userId = resolveAdminUserId(row);
    if (!userId) {
      addToast("error", "Status Failed", "Missing linked user id.");
      return;
    }
    const currentStatus = resolveAdminUserStatus(row);
    const nextStatus: UserStatus = currentStatus === "active" ? "blocked" : "active";
    setStatusTargetId(row._id);
    try {
      const response = await changeUserStatus(userId, { status: nextStatus });
      addToast("success", "Status Updated", response.message);
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status update failed.";
      addToast("error", "Status Failed", message);
    } finally {
      setStatusTargetId(null);
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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--primary)">
              Super Admin Module
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Admins</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-(--text-dim)">
              See all admins, change account status from table view, open single admin details, and create a new admin.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110"
          >
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create Admin
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <AdminFilters
          tableState={tableState}
          rowsPerPage={ADMIN_TABLE_PAGE_SIZES}
          onSearchChange={(value) => setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }))}
          onSortChange={(value) => setTableState((prev) => ({ ...prev, sort: value, page: 1 }))}
          onLimitChange={(value) => setTableState((prev) => ({ ...prev, limit: value, page: 1 }))}
        />

        <AdminTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          statusTargetId={statusTargetId}
          onDetails={openDetails}
          onStatusChange={handleStatusChange}
          onPrevPage={() => setTableState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          onNextPage={() => setTableState((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
        />
      </section>

      <ModalFrame
        open={dialogMode === "create"}
        title="Create Admin"
        description="Only super admin can create admin accounts."
        onClose={() => setDialogMode(null)}
      >
        <AdminCreateForm
          form={createForm}
          onSubmit={handleCreate}
          onCancel={() => setDialogMode(null)}
        />
      </ModalFrame>

      <AdminDetailsModal
        open={dialogMode === "details"}
        onClose={() => setDialogMode(null)}
        detailLoading={detailLoading}
        detailRow={detailRow}
      />
    </section>
  );
}

