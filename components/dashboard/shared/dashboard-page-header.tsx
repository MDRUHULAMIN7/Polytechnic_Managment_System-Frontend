import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
};

const BASE_CLASS_NAME = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

export function DashboardPageHeader({
  title,
  description,
  action,
  className,
  contentClassName,
  titleClassName,
}: DashboardPageHeaderProps) {
  return (
    <div className={className ? `${BASE_CLASS_NAME} ${className}` : BASE_CLASS_NAME}>
      <div className={contentClassName}>
        <h1
          className={titleClassName ?? "text-2xl font-semibold tracking-tight"}
        >
          {title}
        </h1>
        {description ? <p className="mt-2 text-sm text-(--text-dim)">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
