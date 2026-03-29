"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LibraryBig,
  Megaphone,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  NOTICE_CATEGORIES,
  type Notice,
  type NoticeCategory,
  type PaginationMeta,
} from "@/lib/type/notice";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { formatDate } from "@/utils/common/utils";

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function semesterLabelFromToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (month >= 0 && month <= 4) {
    return `Spring ${year}`;
  }

  if (month >= 5 && month <= 7) {
    return `Summer ${year}`;
  }

  return `Fall ${year}`;
}

function noticeAccentClass(notice: Notice) {
  if (notice.priority === "urgent" || notice.category === "urgent") {
    return "notice-board-card-urgent";
  }

  if (notice.category === "event") {
    return "notice-board-card-event";
  }

  if (notice.priority === "important") {
    return "notice-board-card-important";
  }

  return "notice-board-card-default";
}

function noticeBadgeClass(notice: Notice) {
  if (notice.priority === "urgent" || notice.category === "urgent") {
    return "notice-board-pill notice-board-pill-urgent";
  }

  if (notice.category === "event") {
    return "notice-board-pill notice-board-pill-event";
  }

  if (notice.priority === "important") {
    return "notice-board-pill notice-board-pill-important";
  }

  return "notice-board-pill notice-board-pill-neutral";
}

function noticeSource(notice: Notice) {
  if (notice.targetDepartments.length) {
    return notice.targetDepartments[0]?.name ?? "Department Office";
  }

  if (notice.targetAudience === "public") {
    return "Public Affairs";
  }

  return `${toTitleCase(notice.targetAudience)} Desk`;
}

function noticeSummary(notice: Notice) {
  if (notice.excerpt?.trim()) {
    return notice.excerpt.trim();
  }

  if (notice.content?.trim()) {
    return notice.content.trim();
  }

  return "Open the full notice to read the complete instruction and related updates.";
}

