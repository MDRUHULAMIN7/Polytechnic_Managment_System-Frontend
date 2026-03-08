import type {
  NoticePriority,
  NoticeStatus,
  NoticeTargetAudience,
} from "@/lib/type/notice";

const priorityClassMap: Record<NoticePriority, string> = {
  normal:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
  important:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-600/40 dark:bg-amber-950/50 dark:text-amber-200",
  urgent:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/45 dark:text-rose-200",
};

const statusClassMap: Record<NoticeStatus, string> = {
  draft:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
  published:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-600/40 dark:bg-emerald-950/45 dark:text-emerald-200",
  archived:
    "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200",
};

const audienceLabelMap: Record<NoticeTargetAudience, string> = {
  public: "Public",
  student: "Student",
  instructor: "Instructor",
  admin: "Admin",
};

function badgeClassName(colorClass: string) {
  return `inline-flex items-center rounded-full border px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.16em] ${colorClass}`;
}

export function NoticePriorityBadge({ priority }: { priority: NoticePriority }) {
  return (
    <span className={badgeClassName(priorityClassMap[priority])}>{priority}</span>
  );
}

export function NoticeStatusBadge({ status }: { status: NoticeStatus }) {
  return <span className={badgeClassName(statusClassMap[status])}>{status}</span>;
}

export function NoticeAudienceBadge({
  targetAudience,
}: {
  targetAudience: NoticeTargetAudience;
}) {
  return (
    <span className={badgeClassName(statusClassMap.draft)}>
      {audienceLabelMap[targetAudience]}
    </span>
  );
}
