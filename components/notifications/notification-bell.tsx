"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Info,
  Megaphone,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRealtimeNotifications } from "@/components/providers/realtime-provider";
import type { RealtimeNotification } from "@/lib/type/realtime";
import { useAnchoredDropdown } from "@/hooks/use-anchored-dropdown";

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "just now";
  }

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 1) {
    return "just now";
  }

  if (Math.abs(diffMinutes) < 60) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      diffMinutes,
      "minute",
    );
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      diffHours,
      "hour",
    );
  }

  const diffDays = Math.round(diffHours / 24);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    diffDays,
    "day",
  );
}

function notificationIcon(level: RealtimeNotification["level"]) {
  if (level === "success") {
    return <CheckCheck size={16} className="text-emerald-500" />;
  }

  if (level === "warning") {
    return <TriangleAlert size={16} className="text-amber-500" />;
  }

  if (level === "error") {
    return <XCircle size={16} className="text-rose-500" />;
  }

  return <Info size={16} className="text-sky-500" />;
}

function itemTone(level: RealtimeNotification["level"], read: boolean | undefined) {
  if (read) {
    return "border-(--line) bg-(--surface)";
  }

  if (level === "success") {
    return "border-emerald-200/70 bg-emerald-50/75 dark:border-emerald-900/50 dark:bg-emerald-950/20";
  }

  if (level === "warning") {
    return "border-amber-200/70 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20";
  }

  if (level === "error") {
    return "border-rose-200/70 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/20";
  }

  return "border-sky-200/70 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/20";
}

function NotificationDropdown({
  onClose,
}: Readonly<{ onClose: () => void }>) {
  const {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useRealtimeNotifications();

  return (
    <div>
      <div className="flex items-start justify-between gap-3 border-b border-(--line) px-4 py-4">
        <div>
          <p className="text-sm font-semibold tracking-tight">Notifications</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-(--text-dim)">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
            <span>&bull;</span>
            <span>{unreadCount} unread</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            className="text-xs font-semibold text-(--accent) transition hover:opacity-80"
          >
            Mark all
          </button>
          <button
            type="button"
            onClick={() => void clearNotifications()}
            className="text-xs font-semibold text-rose-500 transition hover:opacity-80"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="max-h-[min(28rem,calc(100vh-11rem))] space-y-2 overflow-y-auto px-3 py-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--line) bg-(--surface-muted) px-4 py-8 text-center text-sm text-(--text-dim)">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => {
            const body = (
              <div
                className={`rounded-2xl border px-4 py-3 transition ${itemTone(
                  notification.level,
                  notification.read,
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notificationIcon(notification.level)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-sm font-semibold tracking-tight">
                        {notification.title}
                      </p>
                      {!notification.read ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-(--accent)" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-(--text-dim)">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-(--text-dim)">
                      <Megaphone size={12} />
                      <span>{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );

            if (notification.actionUrl) {
              return (
                <Link
                  key={notification.id}
                  href={notification.actionUrl}
                  onClick={() => {
                    void markAsRead(notification.id);
                    onClose();
                  }}
                  className="block"
                >
                  {body}
                </Link>
              );
            }

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => void markAsRead(notification.id)}
                className="block w-full text-left"
              >
                {body}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { unreadCount, isConnected } = useRealtimeNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { anchorRef, dropdownClassName, dropdownRef, dropdownStyle } =
    useAnchoredDropdown({
    open,
    maxWidth: 400,
    desktopClassName:
      "absolute right-0 top-[calc(100%+0.75rem)] z-[90] w-[min(92vw,400px)] overflow-hidden rounded-3xl border border-(--line) shadow-[0_24px_56px_rgba(15,23,42,0.18)]",
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

  const badgeLabel = useMemo(() => {
    if (unreadCount > 99) {
      return "99+";
    }

    return String(unreadCount);
  }, [unreadCount]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-(--line)/80 bg-(--surface)/76 text-(--text-dim) shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition hover:bg-(--surface-muted) ${
          open ? "shadow-[0_12px_28px_rgba(15,23,42,0.14)]" : ""
        }`}
        aria-label="Open notifications"
        title="Notifications"
      >
        <Bell size={17} />
        <span
          className={`absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full border border-(--surface) ${
            isConnected ? "bg-emerald-500" : "bg-slate-400"
          }`}
        />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
            {badgeLabel}
          </span>
        ) : null}
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
            aria-label="Notifications dropdown"
          >
            <div className="max-h-full overflow-hidden rounded-3xl border border-(--line)/80 bg-(--surface)/96 shadow-[0_24px_56px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <NotificationDropdown onClose={() => setOpen(false)} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
