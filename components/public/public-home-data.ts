import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileBadge2,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export type HomeQuickLink = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
};

export type HomeFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HomeNotice = {
  date: string;
  title: string;
  description: string;
  accent: string;
};

export type HomeEvent = {
  date: string;
  title: string;
  description: string;
  image: string;
};

export type HomeAlumniProgram = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HomeStat = {
  value: string;
  label: string;
};

export const homeQuickLinks: HomeQuickLink[] = [
  { title: "Course Registration", subtitle: "Semester workflow", href: "/login", icon: LayoutDashboard },
  { title: "Fee Status", subtitle: "Enrollment finance tracking", href: "/login", icon: CreditCard },
  { title: "Academic Calendar", subtitle: "Dates and milestones", href: "/academic-calendar", icon: CalendarDays },
  { title: "Digital ID & Profile", subtitle: "Public and portal identity", href: "/login", icon: FileBadge2 },
];

export const homeFeatures: HomeFeature[] = [
  {
    title: "Role-Based Dashboards",
    description: "Students, instructors, and administrators each get the right tasks and the right data.",
    icon: LayoutDashboard,
  },
  {
    title: "Real-Time Notice Flow",
    description: "Announcements can move from institutional teams to the right audience without friction.",
    icon: Sparkles,
  },
  {
    title: "Academic Coordination",
    description: "Registration, scheduling, attendance, and operations stay connected instead of scattered.",
    icon: ShieldCheck,
  },
];

export const homeNotices: HomeNotice[] = [
  {
    date: "March 12, 2026",
    title: "Annual Examination Schedule Released",
    description: "The official final examination routine is now available for students and instructors.",
    accent: "General",
  },
  {
    date: "March 10, 2026",
    title: "Campus Holiday Notice for Independence Observance",
    description: "Academic and administrative activities will remain suspended during the national holiday period.",
    accent: "Important",
  },
  {
    date: "March 8, 2026",
    title: "Robotics Lab Upgrade and Temporary Access Rules",
    description: "A new equipment installation phase is starting with updated movement and safety guidance.",
    accent: "Urgent",
  },
];

export const homeEvents: HomeEvent[] = [
  {
    date: "18 Apr",
    title: "Sustainable AI Seminar",
    description: "Global guests, applied research, and future-facing discussion for technical education.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwep4bh58VlE60ATQ2GtvZSOACvzhyzsJCkca_Vhrix7XY2x_vgThFVywkaDS47v899naAKrrqobrG_iMAwqKl4ifoulwaaeXW70anMgFgDU4G3-lj5Vem3c7kdLSBxw0guESV-Cjw8UsU1TsCoIaVPLvHwvxsbzEA174N5z2cCwc5sUO2nlwDsDbCXlJdv0RhpvO6dBAMuauN7BZCPT5ZmmoBTk8TSIg4Vfbcz-g1vTCphyfFYAODWER8k67yX9kEIOQhfbm-ZCM",
  },
  {
    date: "22 Apr",
    title: "Spring Innovation Fest",
    description: "A showcase of student projects, lab prototypes, and collaborative engineering work.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKo0TnBB6DdNM9vH6Radvfp6b4ob6_9Ox0UwO2fzKFspqNnLK2kSKQl97VuZMvW0niJ4lbmjMkKPEKBzS3vRhCfWUdtQqIBqLxOkfbwmFWuKGxf_BDkT5JRmyD5ormxv5vThEUJsXv1GdxP7_6Z5Pvdqheq6s73_VUYs5JMsQrM_KC-kxz4kceN04cYKIJXWKMtljZos3xVlAACSCgjZHjmbSJU0RkOOQ5zqouUGzaQ6G9UZ22DyKwMvgfXqx9WVIpaV25NEfsdos",
  },
];

export const homeAlumniPrograms: HomeAlumniProgram[] = [
  { title: "Direct Mentorship", description: "Learn from alumni already working in your target industries.", icon: Users },
  { title: "Internal Job Board", description: "A trusted alumni network for openings, referrals, and internships.", icon: BriefcaseBusiness },
  { title: "Global Chapters", description: "Community groups and networking events across cities and countries.", icon: MapPin },
  { title: "Legacy Support", description: "Scholarship, giving, and community contributions backed by graduates.", icon: GraduationCap },
];

export const homeStats: HomeStat[] = [
  { value: "75+", label: "Years of technical education" },
  { value: "24/7", label: "Public academic access" },
  { value: "3", label: "Core portal roles" },
  { value: "Live", label: "Real-time institutional updates" },
];
