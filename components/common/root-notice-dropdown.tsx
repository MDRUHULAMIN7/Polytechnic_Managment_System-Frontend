"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getLatestNotices } from "@/lib/api/notice";
import type { Notice } from "@/lib/type/notice";
import { NoticePriorityBadge } from "@/components/notice/notice-badges";
import { useAnchoredDropdown } from "@/hooks/use-anchored-dropdown";

type RootNoticeDropdownProps = {
  compact?: boolean;
};

export function RootNoticeDropdown({
  compact = false,
}: Readonly<RootNoticeDropdownProps>) {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { anchorRef, dropdownClassName, dropdownRef, dropdownStyle } =
    useAnchoredDropdown({
    open,
    maxWidth: 440,
    desktopClassName:
      "absolute right-0 top-[calc(100%+0.75rem)] z-[90] w-[min(92vw,440px)] shadow-[0_28px_60px_rgba(15,23,42,0.16)]",
    mobileClassName: "fixed z-[90]",
    });

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
        ref={anchorRef}
        type="button"
        onClick={handleToggle}
        aria-label="Notice board"
        aria-expanded={open}
        className={`focus-ring inline-flex items-center gap-2 border border-(--line)/80 bg-(--surface)/76 text-(--text) shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition hover:bg-(--surface-muted) ${
          compact
            ? "h-10 w-10 justify-center rounded-2xl"
            : "h-10 rounded-2xl px-4 text-sm font-semibold"
        }`}
      >
        <FileText size={16} className="shrink-0 text-(--accent)" />
        {compact ? null : <span>Notice Board</span>}
        {compact ? null : (
          <ChevronDown
            size={16}
            className={`text-(--text-dim) transition ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={dropdownClassName}
            style={dropdownStyle}
          >
            <div className="max-h-full overflow-hidden rounded-[1.6rem] border border-(--line)/80 bg-(--surface)/96 shadow-[0_28px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <div className="border-b border-(--line)/80 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold tracking-tight">Latest Notices</p>
                    <p className="mt-1 text-xs text-(--text-dim)">
                      Pinned and recently published campus updates.
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200">
                    <FileText size={16} />
                  </span>
                </div>
              </div>

              <div className="max-h-[min(26rem,calc(100vh-11rem))] space-y-2 overflow-y-auto px-3 py-3">
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
                  notices.map((notice) => (
                    <motion.div
                      key={notice._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-(--line)/80 bg-(--surface)/88 px-4 py-3 transition hover:bg-(--surface-muted)"
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

                          <p className="mt-2 line-clamp-2 font-semibold tracking-tight text-slate-900 dark:text-(--text)">
                            {notice.title}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="border-t border-(--line)/80 px-3 py-3">
                <Link
                  href="/notices"
                  onClick={() => setOpen(false)}
                  className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-2xl bg-(--accent) px-4 font-semibold text-white transition hover:brightness-110"
                >
                  All Notices
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
