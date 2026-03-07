"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookUser,
  CalendarDays,
  Building2,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Layers,
  BookOpen,
  ShieldCheck,
  UserRound,
  Users,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { removeCookie } from "@/utils/common/cookie";
import { showToast } from "@/utils/common/toast";
import { ThemeToggle } from "@/components/common/theme-toggle";

type DashboardRole = "admin" | "superAdmin" | "instructor" | "student";

type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const adminItems: SidebarItem[] = [
  { href: "/dashboard/admin", label: "Admin Home", icon: ShieldCheck },
  { href: "/dashboard/admin/academic-instructors", label: "Academic Instructors", icon: BookUser },
  { href: "/dashboard/admin/academic-departments", label: "Academic Departments", icon: Building2 },
  { href: "/dashboard/admin/academic-semesters", label: "Academic Semesters", icon: CalendarDays },
  { href: "/dashboard/admin/semester-registrations", label: "Semester Registrations", icon: ClipboardList },
  { href: "/dashboard/admin/offered-subjects", label: "Offered Subjects", icon: BookOpen },
  { href: "/dashboard/admin/classes", label: "Classes", icon: ClipboardCheck },
  { href: "/dashboard/admin/curriculums", label: "Curriculums", icon: Layers },
  { href: "/dashboard/admin/semester-enrollments", label: "Semester Enrollments", icon: ClipboardCheck },
  { href: "/dashboard/admin/subjects", label: "Subjects", icon: BookUser },
  { href: "/dashboard/admin/students", label: "Students", icon: Users },
  { href: "/dashboard/admin/instructors", label: "Instructors", icon: GraduationCap },
];

const superAdminItems: SidebarItem[] = [
  ...adminItems,
  { href: "/dashboard/admin/admins", label: "Admins", icon: ShieldCheck },
];

const instructorItems: SidebarItem[] = [
  { href: "/dashboard/instructor", label: "Instructor Home", icon: BookUser },
  { href: "/dashboard/instructor/academic-semesters", label: "Academic Semesters", icon: CalendarDays },
  { href: "/dashboard/instructor/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dashboard/instructor/semester-registrations", label: "Semester Registrations", icon: ClipboardList },
  { href: "/dashboard/instructor/offered-subjects", label: "Offered Subjects", icon: BookOpen },
  { href: "/dashboard/instructor/classes", label: "Classes", icon: ClipboardCheck },
  { href: "/dashboard/instructor/curriculums", label: "Curriculums", icon: Layers },
  { href: "/dashboard/instructor/semester-enrollments", label: "Semester Enrollments", icon: ClipboardCheck },
];

const sidebarItems: Record<DashboardRole, SidebarItem[]> = {
  admin: adminItems,
  superAdmin: superAdminItems,
  instructor: instructorItems,
  student: [
    { href: "/dashboard/student", label: "Student Home", icon: GraduationCap },
    { href: "/dashboard/student/academic-semesters", label: "Academic Semesters", icon: CalendarDays },
    { href: "/dashboard/student/subjects", label: "Subjects", icon: BookOpen },
    { href: "/dashboard/student/semester-registrations", label: "Semester Registrations", icon: ClipboardList },
    { href: "/dashboard/student/enrolled-subjects", label: "Enrolled Subjects", icon: BookOpen },
    { href: "/dashboard/student/classes", label: "Classes", icon: ClipboardCheck },
    { href: "/dashboard/student/curriculums", label: "Curriculums", icon: Layers },
    { href: "/dashboard/student/semester-enrollments", label: "Semester Enrollments", icon: ClipboardCheck },
  ],
};

function rootPath(role: DashboardRole | undefined): string {
  if (role === "student") return "/dashboard/student";
  if (role === "instructor") return "/dashboard/instructor";
  return "/dashboard/admin";
}

function clearSessionCookies() {
  removeCookie("pms_role");
  removeCookie("pms_access_token");
}

function resolveActiveHref(items: SidebarItem[], pathname: string) {
  const exact = items.find((item) => pathname === item.href);
  if (exact) {
    return exact.href;
  }

  let bestMatch = "";
  for (const item of items) {
    if (pathname.startsWith(`${item.href}/`) && item.href.length > bestMatch.length) {
      bestMatch = item.href;
    }
  }

  return bestMatch;
}

