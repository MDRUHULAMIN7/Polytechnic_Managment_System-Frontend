"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getOfferedSubject,
} from "@/lib/api/dashboard/admin/offered-subject";
import type {
  OfferedSubject,
  OfferedSubjectSortOption,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { OfferedSubjectPageProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { showToast } from "@/utils/common/toast";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { OfferedSubjectFilters } from "./offered-subject-filters";
import { OfferedSubjectPagination } from "./offered-subject-pagination";
import { OfferedSubjectTable } from "./offered-subject-table";
import { OfferedSubjectFormModal } from "./offered-subject-form-modal";
import { deleteOfferedSubjectAction } from "@/actions/dashboard/admin/offered-subject";

export function OfferedSubjectPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  subjects,
  instructors,
  academicDepartments,
  academicInstructors,
  semesterRegistrations,
  error,
}: OfferedSubjectPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<OfferedSubject | null>(null);
  const [deleteItem, setDeleteItem] = useState<typeof items[number] | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: OfferedSubjectSortOption | null;
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

  async function handleEdit(item: (typeof items)[number]) {
    if (!item._id || editBusy) {
      return;
    }

    setEditBusy(true);

    try {
      const details = await getOfferedSubject(item._id);
      setEditItem(details);
    } catch (err) {
      showToast({
        variant: "error",
        title: "Unable to load offered subject",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setEditBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteItem?._id) {
      return;
    }

    setDeleteBusy(true);
    try {
      await deleteOfferedSubjectAction(deleteItem._id);
      showToast({
        variant: "success",
        title: "Offered subject deleted",
        description: "Offered subject deleted successfully.",
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
        title="Offered Subjects"
        description="Manage semester offerings, schedules, and instructor assignments."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Offered Subject
          </button>
        }
      />

      <OfferedSubjectFilters
        search={searchInput}
        sort={sort}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as OfferedSubjectSortOption,
            page: 1,
          })
        }
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
                description: "Fetching offered subjects again.",
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

      <OfferedSubjectTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(item) => {
          void handleEdit(item);
        }}
        onDelete={handleDelete}
        actionsLabel="Marks"
        viewLabel="View Marks"
      />

      <OfferedSubjectPagination
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

      <OfferedSubjectFormModal
        open={createOpen}
        subjects={subjects}
        instructors={instructors}
        academicDepartments={academicDepartments}
        academicInstructors={academicInstructors}
        semesterRegistrations={semesterRegistrations}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <OfferedSubjectFormModal
        open={Boolean(editItem)}
        offeredSubject={editItem}
        subjects={subjects}
        instructors={instructors}
        academicDepartments={academicDepartments}
        academicInstructors={academicInstructors}
        semesterRegistrations={semesterRegistrations}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Delete offered subject?"
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
