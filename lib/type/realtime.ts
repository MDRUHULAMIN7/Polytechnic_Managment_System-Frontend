export const RealtimeEvent = {
  connected: "realtime:connected",
  notificationCreated: "notification:created",
  classStarted: "class:started",
  classCompleted: "class:completed",
  classCancelled: "class:cancelled",
  attendanceMarked: "attendance:marked",
} as const;

export type RealtimeEventName =
  (typeof RealtimeEvent)[keyof typeof RealtimeEvent];

export type RealtimeNotificationLevel =
  | "info"
  | "success"
  | "warning"
  | "error";

export type RealtimeNotificationKind =
  | "class-started"
  | "class-completed"
  | "class-cancelled"
  | "attendance-marked"
  | "offered-subject-assigned"
  | "offered-subject-removed"
  | "notice-published";

export type RealtimeNotification = {
  id: string;
  kind: RealtimeNotificationKind;
  level: RealtimeNotificationLevel;
  title: string;
  message: string;
  createdAt: string;
  actionUrl?: string;
  meta?: Record<string, unknown>;
  read?: boolean;
  readAt?: string;
};

export type RealtimeConnectionAck = {
  userId: string;
  role: "admin" | "superAdmin" | "instructor" | "student";
  connectedAt: string;
};
