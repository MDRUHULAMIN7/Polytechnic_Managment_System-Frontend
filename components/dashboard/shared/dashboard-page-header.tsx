import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
};

const DEFAULT_EYEBROW = "Admin Module";
const BASE_CLASS_NAME = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

export function DashboardPageHeader({
  title,
  description,
  action,
  eyebrow = DEFAULT_EYEBROW,
  className,
  contentClassName,
  titleClassName,
}: DashboardPageHeaderProps) {
  return (
    <div className={className ? `${BASE_CLASS_NAME} ${className}` : BASE_CLASS_NAME}>
      <div className={contentClassName}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={titleClassName ? `mt-2 ${titleClassName}` : "mt-2 text-2xl font-semibold tracking-tight"}
        >
          {title}
        </h1>
        {description ? <p className="mt-2 text-sm text-(--text-dim)">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
