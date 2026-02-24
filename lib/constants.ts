import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  BookOpenText,
  Building2,
  CalendarClock,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  Layers,
  School,
  UserCog,
  Users
} from "lucide-react";

export type PrivilegedRole = "admin" | "superAdmin" | "instructor" | "student";

export type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const commonItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/academic-instructor", label: "Academic Instructor", icon: School },
  { href: "/dashboard/admin/academic-department", label: "Academic Department", icon: Building2 },
  { href: "/dashboard/admin/academic-semester", label: "Academic Semester", icon: CalendarClock },
  { href: "/dashboard/admin/semester-registrations", label: "Semester Registration", icon: CalendarRange },
  { href: "/dashboard/admin/semester-enrollments", label: "Semester Enrollment", icon: CalendarRange },
  { href: "/dashboard/admin/offered-subjects", label: "Offered Subject", icon: BookOpenText },
  { href: "/dashboard/admin/curriculums", label: "Curriculums", icon: Layers },
  { href: "/dashboard/admin/instructors", label: "Instructor", icon: UserCog },
  { href: "/dashboard/admin/students", label: "Student", icon: GraduationCap },
  { href: "/dashboard/admin/subjects", label: "Subject", icon: BookOpenCheck }
];
const instructorItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/instructor/academic-semester",
    label: "Academic Semester",
    icon: CalendarClock,
  },
  { href: "/dashboard/instructor/subjects", label: "Subject", icon: BookOpenCheck },
  {
    href: "/dashboard/instructor/semester-registrations",
    label: "Semester Registration",
    icon: CalendarRange,
  },
  {
    href: "/dashboard/instructor/offered-subjects",
    label: "Offered Subject",
    icon: BookOpenText,
  },
  { href: "/dashboard/instructor/curriculums", label: "Curriculums", icon: Layers },
  {
    href: "/dashboard/instructor/semester-enrollments",
    label: "Semester Enrollment",
    icon: CalendarRange,
  },
];
const studentItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/student/academic-semester",
    label: "Academic Semester",
    icon: CalendarClock,
  },
  { href: "/dashboard/student/subjects", label: "Subject", icon: BookOpenCheck },
  {
    href: "/dashboard/student/semester-registrations",
    label: "Semester Registration",
    icon: CalendarRange,
  },
  {
    href: "/dashboard/student/offered-subjects",
    label: "My Offered Subject",
    icon: BookOpenText,
  },
  { href: "/dashboard/student/curriculums", label: "Curriculums", icon: Layers },
  {
    href: "/dashboard/student/semester-enrollments",
    label: "Semester Enrollment",
    icon: CalendarRange,
  },
];

export const sidebarByRole: Record<PrivilegedRole, SidebarItem[]> = {
  admin: commonItems,
  superAdmin: [
    ...commonItems,
    { href: "/dashboard/admin/admins", label: "Admins", icon: Users }
  ],
  instructor: instructorItems,
  student: studentItems,
};
