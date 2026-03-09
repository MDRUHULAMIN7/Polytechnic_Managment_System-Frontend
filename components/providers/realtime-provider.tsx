"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
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
type NotificationSoundLevel = "mute" | "soft" | "normal" | "loud";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let notificationAudioContext: AudioContext | null = null;
let notificationAudioUnlocked = false;
const NOTIFICATION_SOUND_STORAGE_KEY = "pms_notification_sound_level";

function getNotificationAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextConstructor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  if (!notificationAudioContext) {
    notificationAudioContext = new AudioContextConstructor();
  }

  return notificationAudioContext;
}

function unlockNotificationAudio() {
  notificationAudioUnlocked = true;
  const context = getNotificationAudioContext();

  if (context?.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
}

function readStoredNotificationSoundLevel(): NotificationSoundLevel {
  if (typeof window === "undefined") {
    return "normal";
  }

  const value = window.localStorage.getItem(NOTIFICATION_SOUND_STORAGE_KEY);
  if (
    value === "mute" ||
    value === "soft" ||
    value === "normal" ||
    value === "loud"
  ) {
    return value;
  }

  return "normal";
}

function persistNotificationSoundLevel(level: NotificationSoundLevel) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NOTIFICATION_SOUND_STORAGE_KEY, level);
}

function soundGain(level: NotificationSoundLevel) {
  if (level === "soft") {
    return 0.08;
  }

  if (level === "loud") {
    return 0.22;
  }

  return 0.14;
}

function playNotificationSound(level: NotificationSoundLevel) {
  if (!notificationAudioUnlocked || level === "mute") {
    return;
  }

  const context = getNotificationAudioContext();
  if (!context || context.state !== "running") {
    return;
  }

  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(soundGain(level), now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  gain.connect(context.destination);

  const firstTone = context.createOscillator();
  firstTone.type = "sine";
  firstTone.frequency.setValueAtTime(784, now);
  firstTone.connect(gain);
  firstTone.start(now);
  firstTone.stop(now + 0.12);

  const secondTone = context.createOscillator();
  secondTone.type = "sine";
  secondTone.frequency.setValueAtTime(1046, now + 0.12);
  secondTone.connect(gain);
  secondTone.start(now + 0.12);
  secondTone.stop(now + 0.24);
}

async function syncNotificationsFromServer({
  setNotifications,
  setUnreadCount,
}: {
  setNotifications: Dispatch<SetStateAction<RealtimeNotification[]>>;
  setUnreadCount: Dispatch<SetStateAction<number>>;
}) {
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
}

type RealtimeContextValue = {
  isConnected: boolean;
  connection: RealtimeConnectionAck | null;
  notifications: RealtimeNotification[];
  unreadCount: number;
  notificationSoundLevel: NotificationSoundLevel;
  setNotificationSoundLevel: (level: NotificationSoundLevel) => void;
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
  const [notificationSoundLevel, setNotificationSoundLevelState] =
    useState<NotificationSoundLevel>(() => readStoredNotificationSoundLevel());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("pointerdown", unlockNotificationAudio, {
      passive: true,
    });
    window.addEventListener("keydown", unlockNotificationAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockNotificationAudio);
      window.removeEventListener("keydown", unlockNotificationAudio);
    };
  }, []);

  const handleNotification = useEffectEvent((notification: RealtimeNotification) => {
    setNotifications((current) => {
      const deduped = current.filter((item) => item.id !== notification.id);
      return [{ ...notification, read: false }, ...deduped].slice(0, 50);
    });
    setUnreadCount((current) => current + 1);
    playNotificationSound(notificationSoundLevel);

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
      void syncNotificationsFromServer({ setNotifications, setUnreadCount });
    }

    void syncNotificationsFromServer({ setNotifications, setUnreadCount });
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
      notificationSoundLevel,
      setNotificationSoundLevel: (level) => {
        unlockNotificationAudio();
        persistNotificationSoundLevel(level);
        setNotificationSoundLevelState(level);
        playNotificationSound(level);
      },
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
          void syncNotificationsFromServer({ setNotifications, setUnreadCount });
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
          void syncNotificationsFromServer({ setNotifications, setUnreadCount });
        }
      },
      clearNotifications: async () => {
        setNotifications([]);
        setUnreadCount(0);

        try {
          await clearAllNotifications();
        } catch {
          void syncNotificationsFromServer({ setNotifications, setUnreadCount });
        }
      },
      refreshNotifications: async () => {
        await syncNotificationsFromServer({ setNotifications, setUnreadCount });
      },
    }),
    [connection, isConnected, notificationSoundLevel, notifications, unreadCount],
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
