"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Notice } from "@/lib/type/notice";
import { NoticePriorityBadge } from "@/components/notice/notice-badges";

export function RootNoticeDropdown({
  notices,
}: Readonly<{ notices: Notice[] }>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-(--surface) dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
      >
        <span>Notice Board</span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-700 dark:bg-(--surface-muted) dark:text-(--text)">
          {notices.length}
        </span>
        <span className="text-xs">{open ? "Hide" : "Open"}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-13 z-50 w-[min(92vw,440px)] overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/95 shadow-[0_28px_60px_rgba(15,23,42,0.16)] dark:border-(--line) dark:bg-(--surface)"
          >
            <div className="border-b border-slate-200  px-4 py-4 dark:border-(--line) ">
              <div>
                <p className="text-sm font-semibold tracking-tight">Latest Notices</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-(--text-dim)">
                  Quick glance before opening the full board.
                </p>
              </div>
            </div>

            <div className="max-h-104 space-y-2 overflow-y-auto px-3 py-3">
              {notices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-(--line) dark:bg-(--surface-muted) dark:text-(--text-dim)">
                  No notices available right now.
                </div>
              ) : (
                notices.map((notice) => (
                  <motion.div
                    key={notice._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 transition hover:bg-slate-50 dark:border-(--line) dark:bg-(--surface) dark:hover:bg-(--surface-muted)"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {notice.isPinned ? (
                            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-600/40 dark:bg-sky-950/45 dark:text-sky-200">
                              Pinned
                            </span>
                          ) : null}
                          <NoticePriorityBadge priority={notice.priority} />
                        </div>

                        <p className="mt-2 line-clamp-1 text-sm font-semibold tracking-tight text-slate-900 dark:text-(--text)">
                          {notice.title}
                        </p>
                      </div>

                      <Link
                        href={`/notices/${notice._id}`}
                        onClick={() => setOpen(false)}
                        className="focus-ring inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-transparent dark:text-(--text-dim) dark:hover:bg-(--surface)"
                      >
                        Details
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 bg-white/92 px-3 py-3 dark:border-(--line) dark:bg-(--surface)">
              <Link
                href="/notices"
                onClick={() => setOpen(false)}
                className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
              >
                All Notices
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
