"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  FileText,
  Paperclip,
  ShieldCheck,
  Tag,
} from "lucide-react";
import {
  acknowledgeNotice,
  getNotice,
  markNoticeAsRead,
} from "@/lib/api/notice";
import type { Notice } from "@/lib/type/notice";
import { formatDate } from "@/utils/common/utils";
import { showToast } from "@/utils/common/toast";
import {
  NoticeAudienceBadge,
  NoticePriorityBadge,
  NoticeStatusBadge,
} from "./notice-badges";

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function noticeSourceName(notice: Notice) {
  if (notice.targetDepartments.length) {
    return notice.targetDepartments[0]?.name ?? "Department Office";
  }

  if (notice.targetAudience === "public") {
    return "Public Affairs";
  }

  return `${toTitleCase(notice.targetAudience)} Desk`;
}

export function NoticeDetailPage({
  noticeId,
  isAuthenticated,
}: Readonly<{ noticeId: string; isAuthenticated: boolean }>) {
  const queryClient = useQueryClient();
  const hasMarkedReadRef = useRef(false);

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
    if (!isAuthenticated || !noticeQuery.data || hasMarkedReadRef.current) {
      return;
    }

    hasMarkedReadRef.current = true;
    readMutation.mutate();
  }, [isAuthenticated, noticeQuery.data, readMutation]);

  const notice = noticeQuery.data;

  return (
    <section className="notice-detail-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/notices"
          className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-(--line) bg-(--surface) px-4 text-sm font-semibold text-(--text-dim) transition hover:border-(--accent) hover:text-(--accent)"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notice Board
        </Link>
        {notice?.status ? <NoticeStatusBadge status={notice.status} /> : null}
      </div>

      {noticeQuery.isLoading ? (
        <div className="notice-detail-shell mt-6 rounded-[2rem] px-4 py-14 text-center text-sm text-(--text-dim)">
          Loading notice details...
        </div>
      ) : noticeQuery.error ? (
        <div className="mt-6 rounded-2xl border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200">
          {noticeQuery.error instanceof Error
            ? noticeQuery.error.message
            : "Unable to load notice."}
        </div>
      ) : !notice ? (
        <div className="notice-detail-shell mt-6 rounded-[2rem] px-4 py-14 text-center text-sm text-(--text-dim)">
          Notice not found.
        </div>
      ) : (
        <article className="mt-6 space-y-8">
          <header className="notice-detail-hero overflow-hidden rounded-[2.5rem] p-8 sm:p-10 lg:p-12">
            <div className="notice-detail-hero-grid grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div>
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

                <h1 className="mt-6 font-display text-4xl font-bold tracking-[-0.05em] text-(--text) sm:text-5xl lg:text-6xl">
                  {notice.title}
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-(--text-dim)">
                  {notice.excerpt?.trim() || "Read the full official notice and related updates below."}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="notice-detail-meta-pill">
                    <CalendarDays className="h-4 w-4" />
                    <span>Published {formatDate(notice.publishedAt)}</span>
                  </div>
                  <div className="notice-detail-meta-pill">
                    <BellRing className="h-4 w-4" />
                    <span>{toTitleCase(notice.category)}</span>
                  </div>
                  <div className="notice-detail-meta-pill">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{noticeSourceName(notice)}</span>
                  </div>
                </div>
              </div>

              <aside className="notice-detail-sidepanel rounded-[2rem] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-(--text-dim)">
                  Notice snapshot
                </p>
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--text-dim)">
                      Audience
                    </p>
                    <p className="mt-2 text-base font-semibold text-(--text)">
                      {toTitleCase(notice.targetAudience)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--text-dim)">
                      Attachments
                    </p>
                    <p className="mt-2 text-base font-semibold text-(--text)">
                      {notice.attachments.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--text-dim)">
                      Tags
                    </p>
                    <p className="mt-2 text-base font-semibold text-(--text)">
                      {notice.tags.length || 0}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-8">
              <section className="notice-detail-shell rounded-[2rem] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="notice-detail-icon">
                    <FileText className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                    Full notice
                  </h2>
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--line)_80%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_72%,transparent)] px-5 py-5">
                  <p className="whitespace-pre-wrap text-[15px] leading-8 text-(--text)">
                    {notice.content}
                  </p>
                </div>
              </section>

              {notice.attachments.length ? (
                <section className="notice-detail-shell rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="notice-detail-icon">
                      <Paperclip className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                      Attachments
                    </h2>
                  </div>
                  <div className="mt-6 space-y-3">
                    {notice.attachments.map((attachment) => (
                      <a
                        key={`${attachment.url}-${attachment.name}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="notice-detail-attachment focus-ring flex items-center justify-between gap-3 rounded-[1.25rem] px-4 py-4 text-sm transition"
                      >
                        <div>
                          <p className="font-semibold text-(--text)">{attachment.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-(--text-dim)">
                            {attachment.fileType || "File"}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-(--accent)" />
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-8">
              {notice.tags.length ? (
                <section className="notice-detail-shell rounded-[2rem] p-6">
                  <div className="flex items-center gap-3">
                    <span className="notice-detail-icon">
                      <Tag className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-xl font-bold tracking-[-0.04em] text-(--text)">
                      Tags
                    </h2>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {notice.tags.map((tag) => (
                      <span key={tag} className="notice-detail-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {notice.requiresAcknowledgment ? (
                <section className="notice-detail-ack rounded-[2rem] p-6">
                  <div className="flex items-start gap-3">
                    <span className="notice-detail-icon notice-detail-icon-amber">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-bold tracking-[-0.04em] text-(--text)">
                        Acknowledgment required
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-(--text-dim)">
                        Confirm after you read and understand the instruction.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={
                      acknowledgeMutation.isPending ||
                      Boolean(notice.isAcknowledged) ||
                      !isAuthenticated
                    }
                    onClick={() => acknowledgeMutation.mutate()}
                    className="notice-detail-ack-button focus-ring mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {notice.isAcknowledged
                      ? "Acknowledged"
                      : acknowledgeMutation.isPending
                        ? "Saving..."
                        : isAuthenticated
                          ? "I Acknowledge"
                          : "Login Required"}
                  </button>
                </section>
              ) : null}
            </aside>
          </div>
        </article>
      )}
      </div>
    </section>
  );
}
