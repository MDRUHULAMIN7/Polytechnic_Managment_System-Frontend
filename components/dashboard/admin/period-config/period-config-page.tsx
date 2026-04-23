"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  PeriodConfig,
  PeriodConfigSortOption,
} from "@/lib/type/dashboard/admin/period-config";
import type { PeriodConfigPageProps } from "@/lib/type/dashboard/admin/period-config/ui";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { showToast } from "@/utils/common/toast";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { PeriodConfigFormModal } from "./period-config-form-modal";

function formatEffectiveDate(value: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function summarizePeriods(item: PeriodConfig) {
  if (!item.periods?.length) {
    return "No periods configured";
  }

  const sorted = [...item.periods].sort((left, right) => left.periodNo - right.periodNo);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const activeCount = sorted.filter((period) => period.isActive !== false).length;

  return `${activeCount}/${sorted.length} active | ${first.startTime}-${last.endTime}`;
}

function PeriodConfigFilters({
  search,
  sort,
  isActive,
  onSearchChange,
  onSortChange,
  onActiveChange,
}: {
  search: string;
  sort: PeriodConfigSortOption;
  isActive: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: PeriodConfigSortOption) => void;
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
          placeholder="Search by configuration label"
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
          <option value="">All configs</option>
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
            onChange={(event) =>
              onSortChange(event.target.value as PeriodConfigSortOption)
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-effectiveFrom">Effective date latest</option>
            <option value="effectiveFrom">Effective date earliest</option>
            <option value="-createdAt">Newest created</option>
            <option value="createdAt">Oldest created</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PeriodConfigTable({
  items,
  loading,
  canManage,
  error,
  onEdit,
}: {
  items: PeriodConfig[];
  loading: boolean;
  canManage: boolean;
  error?: string | null;
  onEdit: (item: PeriodConfig) => void;
}) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Label</th>
              <th className="px-5 py-4 font-semibold">Effective From</th>
              <th className="px-5 py-4 font-semibold">Periods</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr
                    key={`period-config-skeleton-${index}`}
                    className="border-b border-(--line)"
                  >
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-44 animate-pulse rounded bg-(--surface-muted)" />
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
                <td colSpan={5} className="px-5 py-8 text-center text-(--text-dim)">
                  {error
                    ? "Failed to load period configurations."
                    : "No period configurations found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="border-b border-(--line) last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-xs text-(--text-dim)">
                      {item.periods?.length ?? 0} period rows
                    </p>
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {formatEffectiveDate(item.effectiveFrom)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {summarizePeriods(item)}
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
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg bg-(--accent) px-3 text-xs font-semibold text-(--accent-ink) transition hover:opacity-90"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) opacity-70">
                        View only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PeriodConfigPagination({
  page,
  limit,
  meta,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  limit: number;
  meta: PeriodConfigPageProps["meta"];
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

export function PeriodConfigPage({
  items,
  meta,
  searchTerm,
  page,
  limit,
  sort,
  isActive,
  canManage,
  error,
}: PeriodConfigPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(isActive);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PeriodConfig | null>(null);
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
    sort?: PeriodConfigSortOption | null;
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
      defaults: { page: 1, limit: 10, sort: "-effectiveFrom" },
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
        title="Period Configs"
        description="Control the active period grid that powers class scheduling and room allocation."
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
            >
              Create Period Config
            </button>
          ) : (
            <span className="inline-flex rounded-xl border border-(--line) bg-(--surface) px-4 py-2 text-sm font-medium text-(--text-dim)">
              Super admin can manage configs
            </span>
          )
        }
      />

      <PeriodConfigFilters
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
                description: "Fetching period configurations again.",
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

      <PeriodConfigTable
        items={items}
        loading={isPending}
        canManage={canManage}
        error={error}
        onEdit={(item) => setEditItem(item)}
      />

      <PeriodConfigPagination
        page={page}
        limit={limit}
        meta={meta}
        onPageChange={(nextPage) => updateParams({ page: nextPage })}
        onLimitChange={(nextLimit) =>
          updateParams({ limit: nextLimit, page: 1 })
        }
      />

      {canManage ? (
        <>
          <PeriodConfigFormModal
            open={createOpen}
            mode="create"
            onClose={() => setCreateOpen(false)}
            onSaved={handleSaved}
          />

          <PeriodConfigFormModal
            open={Boolean(editItem)}
            mode="edit"
            periodConfig={editItem}
            onClose={() => setEditItem(null)}
            onSaved={handleSaved}
          />
        </>
      ) : null}
    </section>
  );
}
