"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  NOTICE_CATEGORIES,
  type Notice,
  type NoticeCategory,
  type PaginationMeta,
} from "@/lib/type/notice";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";
import { NoticeCard } from "./notice-card";

export function NoticeBoardPage({
  items,
  meta,
  category,
  page,
  limit,
  error,
}: Readonly<{
  items: Notice[];
  featured: Notice[];
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
  const [categoryFilter, setCategoryFilter] = useState<NoticeCategory | "">(
    category,
  );

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


  return (
    <section className="space-y-6 bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 dark:bg-transparent">
      <div className="mx-auto space-y-6">
      <header className="mx-auto ">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Notice Board
          </h1>
          <p className=" mt-3 text-base leading-7 text-slate-600 md:text-lg dark:text-(--text-dim)">
            Browse All  published campus notices .
          </p>
      </header>


      <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-(--line) dark:bg-(--surface)">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-inherit">
              Filter by category
            </p>
          
          </div>
          <select
            value={categoryFilter}
            onChange={(event) =>
              {
                const nextValue = event.target.value as NoticeCategory | "";
                setCategoryFilter(nextValue);
                updateParams({
                  category: nextValue || null,
                  page: 1,
                });
              }
            }
            className="focus-ring h-11 rounded-xl border border-slate-200 bg-slate-50/90 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-(--surface) dark:text-inherit"
          >
            <option value="">All categories</option>
            {NOTICE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/75 px-4 py-10 text-center text-sm text-slate-500 dark:border-(--line) dark:bg-(--surface) dark:text-(--text-dim)">
            No notices found for the selected category.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <NoticeCard key={item._id} notice={item} />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between dark:border-(--line) dark:bg-(--surface)">
        <p className="text-sm text-slate-600 dark:text-(--text-dim)">
          Showing page {meta.page} of {meta.totalPage}. Total notices: {meta.total}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={String(limit)}
            onChange={(event) =>
              updateParams({
                limit: Number(event.target.value),
                page: 1,
              })
            }
            className="focus-ring h-10 rounded-xl border border-slate-200 bg-slate-50/90 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-(--surface) dark:text-inherit"
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
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-(--line) dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => updateParams({ page: Math.min(page + 1, meta.totalPage) })}
            disabled={page >= meta.totalPage || isPending}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-(--line) dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
          >
            Next
          </button>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
