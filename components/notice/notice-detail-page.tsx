"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acknowledgeNotice,
  getNotice,
  markNoticeAsRead,
} from "@/lib/api/notice";
import { ACCESS_TOKEN_COOKIE, readBrowserCookie } from "@/lib/api/dashboard/api";
import { formatDate } from "@/utils/common/utils";
import { showToast } from "@/utils/common/toast";
import {
  NoticeAudienceBadge,
  NoticePriorityBadge,
  NoticeStatusBadge,
} from "./notice-badges";

export function NoticeDetailPage({ noticeId }: Readonly<{ noticeId: string }>) {
  const queryClient = useQueryClient();
  const hasMarkedReadRef = useRef(false);
  const hasAuth = useSyncExternalStore(
    () => () => undefined,
    () => Boolean(readBrowserCookie(ACCESS_TOKEN_COOKIE)),
    () => false,
  );

  const noticeQuery = useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => getNotice(noticeId),
    enabled: Boolean(noticeId),
  });

  const readMutation = useMutation({
    mutationFn: () => markNoticeAsRead(noticeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notice", noticeId] }),
        queryClient.invalidateQueries({ queryKey: ["notices"] }),
        queryClient.invalidateQueries({ queryKey: ["latest-notices"] }),
        queryClient.invalidateQueries({ queryKey: ["notice-unread-count"] }),
      ]);
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: () => acknowledgeNotice(noticeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notice", noticeId] }),
        queryClient.invalidateQueries({ queryKey: ["notices"] }),
        queryClient.invalidateQueries({ queryKey: ["notice-unread-count"] }),
      ]);
      showToast({
        variant: "success",
        title: "Acknowledged",
        description: "Your acknowledgment has been recorded.",
      });
    },
    onError: (error) => {
      showToast({
        variant: "error",
        title: "Unable to acknowledge",
        description:
          error instanceof Error
            ? error.message
            : "Unable to acknowledge this notice.",
      });
    },
  });

  useEffect(() => {
    if (!hasAuth || !noticeQuery.data || hasMarkedReadRef.current) {
      return;
    }

    hasMarkedReadRef.current = true;
    readMutation.mutate();
  }, [hasAuth, noticeQuery.data, readMutation]);

  const notice = noticeQuery.data;

  return (
    <section className="mx-auto space-y-6 bg-slate-50/65 px-4 py-8 sm:px-6 lg:px-8 dark:bg-transparent">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/notices"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-transparent dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
        >
          Back to Notice Board 
        </Link>
        {notice?.status ? <NoticeStatusBadge status={notice.status} /> : null}
      </div>

      {noticeQuery.isLoading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-8 text-center text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-(--line) dark:bg-(--surface) dark:text-(--text-dim)">
          Loading notice details...
        </div>
      ) : noticeQuery.error ? (
        <div className="rounded-2xl border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200">
          {noticeQuery.error instanceof Error
            ? noticeQuery.error.message
            : "Unable to load notice."}
        </div>
      ) : !notice ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-8 text-center text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-(--line) dark:bg-(--surface) dark:text-(--text-dim)">
          Notice not found.
        </div>
      ) : (
        <article className="space-y-5 rounded-4xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.07)] dark:border-(--line) dark:bg-(--surface)">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {notice.isPinned ? (
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-600/40 dark:bg-sky-950/45 dark:text-sky-200">
                  Pinned
                </span>
              ) : null}
              <NoticePriorityBadge priority={notice.priority} />
              <NoticeAudienceBadge targetAudience={notice.targetAudience} />
              {notice.isAcknowledged ? (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-600/40 dark:bg-emerald-950/45 dark:text-emerald-200">
                  Acknowledged
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-inherit">
                {notice.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-(--text-dim)">
                <span>Category: {notice.category}</span>
                <span>Published: {formatDate(notice.publishedAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-5 py-4 dark:border-(--line) dark:bg-(--surface-muted)">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-(--text)">
              {notice.content}
            </p>
          </div>

          {notice.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {notice.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-(--line) dark:bg-(--surface-muted) dark:text-(--text-dim)"
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
                    className="focus-ring flex items-center justify-between rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-(--line) dark:bg-transparent dark:text-inherit dark:hover:bg-(--surface-muted)"
                  >
                    <span>{attachment.name}</span>
                    <span className="text-slate-500 dark:text-(--text-dim)">
                      {attachment.fileType || "file"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {notice.requiresAcknowledgment ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/60 bg-amber-100/70 px-4 py-4 dark:border-amber-700/40 dark:bg-amber-950/30">
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-100">
                  This notice requires acknowledgment.
                </p>
                <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-200">
                  Confirm after you read and understand the instruction.
                </p>
              </div>
              <button
                type="button"
                disabled={
                  acknowledgeMutation.isPending || Boolean(notice.isAcknowledged) || !hasAuth
                }
                onClick={() => acknowledgeMutation.mutate()}
                className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {notice.isAcknowledged
                  ? "Acknowledged"
                  : acknowledgeMutation.isPending
                    ? "Saving..."
                    : hasAuth
                      ? "I Acknowledge"
                      : "Login Required"}
              </button>
            </div>
          ) : null}
        </article>
      )}
    </section>
  );
}
