import Link from "next/link";
import type { Notice } from "@/lib/type/notice";
import { formatDate } from "@/utils/common/utils";
import { NoticePriorityBadge } from "./notice-badges";

export function NoticeCard({
  notice,
  href = `/notices/${notice._id}`,
  actions,
}: Readonly<{
  notice: Notice;
  href?: string;
  actions?: React.ReactNode;
}>) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] dark:border-(--line) dark:bg-(--surface)">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {notice.isPinned ? (
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-600/40 dark:bg-sky-950/45 dark:text-sky-200">
                Pinned
              </span>
            ) : null}
            <NoticePriorityBadge priority={notice.priority} />
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2  py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
              {notice.category}
            </span>
          </div>

          <div>
            <Link
              href={href}
              className="text-xl md:text-2xl capitalize font-semibold tracking-tight text-slate-900 transition hover:text-(--accent) dark:text-inherit"
            >
              {notice.title}
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 text-xs capitalize tracking-[0.16em] text-slate-500 dark:text-(--text-dim)">
            <span>Published {formatDate(notice.publishedAt)}</span>
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </article>
  );
}
