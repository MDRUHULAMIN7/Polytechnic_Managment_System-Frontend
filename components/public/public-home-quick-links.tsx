import type { ComponentType } from "react";
import Link from "next/link";
import { Bell, GraduationCap, LogIn, Calendar } from "lucide-react";

type QuickLink = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const quickLinks: QuickLink[] = [
  { title: "Student Portal", href: "/login", icon: LogIn },
  { title: "Notice Board", href: "/notices", icon: Bell },
  { title: "Academic Calendar", href: "/academic-calendar", icon: Calendar },
  { title: "Admissions", href: "/admissions", icon: GraduationCap },
];

export function PublicHomeQuickLinks() {
  return (
    <section className="home-quick-links">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={`hero-card group rounded-xl p-6 transition-transform hover:-translate-y-1 animate-hero-scale-in delay-${index * 100}`}
            >
              <span className="home-quick-icon">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-(--text)">{item.title}</h3>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-(--accent)">
                Access -&gt;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
