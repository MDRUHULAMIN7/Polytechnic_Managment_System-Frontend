"use client";

import type { PropsWithChildren } from "react";

type PageShellProps = PropsWithChildren<{
  className?: string;
}>;

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
        className ? className : ""
      }`}
    >
      {children}
    </div>
  );
}

