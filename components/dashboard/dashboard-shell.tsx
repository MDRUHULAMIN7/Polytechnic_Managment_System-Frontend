"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import type { PrivilegedRole, SidebarItem } from "@/lib/constants";
import { sidebarByRole } from "@/lib/constants";
import { clearSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type DashboardShellProps = {
  role: PrivilegedRole;
  children: ReactNode;
};

type DashboardNavListProps = {
  navItems: SidebarItem[];
  pathname: string;
  activeLayoutId?: string;
  onNavigate?: () => void;
};

type WorkspaceBrandProps = {
  role: PrivilegedRole;
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      pathname === "/dashboard/admin" ||
      pathname === "/dashboard/super-admin" ||
      pathname === "/dashboard/instructor" ||
      pathname === "/dashboard/student"
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function WorkspaceBrand({ role }: WorkspaceBrandProps) {
  const roleLabel =
    role === "superAdmin"
      ? "Super Admin"
      : role === "admin"
        ? "Admin"
        : role === "instructor"
          ? "Instructor"
          : "Student";

  return (
    <div>
      <p className="text-[14px] font-semibold uppercase text-(--primary)">
        Polytechnic Management
      </p>
      <h1 className="text-[14px] font-semibold leading-snug tracking-tight text-(--text)">
        {roleLabel}
        <span className="ml-1 font-normal text-(--text-dim)">Workspace</span>
      </h1>
    </div>
  );
}

function DashboardNavList({
  navItems,
  pathname,
  activeLayoutId,
  onNavigate,
}: DashboardNavListProps) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto" aria-label="Dashboard navigation">
      {navItems.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
              active
                ? "font-semibold text-(--primary)"
                : "text-(--text-dim) hover:text-(--text)"
            }`}
          >
            {active ? (
              activeLayoutId ? (
                <motion.span
                  layoutId={activeLayoutId}
                  className="absolute inset-0 rounded-xl bg-(--primary-soft) ring-1 ring-(--primary-soft-line)"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              ) : (
                <span className="absolute inset-0 rounded-xl bg-(--primary-soft) ring-1 ring-(--primary-soft-line)" />
              )
            ) : (
              <span className="absolute inset-0 rounded-xl bg-transparent transition-colors duration-150 group-hover:bg-(--surface-2)" />
            )}

            <Icon
              className={`relative z-10 h-3.75 w-3.75 shrink-0 transition-colors ${
                active
                  ? "text-(--primary)"
                  : "text-(--text-dim) group-hover:text-(--text)"
              }`}
              aria-hidden
            />
            <span className="relative z-10">{item.label}</span>
            {active && (
              <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-(--primary)" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => sidebarByRole[role], [role]);
  const activeItem = useMemo(
    () => navItems.find((item) => isNavItemActive(pathname, item.href)),
    [navItems, pathname],
  );

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="relative h-screen overflow-hidden bg-(--bg)">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(80rem 40rem at -15% 0%, var(--bg-glow-a), transparent 50%), radial-gradient(60rem 30rem at 115% 5%, var(--bg-glow-b), transparent 50%)",
        }}
      />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:flex lg:flex-col">
        <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-(--line) to-transparent" />

        <div className="flex h-full flex-col px-5 py-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <WorkspaceBrand role={role} />
            </div>
          </div>

          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-(--text-dim)">
            Menu
          </p>

          <DashboardNavList
            navItems={navItems}
            pathname={pathname}
            activeLayoutId="active-pill-desktop"
          />

          <div className="my-4 h-px bg-linear-to-r from-transparent via-(--line) to-transparent" />

          <button
            type="button"
            onClick={handleLogout}
            className="focus-ring group flex w-full items-center justify-center gap-2 rounded-xl border border-(--line) bg-(--surface) py-2.5 text-sm font-semibold text-(--text-dim) transition-all duration-150 hover:border-(--danger-line) hover:text-(--danger)"
          >
            <LogOut
              className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5"
              aria-hidden
            />
            Logout
          </button>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 lg:left-72">
        <div className="absolute inset-0 backdrop-blur-xl" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--bg-glow-a) 60%, transparent), color-mix(in srgb, var(--bg) 80%, transparent) 50%, color-mix(in srgb, var(--bg-glow-b) 40%, transparent))",
          }}
        />
        <div className="absolute inset-0 bg-(--bg)/55" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-(--line) to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--primary) to-transparent opacity-30" />

        <div className="relative flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm font-semibold lg:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 text-sm">
              <span className="hidden font-medium text-(--text-dim) sm:inline">Workspace</span>
              <span className="hidden text-(--text-dim)/30 sm:inline">/</span>
              <span className="font-semibold text-(--text)">{activeItem?.label ?? "Overview"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="focus-ring group inline-flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-3.5 py-2 text-sm font-semibold text-(--text-dim) transition-all duration-150 hover:border-(--danger-line) hover:text-(--danger)"
            >
              <LogOut
                className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5"
                aria-hidden
              />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative h-screen overflow-y-auto px-4 pb-10 pt-20 sm:px-6 lg:pl-80 lg:pr-8">
        <div className="mx-auto w-full max-w-350">{children}</div>
      </main>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              aria-label="Close sidebar overlay"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-(--line) bg-(--frost-strong) px-5 py-6 backdrop-blur-xl lg:hidden"
            >
              <MobileSidebarContent
                pathname={pathname}
                navItems={navItems}
                role={role}
                onClose={() => setOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

type MobileSidebarContentProps = {
  pathname: string;
  navItems: SidebarItem[];
  role: PrivilegedRole;
  onLogout: () => void;
  onClose: () => void;
};

function MobileSidebarContent({
  pathname,
  navItems,
  role,
  onLogout,
  onClose,
}: MobileSidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <WorkspaceBrand role={role} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring rounded-xl border border-(--line) p-2"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-(--text-dim)">
        Menu
      </p>

      <DashboardNavList
        navItems={navItems}
        pathname={pathname}
        onNavigate={onClose}
      />

      <div className="my-4 h-px bg-linear-to-r from-transparent via-(--line) to-transparent" />

      <div className="flex items-center justify-between">
        <ThemeToggle />
        <button
          type="button"
          onClick={onLogout}
          className="focus-ring group flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-3.5 py-2 text-xs font-semibold text-(--text-dim) transition-all duration-150 hover:border-(--danger-line) hover:text-(--danger)"
        >
          <LogOut className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden />
          Logout
        </button>
      </div>
    </div>
  );
}
