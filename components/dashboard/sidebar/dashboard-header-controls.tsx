"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { DashboardProfileMenu } from "./dashboard-profile-menu";

type DashboardRole = "admin" | "superAdmin" | "instructor" | "student";

export function DashboardHeaderControls({
  role,
}: Readonly<{ role?: DashboardRole }>) {
  return (
    <RealtimeProvider role={role}>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <DashboardProfileMenu />
      </div>
    </RealtimeProvider>
  );
}
