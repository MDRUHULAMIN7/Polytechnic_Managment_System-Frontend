import type { ReactNode } from "react";

type DashboardErrorBannerProps = {
  error?: string | null;
  action?: ReactNode;
};

export function DashboardErrorBanner({ error, action }: DashboardErrorBannerProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {error}
      {action}
    </div>
  );
}