function NavItem({
  item,
  active,
  index,
  onClose,
}: {
  item: SidebarItem;
  active: boolean;
  index: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={item.href}
        onClick={onClose}
        className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200"
        style={{
          color: active ? "var(--sidebar-nav-text-active)" : "var(--sidebar-nav-text)",
        }}
      >
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl"
              style={{
                background: "var(--sidebar-active-bg)",
                border: "1px solid var(--sidebar-active-border)",
                boxShadow: "var(--sidebar-active-shadow)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          )}
        </AnimatePresence>

        {!active && (
          <div
            className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background: "var(--sidebar-nav-hover-bg)",
              border: "1px solid var(--sidebar-nav-hover-border)",
            }}
          />
        )}

        <motion.div
          className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: active ? "var(--sidebar-icon-bg-active)" : "var(--sidebar-icon-bg)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
        >
          <item.icon size={15} />
        </motion.div>

        <span className="relative z-10 font-medium">{item.label}</span>
        {active && (
          <motion.div
            layoutId="active-dot"
            className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--sidebar-dot)" }}
          />
        )}
      </Link>
    </motion.div>
  );
}

function SidebarActionLink({
  href,
  active,
  onClose,
}: {
  href: string;
  active: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border transition"
      style={{
        borderColor: active
          ? "var(--sidebar-active-border)"
          : "var(--sidebar-border)",
        background: active ? "var(--sidebar-active-bg)" : "var(--surface)",
        color: active
          ? "var(--sidebar-nav-text-active)"
          : "var(--sidebar-nav-text)",
      }}
      aria-label="Open profile"
      title="Profile"
    >
      <UserRound size={17} />
    </Link>
  );
}

export function DashboardSidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role?: DashboardRole;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role ? sidebarItems[role] : [];
  const activeHref = resolveActiveHref(items, pathname);
  const profileActive = pathname === "/dashboard/profile";

  function logout() {
    clearSessionCookies();
    showToast({ variant: "info", title: "Logged out", description: "You have been signed out." });
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <aside
      className="flex h-full w-72 flex-col"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40"
        style={{
          background: "var(--sidebar-top-glow)",
        }}
      />

      <div
        className="relative flex h-16 shrink-0 items-center justify-between px-5"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <Link
          href={rootPath(role)}
          onClick={onClose}
          className="group inline-flex items-center gap-2.5"
        >
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, rgba(21,93,252,0.8), rgba(96,165,250,0.5))",
              boxShadow: "0 0 16px rgba(21,93,252,0.4)",
            }}
          >
            <LayoutDashboard size={15} className="text-white" />
          </motion.div>
          <span
            className="text-2xl font-semibold tracking-tight "
            style={{ letterSpacing: "-0.02em" }}
          >
            PMS
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg transition"
            style={{
              border: "1px solid var(--sidebar-border)",
              color: "var(--sidebar-nav-text)",
            }}
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>
      </div>


      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 mt-3">
        {items.map((item, i) => {
          const active = item.href === activeHref;
          return (
            <NavItem key={item.href} item={item} active={active} index={i} onClose={onClose} />
          );
        })}
      </nav>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="shrink-0 p-3"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--sidebar-label)">
          Quick Actions
        </div>
        <div className="flex items-center gap-2">
          <SidebarActionLink
            href="/dashboard/profile"
            active={profileActive}
            onClose={onClose}
          />
          <ThemeToggle />
          <motion.button
            type="button"
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex h-10 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "var(--sidebar-logout-bg)",
              border: "1px solid var(--sidebar-logout-border)",
              color: "var(--sidebar-logout-text)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{ background: "var(--sidebar-logout-hover)" }}
            />
            <motion.div
              className="relative z-10"
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <LogOut size={15} />
            </motion.div>
            <span className="relative z-10 transition-colors group-hover:text-(--sidebar-logout-text-hover)">
              Logout
            </span>
          </motion.button>
        </div>
      </motion.div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop static */}
      <div className="hidden lg:flex lg:shrink-0">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-screen sticky top-0"
        >
          {sidebarContent}
        </motion.div>
      </div>
    </>
  );
}
