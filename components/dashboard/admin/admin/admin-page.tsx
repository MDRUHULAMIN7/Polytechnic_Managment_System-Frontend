"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminSortOption, AdminStatus } from "@/lib/type/dashboard/admin/admin";
import type { AdminPageProps } from "@/lib/type/dashboard/admin/admin/ui";
import { showToast } from "@/utils/common/toast";
import { AdminFilters } from "./admin-filters";
import { AdminPagination } from "./admin-pagination";
import { AdminTable } from "./admin-table";
import { AdminFormModal } from "./admin-form-modal";
import { changeAdminStatusAction } from "@/actions/dashboard/admin/admin";

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}

export function AdminPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  error,
  canChangeStatus,
}: AdminPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: AdminSortOption | null;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    const entries: Array<[string, string | number | null | undefined]> = [
      ["searchTerm", next.searchTerm],
      ["page", next.page],
      ["limit", next.limit],
      ["sort", next.sort],
    ];

    for (const [key, value] of entries) {
      if (value === undefined) {
        continue;
      }

      if (value === null || value === "") {
        params.delete(key);
        continue;
      }

      params.set(key, String(value));
    }

    if (next.page !== undefined && (next.page === null || next.page <= 1)) {
      params.delete("page");
    }

    if (next.limit !== undefined && (next.limit === null || next.limit === 10)) {
      params.delete("limit");
    }

    if (next.sort !== undefined && (next.sort === null || next.sort === "-createdAt")) {
      params.delete("sort");
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    if (nextUrl !== `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`) {
      startTransition(() => {
        router.push(nextUrl, { scroll: false });
      });
    }
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

  async function handleStatusChange(admin: AdminPageProps["items"][number], status: AdminStatus) {
    if (!canChangeStatus) {
      showToast({
        variant: "error",
        title: "Not allowed",
        description: "Only super admin can change admin status.",
      });
      return;
    }

    const userId = admin.user?._id;
    if (!userId) {
      showToast({
        variant: "error",
        title: "Missing user",
        description: "Unable to update status for this admin.",
      });
      return;
    }

    setStatusUpdatingId(userId);
    try {
      await changeAdminStatusAction(userId, status, admin._id);
      showToast({
        variant: "success",
        title: "Status updated",
        description: `Admin status set to ${status}.`,
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unable to update status.",
      });
    } finally {
      setStatusUpdatingId(null);
    }
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
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admins</h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Manage admins, update status, and create new profiles.
          </p>
        </div>
        {canChangeStatus ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Admin
          </button>
        ) : null}
      </div>

      <AdminFilters
        search={searchInput}
        sort={sort}
        onSearchChange={setSearchInput}
        onSortChange={(value) =>
          updateParams({
            sort: value as AdminSortOption,
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
                description: "Fetching admins again.",
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

      <AdminTable
        items={items}
        loading={isPending}
        error={error}
        statusUpdatingId={statusUpdatingId}
        canChangeStatus={canChangeStatus}
        onStatusChange={handleStatusChange}
      />

      <AdminPagination
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

      <AdminFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={handleSaved} />
    </section>
  );
}
