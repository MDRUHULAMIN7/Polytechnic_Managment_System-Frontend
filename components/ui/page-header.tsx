"use client";

import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="rounded-2xl border border-(--line) bg-(--surface) p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-(--text-dim)">{subtitle}</p>
        </div>

        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
    </header>
  );
}
