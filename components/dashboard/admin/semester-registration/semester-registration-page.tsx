"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SemesterRegistrationSortOption } from "@/lib/type/dashboard/admin/semester-registration";
import type { SemesterRegistrationPageProps } from "@/lib/type/dashboard/admin/semester-registration/ui";
import { showToast } from "@/utils/common/toast";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { SemesterRegistrationFilters } from "./semester-registration-filters";
import { SemesterRegistrationPagination } from "./semester-registration-pagination";
import { SemesterRegistrationTable } from "./semester-registration-table";
import { SemesterRegistrationFormModal } from "./semester-registration-form-modal";
import { deleteSemesterRegistrationAction } from "@/actions/dashboard/admin/semester-registration";

export function SemesterRegistrationPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  status,
  shift,
  semesters,
  error,
}: SemesterRegistrationPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(status);
  const [shiftFilter, setShiftFilter] = useState(shift);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof items[number] | null>(null);
  const [deleteItem, setDeleteItem] = useState<typeof items[number] | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter(status);
    setShiftFilter(shift);
  }, [status, shift]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: SemesterRegistrationSortOption | null;
    status?: string | null;
    shift?: string | null;
  }) {
    updateListSearchParams({
      pathname,
      searchParams,
      router,
      startTransition,
      entries: [
        ["searchTerm", next.searchTerm],
        ["page", next.page],
        ["limit", next.limit],
        ["sort", next.sort],
        ["status", next.status],
        ["shift", next.shift],
      ],
      defaults: { page: 1, limit: 10, sort: "-createdAt" },
    });
  }

  useEffect(() => {
    if (debouncedSearch === searchTerm) {
      return;
    }

    updateParams({
      searchTerm: debouncedSearch.trim() ? debouncedSearch : null,
      page: 1,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, searchTerm]);

  function handleDelete(item: (typeof items)[number]) {
    if (!item._id) {
      return;
    }
    setDeleteItem(item);
  }

  async function confirmDelete() {
    if (!deleteItem?._id) {
      return;
    }

    setDeleteBusy(true);
    try {
      await deleteSemesterRegistrationAction(deleteItem._id);
      showToast({
        variant: "success",
        title: "Registration deleted",
        description: "Semester registration deleted successfully.",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unable to delete.",
      });
    } finally {
      setDeleteBusy(false);
      setDeleteItem(null);
    }
  }

  function handleSaved() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <DashboardPageHeader
        title="Semester Registrations"
        description="Manage registration windows, shifts, and academic semesters."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Registration
          </button>
        }
      />

      <SemesterRegistrationFilters
        search={searchInput}
        sort={sort}
        status={statusFilter}
        shift={shiftFilter}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as SemesterRegistrationSortOption,
            page: 1,
          })
        }
        onStatusChange={(value) => {
          setStatusFilter(value);
          updateParams({ status: value || null, page: 1 });
        }}
        onShiftChange={(value) => {
          setShiftFilter(value);
          updateParams({ shift: value || null, page: 1 });
        }}
      />

      <DashboardErrorBanner
        error={error}
        action={
          <button
            type="button"
            onClick={() => {
              showToast({
                variant: "info",
                title: "Retrying",
                description: "Fetching semester registrations again.",
              });
              startTransition(() => {
                router.refresh();
              });
            }}
            className="ml-3 inline-flex items-center rounded-lg border border-red-400/60 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        }
      />

      <SemesterRegistrationTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(item) => setEditItem(item)}
        onDelete={handleDelete}
      />

      <SemesterRegistrationPagination
        meta={meta}
        page={page}
        limit={limit}
        onPageChange={(nextPage) => updateParams({ page: nextPage })}
        onLimitChange={(nextLimit) =>
          updateParams({
            limit: nextLimit,
            page: 1,
          })
        }
      />

      <SemesterRegistrationFormModal
        open={createOpen}
        semesters={semesters ?? []}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <SemesterRegistrationFormModal
        open={Boolean(editItem)}
        registration={editItem}
        semesters={semesters ?? []}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Delete semester registration?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleteBusy}
        onCancel={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
