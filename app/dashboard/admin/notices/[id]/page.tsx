import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getNoticeServer } from "@/lib/api/notice/server";
import { formatDate } from "@/utils/common/utils";
import {
  NoticeAudienceBadge,
  NoticePriorityBadge,
  NoticeStatusBadge,
} from "@/components/notice/notice-badges";

export const metadata: Metadata = {
  title: "Notice Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AdminNoticeDetailsPage({ params }: PageProps) {
  let error: string | null = null;
  let notice = null;

  const resolvedParams = await Promise.resolve(params);
  const noticeId = decodeURIComponent(resolvedParams.id ?? "");

  if (!noticeId || noticeId === "undefined" || noticeId === "null") {
    error = "Invalid notice id.";
  } else {
    try {
      notice = await getNoticeServer(noticeId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load notice.";
    }
  }

  return (
    <section className="mx-auto space-y-6">
      <DashboardPageHeader
        title="Notice Details"
        description="Review the full published or draft notice content."
        action={
          <Link
            href="/dashboard/admin/notices"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to Notices
          </Link>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : !notice ? (
        <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-8 text-center text-sm text-(--text-dim)">
          No notice details available.
        </div>
      ) : (
        <article className="space-y-5 rounded-4xl border border-(--line) bg-(--surface) p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-2">
            {notice.isPinned ? (
              <span className="inline-flex items-center rounded-full border border-sky-300/70 bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-600/40 dark:bg-sky-950/45 dark:text-sky-200">
                Pinned
              </span>
            ) : null}
            <NoticePriorityBadge priority={notice.priority} />
            <NoticeAudienceBadge targetAudience={notice.targetAudience} />
            <NoticeStatusBadge status={notice.status} />
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{notice.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-(--text-dim)">
              <span>Category: {notice.category}</span>
              <span>Published: {formatDate(notice.publishedAt)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-(--line) bg-(--surface-muted) px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-(--text)">
              {notice.content}
            </p>
          </div>

          {notice.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {notice.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-(--line) bg-(--surface-muted) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--text-dim)"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {notice.attachments.length ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Attachments</h2>
              <div className="space-y-3">
                {notice.attachments.map((attachment) => (
                  <a
                    key={`${attachment.url}-${attachment.name}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring flex items-center justify-between rounded-xl border border-(--line) px-4 py-3 text-sm transition hover:bg-(--surface-muted)"
                  >
                    <span>{attachment.name}</span>
                    <span className="text-(--text-dim)">
                      {attachment.fileType || "file"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      )}
    </section>
  );
}
