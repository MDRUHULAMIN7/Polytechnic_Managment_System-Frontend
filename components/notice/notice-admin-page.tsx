"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  createNotice,
  deleteNotice,
  updateNotice,
} from "@/lib/api/notice";
import type { Notice, NoticeInput, PaginationMeta } from "@/lib/type/notice";
import {
  NOTICE_AUDIENCES,
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  NOTICE_STATUSES,
} from "@/lib/type/notice";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { showToast } from "@/utils/common/toast";
import { NoticeCard } from "./notice-card";
import { NoticeFormModal } from "./notice-form-modal";

export function NoticeAdminPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  status,
  category,
  priority,
  targetAudience,
  error,
}: Readonly<{
  items: Notice[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  status: Notice["status"] | "";
  category: Notice["category"] | "";
  priority: Notice["priority"] | "";
  targetAudience: Notice["targetAudience"] | "";
  error: string | null;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<Notice["status"] | "">(status);
  const [categoryFilter, setCategoryFilter] = useState<Notice["category"] | "">(
    category,
  );
  const [priorityFilter, setPriorityFilter] = useState<Notice["priority"] | "">(
    priority,
  );
  const [audienceFilter, setAudienceFilter] = useState<
    Notice["targetAudience"] | ""
  >(targetAudience);
  const [createOpen, setCreateOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter(status);
  }, [status]);

  useEffect(() => {
    setCategoryFilter(category);
  }, [category]);

  useEffect(() => {
    setPriorityFilter(priority);
  }, [priority]);

  useEffect(() => {
    setAudienceFilter(targetAudience);
  }, [targetAudience]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    status?: Notice["status"] | "" | null;
    category?: Notice["category"] | "" | null;
    priority?: Notice["priority"] | "" | null;
    targetAudience?: Notice["targetAudience"] | "" | null;
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
        ["status", next.status],
        ["category", next.category],
        ["priority", next.priority],
        ["targetAudience", next.targetAudience],
      ],
      defaults: { page: 1, limit: 10 },
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

  function refreshPage() {
    startTransition(() => {
      router.refresh();
    });
  }

  const saveMutation = useMutation({
    mutationFn: async ({
      input,
      noticeId,
    }: {
      input: NoticeInput;
      noticeId?: string;
    }) => {
      if (noticeId) {
        return updateNotice(noticeId, input);
      }

      return createNotice(input);
    },
    onSuccess: (_data, variables) => {
      showToast({
        variant: "success",
        title: variables.noticeId ? "Notice updated" : "Notice created",
        description: variables.noticeId
          ? "Notice changes were saved."
          : "Notice published successfully.",
      });

      setCreateOpen(false);
      setEditNotice(null);
      refreshPage();
    },
    onError: (mutationError) => {
      showToast({
        variant: "error",
        title: "Action failed",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to save notice.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Notice deleted",
        description: "The notice has been removed.",
      });
      refreshPage();
    },
    onError: (mutationError) => {
      showToast({
        variant: "error",
        title: "Delete failed",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to delete notice.",
      });
    },
  });

  return (
    <section className="space-y-5">
      <DashboardPageHeader
        title="Manage Notices"
        description="Create, search, update, and retire notice board entries."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Notice
          </button>
        }
      />

      <section className="grid gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:grid-cols-5">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search notice title or content"
          className="focus-ring h-11 rounded-xl border border-(--line) bg-transparent px-3 text-sm lg:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            const nextValue = event.target.value as Notice["status"] | "";
            setStatusFilter(nextValue);
            updateParams({ status: nextValue || null, page: 1 });
          }}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        >
          <option value="">All Statuses</option>
          {NOTICE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(event) => {
            const nextValue = event.target.value as Notice["category"] | "";
            setCategoryFilter(nextValue);
            updateParams({ category: nextValue || null, page: 1 });
          }}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        >
          <option value="">All Categories</option>
          {NOTICE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(event) => {
            const nextValue = event.target.value as Notice["priority"] | "";
            setPriorityFilter(nextValue);
            updateParams({ priority: nextValue || null, page: 1 });
          }}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        >
          <option value="">All Priorities</option>
          {NOTICE_PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={audienceFilter}
          onChange={(event) => {
            const nextValue = event.target.value as Notice["targetAudience"] | "";
            setAudienceFilter(nextValue);
            updateParams({ targetAudience: nextValue || null, page: 1 });
          }}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm lg:col-span-2"
        >
          <option value="">All Audiences</option>
          {NOTICE_AUDIENCES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={String(limit)}
          onChange={(event) =>
            updateParams({
              limit: Number(event.target.value),
              page: 1,
            })
          }
          className="focus-ring h-11 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        >
          {[10, 20, 30].map((item) => (
            <option key={item} value={item}>
              {item} per page
            </option>
          ))}
        </select>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-8 text-center text-sm text-(--text-dim)">
          No notices found for the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <NoticeCard
              key={item._id}
              notice={item}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/admin/notices/${item._id}`}
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditNotice(item)}
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Delete "${item.title}"? This cannot be undone.`,
                        )
                      ) {
                        return;
                      }

                      deleteMutation.mutate(item._id);
                    }}
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-rose-300/70 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-100/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-700/60 dark:text-rose-200 dark:hover:bg-rose-950/40"
                  >
                    Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-(--text-dim)">
          Showing page {meta.page} of {meta.totalPage}. Total notices: {meta.total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
            disabled={page <= 1}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => updateParams({ page: Math.min(page + 1, meta.totalPage) })}
            disabled={page >= meta.totalPage}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>

      <NoticeFormModal
        open={createOpen}
        mode="create"
        submitting={saveMutation.isPending || isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={(input) => saveMutation.mutateAsync({ input })}
      />

      <NoticeFormModal
        open={Boolean(editNotice)}
        mode="edit"
        notice={editNotice}
        submitting={saveMutation.isPending || isPending}
        onClose={() => setEditNotice(null)}
        onSubmit={(input, noticeId) =>
          saveMutation.mutateAsync({ input, noticeId })
        }
      />
    </section>
  );
}
