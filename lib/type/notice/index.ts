export type NoticeTargetAudience =
  | "student"
  | "instructor"
  | "admin"
  | "public";

export type NoticeCategory =
  | "academic"
  | "exam"
  | "holiday"
  | "event"
  | "administrative"
  | "urgent"
  | "general";

export type NoticePriority = "normal" | "important" | "urgent";
export type NoticeStatus = "draft" | "published" | "archived";

export type NoticeAttachment = {
  name: string;
  url: string;
  fileType?: string;
  size?: number;
};

export type NoticeDepartment = {
  _id: string;
  name: string;
};

export type Notice = {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  attachments: NoticeAttachment[];
  targetAudience: NoticeTargetAudience;
  targetDepartments: NoticeDepartment[];
  category: NoticeCategory;
  tags: string[];
  priority: NoticePriority;
  isPinned: boolean;
  publishedAt: string;
  expiresAt?: string;
  requiresAcknowledgment: boolean;
  status: NoticeStatus;
  createdBy: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
  isAcknowledged?: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type NoticeListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  category?: NoticeCategory | "all";
  priority?: NoticePriority | "all";
  targetAudience?: NoticeTargetAudience | "all";
  status?: NoticeStatus | "all";
  sort?: "latest" | "oldest";
  includeExpired?: boolean;
};

export type NoticeListPayload = {
  result: Notice[];
  meta: PaginationMeta;
};

export type LatestNoticePayload = {
  pinned: Notice[];
  latest: Notice[];
};

export type NoticeInput = {
  title: string;
  content: string;
  attachments?: NoticeAttachment[];
  targetAudience: NoticeTargetAudience;
  category: NoticeCategory;
  tags?: string[];
  priority: NoticePriority;
  isPinned?: boolean;
  publishedAt?: string;
  expiresAt?: string;
  requiresAcknowledgment?: boolean;
  status?: NoticeStatus;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errorSources?: {
    path?: string;
    message?: string;
  }[];
};

export const NOTICE_CATEGORIES: NoticeCategory[] = [
  "academic",
  "exam",
  "holiday",
  "event",
  "administrative",
  "urgent",
  "general",
];

export const NOTICE_PRIORITIES: NoticePriority[] = [
  "normal",
  "important",
  "urgent",
];

export const NOTICE_STATUSES: NoticeStatus[] = [
  "draft",
  "published",
  "archived",
];

export const NOTICE_AUDIENCES: NoticeTargetAudience[] = [
  "public",
  "student",
  "instructor",
  "admin",
];
