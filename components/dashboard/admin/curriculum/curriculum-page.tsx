"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CurriculumSortOption } from "@/lib/type/dashboard/admin/curriculum";
import type { CurriculumPageProps } from "@/lib/type/dashboard/admin/curriculum/ui";
import { showToast } from "@/utils/common/toast";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { CurriculumFilters } from "./curriculum-filters";
import { CurriculumPagination } from "./curriculum-pagination";
import { CurriculumTable } from "./curriculum-table";
import { CurriculumFormModal } from "./curriculum-form-modal";
import { deleteCurriculumAction } from "@/actions/dashboard/admin/curriculum";

export function CurriculumPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  academicDepartments,
  semesterRegistrations,
  subjects,
  offeredSubjects,
  error,
}: CurriculumPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof items[number] | null>(null);
  const [deleteItem, setDeleteItem] = useState<typeof items[number] | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: CurriculumSortOption | null;
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

  async function confirmDelete() {
    if (!deleteItem?._id) {
      return;
    }

    setDeleteBusy(true);
    try {
      await deleteCurriculumAction(deleteItem._id);
      showToast({
        variant: "success",
        title: "Curriculum deleted",
        description: "Curriculum deleted successfully.",
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
        title="Curriculums"
        description="Manage curriculum sessions, subjects, and total credit."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Curriculum
          </button>
        }
      />

      <CurriculumFilters
        search={searchInput}
        sort={sort}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as CurriculumSortOption,
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
                description: "Fetching curriculums again.",
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

      <CurriculumTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(item) => setEditItem(item)}
        onDelete={handleDelete}
      />

      <CurriculumPagination
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

      <CurriculumFormModal
        open={createOpen}
        academicDepartments={academicDepartments}
        semesterRegistrations={semesterRegistrations}
        subjects={subjects}
        offeredSubjects={offeredSubjects}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <CurriculumFormModal
        open={Boolean(editItem)}
        curriculum={editItem}
        academicDepartments={academicDepartments}
        semesterRegistrations={semesterRegistrations}
        subjects={subjects}
        offeredSubjects={offeredSubjects}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Delete curriculum?"
        description={
          deleteItem?.session
            ? `This will permanently delete "${deleteItem.session}".`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleteBusy}
        onCancel={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
