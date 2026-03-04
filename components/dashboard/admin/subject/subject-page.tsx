"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SubjectSortOption } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { SubjectPageProps } from "@/lib/type/dashboard/admin/subject/ui";
import { showToast } from "@/utils/common/toast";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { SubjectFilters } from "./subject-filters";
import { SubjectPagination } from "./subject-pagination";
import { SubjectTable } from "./subject-table";
import { SubjectFormModal } from "./subject-form-modal";
import { SubjectAssignModal } from "./subject-assign-modal";
import {
  assignInstructorsAction,
  deleteSubjectAction,
  removeInstructorsAction,
} from "@/actions/dashboard/admin/subject";
import {
  getInstructorsAction,
  getSubjectInstructorsAction,
} from "@/actions/dashboard/admin/subject";
import type { Subject } from "@/lib/type/dashboard/admin/subject";

export function SubjectPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  error,
}: SubjectPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [assigning, setAssigning] = useState<Subject | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [assignedInstructors, setAssignedInstructors] = useState<Instructor[]>([]);
  const [deleteItem, setDeleteItem] = useState<Subject | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: SubjectSortOption | null;
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
      defaults: { page: 1, limit: 10, sort: "-title" },
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

  function handleDelete(subject: Subject) {
    if (!subject._id) {
      return;
    }
    setDeleteItem(subject);
  }

  async function confirmDelete() {
    if (!deleteItem?._id) {
      return;
    }

    setDeleteBusy(true);
    try {
      await deleteSubjectAction(deleteItem._id);
      showToast({
        variant: "success",
        title: "Subject deleted",
        description: "Subject deleted successfully.",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unable to delete subject.",
      });
    } finally {
      setDeleteBusy(false);
      setDeleteItem(null);
    }
  }

  async function handleAssignOpen(subject: Subject) {
    setAssigning(subject);
    setAssignLoading(true);

    try {
      const [instructorsPayload, assignedPayload] = await Promise.all([
        getInstructorsAction({ page: 1, limit: 1000 }),
        getSubjectInstructorsAction(subject._id),
      ]);
      setAllInstructors(instructorsPayload.result ?? []);
      setAssignedInstructors(assignedPayload.instructors ?? []);
    } catch (err) {
      showToast({
        variant: "error",
        title: "Load failed",
        description: err instanceof Error ? err.message : "Unable to load instructors.",
      });
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleAssign(instructorIds: string[]) {
    if (!assigning?._id) {
      return;
    }
    await assignInstructorsAction(assigning._id, instructorIds);
    const assignedPayload = await getSubjectInstructorsAction(assigning._id);
    setAssignedInstructors(assignedPayload.instructors ?? []);
  }

  async function handleRemove(instructorId: string) {
    if (!assigning?._id) {
      return;
    }
    await removeInstructorsAction(assigning._id, [instructorId]);
    const assignedPayload = await getSubjectInstructorsAction(assigning._id);
    setAssignedInstructors(assignedPayload.instructors ?? []);
  }

  function handleSaved() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Manage subjects, update details, and assign instructors.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
        >
          Create Subject
        </button>
      </div>

      <SubjectFilters
        search={searchInput}
        sort={sort}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as SubjectSortOption,
            page: 1,
          })
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button
            type="button"
            onClick={() => {
              showToast({
                variant: "info",
                title: "Retrying",
                description: "Fetching subjects again.",
              });
              startTransition(() => {
                router.refresh();
              });
            }}
            className="ml-3 inline-flex items-center rounded-lg border border-red-400/60 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      ) : null}

      <SubjectTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(subject) => setEditing(subject)}
        onAssign={handleAssignOpen}
        onDelete={handleDelete}
      />

      <SubjectPagination
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

      <SubjectFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <SubjectFormModal
        open={!!editing}
        subject={editing}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />

      <SubjectAssignModal
        open={!!assigning}
        subject={assigning}
        instructors={allInstructors}
        assignedInstructors={assignedInstructors}
        loading={assignLoading}
        onClose={() => setAssigning(null)}
        onAssign={handleAssign}
        onRemove={handleRemove}
      />

      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Delete subject?"
        description={
          deleteItem?.title
            ? `This will permanently delete "${deleteItem.title}".`
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