function noticeSearchText(notice: Notice) {
  return [
    notice.title,
    notice.excerpt,
    notice.content,
    notice.category,
    notice.priority,
    notice.targetAudience,
    notice.targetDepartments.map((department) => department.name).join(" "),
    notice.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function noticeMetaLabel(notice: Notice) {
  if (notice.targetDepartments.length) {
    return notice.targetDepartments[0]?.name ?? noticeSource(notice);
  }

  return noticeSource(notice);
}

function trendLabel(notice: Notice) {
  if (notice.isPinned) {
    return "Pinned";
  }

  if (notice.priority === "urgent") {
    return "Urgent";
  }

  if (notice.priority === "important") {
    return "Priority";
  }

  return "Recent";
}

export function NoticeBoardPage({
  items,
  meta,
  category,
  page,
  limit,
  error,
}: Readonly<{
  items: Notice[];
  meta: PaginationMeta;
  category: NoticeCategory | "";
  page: number;
  limit: number;
  error: string | null;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [categoryFilter, setCategoryFilter] = useState<NoticeCategory | "">(category);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCategoryFilter(category);
  }, [category]);

  function updateParams(next: {
    category?: NoticeCategory | "" | null;
    page?: number | null;
    limit?: number | null;
  }) {
    updateListSearchParams({
      pathname,
      searchParams,
      router,
      startTransition,
      entries: [
        ["category", next.category],
        ["page", next.page],
        ["limit", next.limit],
      ],
      defaults: { page: 1, limit: 10 },
    });
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedSearchTerm) {
      return items;
    }

    return items.filter((item) => noticeSearchText(item).includes(normalizedSearchTerm));
  }, [items, normalizedSearchTerm]);

  const trendingItems = useMemo(() => {
    return [...items]
      .sort((left, right) => {
        const leftWeight =
          Number(left.isPinned) * 3 +
          (left.priority === "urgent" ? 2 : left.priority === "important" ? 1 : 0);
        const rightWeight =
          Number(right.isPinned) * 3 +
          (right.priority === "urgent" ? 2 : right.priority === "important" ? 1 : 0);

        return rightWeight - leftWeight;
      })
      .slice(0, 3);
  }, [items]);

  const departmentFeed = useMemo(() => {
    return items
      .filter((item) => item.targetDepartments.length > 0)
      .slice(0, 2);
  }, [items]);

  const visibleCount = filteredItems.length;
  const semesterLabel = semesterLabelFromToday();
  const hasSearch = normalizedSearchTerm.length > 0;

  return (
    <section className="notice-board-page px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="notice-board-kicker">Official communication</span>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.06em] text-(--text) sm:text-6xl">
              Board of Notices
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-(--text-dim)">
              Access real-time updates from departments, academic council, and administrative offices of RPI Polytechnic.
            </p>
          </div>

          <div className="hidden md:flex md:flex-col md:items-end md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-(--text-dim)">
              Active semester
            </span>
            <span className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
              {semesterLabel}
            </span>
          </div>
        </div>

        <section className="notice-board-filter sticky top-22 z-40 mb-12 rounded-[2rem] p-3 sm:top-24">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-dim)" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search institutional announcements..."
                className="notice-board-search w-full rounded-full border border-transparent bg-transparent py-3 pl-12 pr-4 text-sm text-(--text) outline-none"
              />
            </label>

            <div className="hidden h-8 w-px bg-[color:color-mix(in_srgb,var(--line)_70%,transparent)] lg:block" />

            <label className="notice-board-select-wrap relative block w-full lg:w-[18rem]">
              <span className="mb-2 block pl-1 text-[10px] font-bold uppercase tracking-[0.22em] text-(--text-dim)">
                Notice category
              </span>
              <select
                value={categoryFilter}
                onChange={(event) => {
                  const nextValue = event.target.value as NoticeCategory | "";
                  setCategoryFilter(nextValue);
                  updateParams({
                    category: nextValue || null,
                    page: 1,
                  });
                }}
                className="notice-board-select focus-ring h-12 w-full appearance-none rounded-full px-4 pr-12 text-sm font-semibold text-(--text) outline-none"
              >
                <option value="">All Notices</option>
                {NOTICE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {toTitleCase(item)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-[2.1rem] h-4 w-4 text-(--text-dim)" />
            </label>
          </div>
        </section>

        {error ? (
          <div className="mb-8 rounded-[1.5rem] border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {filteredItems.length === 0 ? (
              <div className="notice-board-empty flex flex-col items-center justify-center rounded-[2rem] px-6 py-28 text-center">
                <BellRing className="h-14 w-14 text-(--text-dim)" />
                <h3 className="mt-6 font-display text-3xl font-bold tracking-[-0.04em] text-(--text)">
                  No matching notices found
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-(--text-dim)">
                  Try changing the category filter or search term to find the notice you need.
                </p>
                {(hasSearch || categoryFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("");
                      updateParams({ category: null, page: 1 });
                    }}
                    className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-(--line) bg-(--surface) px-6 text-xs font-bold uppercase tracking-[0.18em] text-(--text)"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((notice) => (
                <article
                  key={notice._id}
                  className={`notice-board-card group ${noticeAccentClass(notice)}`}
                >
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={noticeBadgeClass(notice)}>
                        {notice.priority === "urgent" || notice.category === "urgent"
                          ? "Urgent"
                          : toTitleCase(notice.category)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-(--text-dim)">
                        {noticeMetaLabel(notice)}
                      </span>
                      {notice.isPinned ? (
                        <span className="notice-board-subpill">Pinned</span>
                      ) : null}
                      {notice.requiresAcknowledgment ? (
                        <span className="notice-board-subpill">Requires acknowledgment</span>
                      ) : null}
                    </div>

                    <time className="text-[10px] font-semibold uppercase tracking-[0.22em] text-(--text-dim)">
                      {formatDate(notice.publishedAt)}
                    </time>
                  </div>

                  <h2 className="font-display text-3xl font-bold leading-tight tracking-[-0.04em] text-(--text) transition group-hover:text-(--accent)">
                    {notice.title}
                  </h2>
                  <p className="line-clamp-2 mt-4 text-base leading-8 text-(--text-dim)">
                    {noticeSummary(notice)}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {notice.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="notice-board-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-[color:color-mix(in_srgb,var(--line)_70%,transparent)] pt-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="notice-board-avatar">
                        {noticeMetaLabel(notice).charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-sm font-semibold text-(--text)">
                        {noticeMetaLabel(notice)}
                      </span>
                    </div>

                    <Link
                      href={`/notices/${notice._id}`}
                      className="focus-ring inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-(--accent) transition hover:gap-3"
                    >
                      Read Full Notice
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            )}

            <div className="notice-board-pagination flex flex-col gap-4 rounded-[1.5rem] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm text-(--text-dim)">
                  Showing {visibleCount} notice{visibleCount === 1 ? "" : "s"} on page {meta.page} of {meta.totalPage}.
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                  Total published notices: {meta.total}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={String(limit)}
                  onChange={(event) =>
                    updateParams({
                      limit: Number(event.target.value),
                      page: 1,
                    })
                  }
                  className="focus-ring h-11 rounded-full border border-(--line) bg-(--surface) px-4 text-sm text-(--text)"
                >
                  {[10, 20].map((item) => (
                    <option key={item} value={item}>
                      {item} per page
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
                    disabled={page <= 1 || isPending}
                    className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-(--line) bg-(--surface) px-4 text-sm font-semibold text-(--text-dim) transition hover:border-(--accent) hover:text-(--accent) disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => updateParams({ page: Math.min(page + 1, meta.totalPage) })}
                    disabled={page >= meta.totalPage || isPending}
                    className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-(--line) bg-(--surface) px-4 text-sm font-semibold text-(--text-dim) transition hover:border-(--accent) hover:text-(--accent) disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-10 lg:col-span-4">
            <section>
              <h3 className="flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                <TrendingUp className="h-5 w-5 text-(--accent)" />
                Trending Now
              </h3>

              <div className="mt-6 space-y-4">
                {trendingItems.length ? (
                  trendingItems.map((notice) => (
                    <Link
                      key={notice._id}
                      href={`/notices/${notice._id}`}
                      className="notice-board-sidecard block"
                    >
                      <span className="notice-board-sidecard-kicker">
                        {trendLabel(notice)}
                      </span>
                      <p className="mt-2 text-sm font-semibold leading-6 text-(--text)">
                        {notice.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="notice-board-sidecard">
                    <p className="text-sm leading-6 text-(--text-dim)">
                      Trending notices will appear here when more updates are published.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="notice-board-dept rounded-[2rem] p-8 text-white">
              <h3 className="font-display text-2xl font-bold tracking-[-0.04em]">
                Departmental Feed
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Quick updates from specialized faculties and administrative desks.
              </p>

              <div className="mt-8 space-y-6">
                {departmentFeed.length ? (
                  departmentFeed.map((notice) => (
                    <div key={notice._id} className="flex gap-4">
                      <div className="w-1 shrink-0 rounded-full bg-sky-400" />
                      <div>
                        <h4 className="inline-flex rounded-sm bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">
                          {noticeMetaLabel(notice)}
                        </h4>
                        <p className="mt-3 text-sm font-medium leading-6 text-white">
                          {noticeSummary(notice)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4 text-sm leading-6 text-white/72">
                    Department-specific notices will show here when target departments are published.
                  </div>
                )}
              </div>

              <Link
                href="/academic-instructors"
                className="notice-board-dept-button focus-ring mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-xs font-bold uppercase tracking-[0.18em]"
              >
                Select Department
              </Link>
            </section>

            <article className="notice-board-promo group relative overflow-hidden rounded-[2rem]">
              <div className="notice-board-promo-bg absolute inset-0" />
              <div className="relative z-10 flex min-h-[29rem] flex-col justify-between p-8">
                <div className="flex items-center justify-between">
                  <span className="notice-board-subpill bg-white/12 text-white">
                    Institutional pulse
                  </span>
                  <LibraryBig className="h-5 w-5 text-sky-200" />
                </div>

                <div>
                  <h4 className="font-display text-3xl font-bold tracking-[-0.04em] text-white">
                    Shaping the future
                  </h4>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-white/78">
                    Follow campus notices, event calls, and academic decisions from one editorial board.
                  </p>

                  <div className="mt-8 grid gap-3">
                    <div className="notice-board-promo-stat">
                      <Megaphone className="h-4 w-4 text-sky-300" />
                      <span>Public announcements</span>
                    </div>
                    <div className="notice-board-promo-stat">
                      <CalendarDays className="h-4 w-4 text-sky-300" />
                      <span>Academic schedule updates</span>
                    </div>
                    <div className="notice-board-promo-stat">
                      <Building2 className="h-4 w-4 text-sky-300" />
                      <span>Department-led communication</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
