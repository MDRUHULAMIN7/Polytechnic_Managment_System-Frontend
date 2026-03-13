import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Calendar,
  GraduationCap,
  Users,
} from "lucide-react";

const trustIndicators = [
  { label: "1000+ Students", icon: Users },
  { label: "3 Departments", icon: Calendar },
  { label: "Real-time Updates", icon: Bell },
];

const metrics = [
  { value: "3", label: "Role-based dashboards" },
  { value: "100%", label: "Real-time sync" },
  { value: "24/7", label: "Available" },
];

const features = [
  {
    title: "Semester Management",
    description: "Handle registration windows, seat limits, and schedules in one flow.",
    icon: Calendar,
  },
  {
    title: "Notice Distribution",
    description: "Role-based updates reach students and staff instantly.",
    icon: Bell,
  },
  {
    title: "Class Scheduling",
    description: "Create timetables, assign instructors, and keep rooms aligned.",
    icon: GraduationCap,
  },
];

export function HeroSection() {
  return (
    <section className="hero-section relative overflow-hidden">
      <div className="hero-gradient-bg" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="flex flex-col gap-6">
            <span className="hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide animate-hero-fade-up delay-0">
              <GraduationCap className="h-4 w-4" style={{ color: "var(--accent)" }} />
              <span style={{ color: "var(--accent)" }}>RPI Polytechnic Institute</span>
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-(--text) sm:text-5xl lg:text-6xl animate-hero-fade-up delay-100">
              Complete campus management{" "}
              <span style={{ color: "var(--accent)" }}>made simple</span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-(--text-dim) sm:text-lg sm:leading-8 animate-hero-fade-up delay-200">
              Streamline semester registration, class management, notice distribution,
              and student services through a unified digital platform designed for
              polytechnic institutions.
            </p>

            <div className="flex flex-wrap gap-3 animate-hero-fade-up delay-300">
              <Link
                href="/login"
                className="hero-cta-primary focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
              >
                Access Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="hero-cta-secondary focus-ring inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-6 border-t border-(--line) pt-6 animate-hero-fade-up delay-400">
              {trustIndicators.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-(--text-dim)">
                  <item.icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 animate-hero-fade-up delay-500">
              {metrics.map((metric) => (
                <div key={metric.label} className="hero-metric-card rounded-xl p-4">
                  <div className="text-2xl font-bold text-(--text)">{metric.value}</div>
                  <div className="mt-2 text-xs text-(--text-dim)">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className={`hero-card rounded-xl p-5 animate-hero-scale-in delay-${(index + 3) * 100}`}
              >
                <div className="flex gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg"
                    style={{
                      background: "var(--hero-badge-bg)",
                      border: "1px solid var(--hero-badge-border)",
                    }}
                  >
                    <feature.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-(--text)">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            <article
              className="hero-card rounded-xl p-6 animate-hero-scale-in delay-600"
              style={{ background: "var(--hero-metric-gradient)" }}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--accent) text-(--accent-ink)">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-(--text)">
                    Built for Bangladesh context
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                    Designed to work efficiently even with slow internet connections and
                    optimized for local needs.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
