"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardRole = "admin" | "superAdmin" | "instructor" | "student";

const DashboardHeaderControls = dynamic(
  () =>
    import("./dashboard-header-controls").then(
      (module) => module.DashboardHeaderControls,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-10 w-10 rounded-xl border border-(--line) bg-(--surface-muted)" />
        <span className="inline-flex h-10 w-26 rounded-xl border border-(--line) bg-(--surface-muted)" />
      </div>
    ),
  },
);

export function DashboardShell({
  role,
  children,
}: Readonly<{
  role?: DashboardRole;
  children: React.ReactNode;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      <div className="mx-auto flex min-h-screen w-full max-w-400">
        <DashboardSidebar
          role={role}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-(--line) bg-(--surface)/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => setMobileOpen(true)}
                whileTap={{ scale: 0.9 }}
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--line) bg-(--surface-muted) lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={17} className="text-(--text-dim)" />
              </motion.button>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Workspace
                </p>
                <p className="text-sm font-semibold tracking-tight">Dashboard</p>
              </div>
            </div>

            <DashboardHeaderControls role={role} />
          </header>

          <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
