"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLatestNotices } from "@/lib/api/notice";
import type { Notice } from "@/lib/type/notice";
import { NoticePriorityBadge } from "@/components/notice/notice-badges";

export function RootNoticeDropdown() {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
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

  async function loadNotices() {
    setIsLoading(true);
    setError(null);

    try {
      const latestData = await getLatestNotices(5);
      const nextNotices = [...latestData.pinned, ...latestData.latest]
        .filter(
          (item, index, collection) =>
            collection.findIndex((entry) => entry._id === item._id) === index,
        )
        .slice(0, 5);

      setNotices(nextNotices);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notices.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && !hasLoaded && !isLoading) {
      void loadNotices();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-(--surface) dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
      >
        <span>Notice Board</span>
        
        
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-14 z-50 w-[min(92vw,440px)] overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_28px_60px_rgba(15,23,42,0.16)] dark:border-(--line) dark:bg-(--surface)"
          >
            <div className=" px-4 py-4 dark:border-(--line) ">
              <div>
                <p className=" font-semibold tracking-tight">Latest Notices</p>
              </div>
            </div>

            <div className="max-h-104 space-y-2 overflow-y-auto px-3 py-3">
              {isLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-(--line) dark:bg-(--surface-muted) dark:text-(--text-dim)">
                  Loading latest notices...
                </div>
              ) : error ? (
                <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadNotices()}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-rose-300 px-3 text-xs font-semibold transition hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-950/40"
                  >
                    Retry
                  </button>
                </div>
              ) : notices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-(--line) dark:bg-(--surface-muted) dark:text-(--text-dim)">
                  No notices available right now.
                </div>
              ) : (
                notices?.map((notice) => (
                  <motion.div
                    key={notice._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-slate-200/80 bg-white/88 px-4 py-3 transition hover:bg-slate-50 dark:border-(--line) dark:bg-(--surface) dark:hover:bg-(--surface-muted)"
                  >
                    <Link
                      href={`/notices/${notice._id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start justify-between gap-y-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {notice.isPinned ? (
                            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-600/40 dark:bg-sky-950/45 dark:text-sky-200">
                              Pinned
                            </span>
                          ) : null}
                          <NoticePriorityBadge priority={notice.priority} />
                        </div>

                        <p className="mt-2 line-clamp-1  font-semibold tracking-tight text-slate-900 dark:text-(--text)">
                          {notice.title}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200  px-3 py-3 dark:border-(--line) ">
              <Link
                href="/notices"
                onClick={() => setOpen(false)}
                className="focus-ring  inline-flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) px-4  font-semibold text-white! transition"
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
