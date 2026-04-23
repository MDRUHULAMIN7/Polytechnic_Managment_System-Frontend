"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Room, RoomSortOption } from "@/lib/type/dashboard/admin/room";
import type { RoomPageProps } from "@/lib/type/dashboard/admin/room/ui";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { RoomFormModal } from "./room-form-modal";

function RoomFilters({
  search,
  sort,
  isActive,
  onSearchChange,
  onSortChange,
  onActiveChange,
}: {
  search: string;
  sort: RoomSortOption;
  isActive: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: RoomSortOption) => void;
  onActiveChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by room name"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        />
      </div>

      <div className="w-full lg:max-w-xs">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Status
        </label>
        <select
          value={isActive}
          onChange={(event) => onActiveChange(event.target.value)}
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
        >
          <option value="">All rooms</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>

      <div className="w-full lg:w-auto">
        <div className="min-w-42.5">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as RoomSortOption)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="roomName">Name A-Z</option>
            <option value="-roomName">Name Z-A</option>
            <option value="buildingNumber">Building low-high</option>
            <option value="-buildingNumber">Building high-low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function RoomTable({
  items,
  loading,
  error,
  onEdit,
}: {
  items: Room[];
  loading: boolean;
  error?: string | null;
  onEdit: (item: Room) => void;
}) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Room</th>
              <th className="px-5 py-4 font-semibold">Location</th>
              <th className="px-5 py-4 font-semibold">Capacity</th>
              <th className="px-5 py-4 font-semibold">Floor</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`room-skeleton-${index}`} className="border-b border-(--line)">
                    <td className="px-5 py-4">
                      <div className="h-4 w-36 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-24 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load rooms." : "No rooms found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="border-b border-(--line) last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{item.roomName}</p>
                    <p className="mt-1 text-xs text-(--text-dim)">
                      Room #{item.roomNumber}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    Building {item.buildingNumber}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.capacity}</td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {item.floor ?? "--"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.isActive
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-slate-500/15 text-slate-300"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg bg-(--accent) px-3 text-xs font-semibold text-(--accent-ink) transition hover:opacity-90"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomPagination({
  page,
  limit,
  meta,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  limit: number;
  meta: RoomPageProps["meta"];
  onPageChange: (value: number) => void;
  onLimitChange: (value: number) => void;
}) {
  const totalPages = Math.max(meta.totalPage || 1, 1);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-(--text-dim)">
        Page <span className="font-semibold text-(--text)">{page}</span> of{" "}
        <span className="font-semibold text-(--text)">{totalPages}</span> -{" "}
        <span className="font-semibold text-(--text)">{meta.total}</span> total
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
          Rows
        </label>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="focus-ring h-9 rounded-lg border border-(--line) bg-(--surface) px-2 text-sm text-(--text)"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="ml-2 inline-flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoomPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  isActive,
  error,
}: RoomPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(isActive);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Room | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setStatusFilter(isActive);
  }, [isActive]);

  function updateParams(next: {
    searchTerm?: string | null;
    page?: number | null;
    limit?: number | null;
    sort?: RoomSortOption | null;
    isActive?: string | null;
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
        ["isActive", next.isActive],
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

  function handleSaved() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <DashboardPageHeader
        title="Rooms"
        description="Manage classroom inventory, capacity, and schedule availability."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
          >
            Create Room
          </button>
        }
      />

      <RoomFilters
        search={searchInput}
        sort={sort}
        isActive={statusFilter}
        onSearchChange={setSearchInput}
        onSortChange={(value) => updateParams({ sort: value, page: 1 })}
        onActiveChange={(value) => {
          setStatusFilter(value);
          updateParams({ isActive: value || null, page: 1 });
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
                description: "Fetching rooms again.",
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

      <RoomTable
        items={items}
        loading={isPending}
        error={error}
        onEdit={(item) => setEditItem(item)}
      />

      <RoomPagination
        page={page}
        limit={limit}
        meta={meta}
        onPageChange={(nextPage) => updateParams({ page: nextPage })}
        onLimitChange={(nextLimit) => updateParams({ limit: nextLimit, page: 1 })}
      />

      <RoomFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSaved={handleSaved}
      />

      <RoomFormModal
        open={Boolean(editItem)}
        mode="edit"
        room={editItem}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />
    </section>
  );
}
