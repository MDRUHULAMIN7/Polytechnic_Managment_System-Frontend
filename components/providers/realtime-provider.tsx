"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearAllNotifications,
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notification";
import { realtimeSocketClient } from "@/lib/socket/socket-client";
import {
  RealtimeEvent,
  type RealtimeConnectionAck,
  type RealtimeNotification,
} from "@/lib/type/realtime";
import { showToast } from "@/utils/common/toast";

type DashboardRole = "admin" | "superAdmin" | "instructor" | "student";

type RealtimeContextValue = {
  isConnected: boolean;
  connection: RealtimeConnectionAck | null;
  notifications: RealtimeNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

function toastVariantFor(level: RealtimeNotification["level"]) {
  if (level === "success") {
    return "success" as const;
  }

  if (level === "error") {
    return "error" as const;
  }

  return "info" as const;
}

export function RealtimeProvider({
  role,
  children,
}: Readonly<{ role?: DashboardRole; children: React.ReactNode }>) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<RealtimeConnectionAck | null>(null);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useEffectEvent(async () => {
    try {
      const [nextNotifications, nextUnreadCount] = await Promise.all([
        getMyNotifications(20),
        getUnreadNotificationCount(),
      ]);

      setNotifications(nextNotifications);
      setUnreadCount(nextUnreadCount);
    } catch {
      // Keep layout stable even if notification sync fails temporarily.
    }
  });

  const handleNotification = useEffectEvent((notification: RealtimeNotification) => {
    setNotifications((current) => {
      const deduped = current.filter((item) => item.id !== notification.id);
      return [{ ...notification, read: false }, ...deduped].slice(0, 50);
    });
    setUnreadCount((current) => current + 1);

    showToast({
      variant: toastVariantFor(notification.level),
      title: notification.title,
      description: notification.message,
      durationMs: notification.level === "warning" ? 5200 : 4200,
    });

    if (
      notification.kind === "class-started" ||
      notification.kind === "class-completed" ||
      notification.kind === "class-cancelled" ||
      notification.kind === "attendance-marked" ||
      notification.kind === "offered-subject-assigned" ||
      notification.kind === "offered-subject-removed" ||
      notification.kind === "notice-published"
    ) {
      startTransition(() => router.refresh());
    }
  });

  useEffect(() => {
    if (!role) {
      return;
    }

    const socket = realtimeSocketClient.connect();
    if (!socket) {
      return;
    }

    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handleConnected(payload: RealtimeConnectionAck) {
      setConnection(payload);
      setIsConnected(true);
      void refreshNotifications();
    }

    void refreshNotifications();
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on(RealtimeEvent.connected, handleConnected);
    socket.on(RealtimeEvent.notificationCreated, handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off(RealtimeEvent.connected, handleConnected);
      socket.off(RealtimeEvent.notificationCreated, handleNotification);
      realtimeSocketClient.disconnect();
      setIsConnected(false);
      setConnection(null);
      setNotifications([]);
      setUnreadCount(0);
    };
  }, [role]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      isConnected,
      connection,
      notifications,
      unreadCount,
      markAsRead: async (id: string) => {
        const target = notifications.find((item) => item.id === id);

        if (!target || target.read) {
          return;
        }

        setNotifications((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, read: true, readAt: new Date().toISOString() }
              : item,
          ),
        );
        setUnreadCount((current) => Math.max(current - 1, 0));

        try {
          await markNotificationAsRead(id);
        } catch {
          void refreshNotifications();
        }
      },
      markAllAsRead: async () => {
        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            read: true,
            readAt: item.readAt ?? new Date().toISOString(),
          })),
        );
        setUnreadCount(0);

        try {
          await markAllNotificationsAsRead();
        } catch {
          void refreshNotifications();
        }
      },
      clearNotifications: async () => {
        setNotifications([]);
        setUnreadCount(0);

        try {
          await clearAllNotifications();
        } catch {
          void refreshNotifications();
        }
      },
      refreshNotifications: async () => {
        await refreshNotifications();
      },
    }),
    [connection, isConnected, notifications, refreshNotifications, unreadCount],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtimeNotifications() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtimeNotifications must be used within RealtimeProvider");
  }

  return context;
}
