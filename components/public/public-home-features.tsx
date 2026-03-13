import type { ComponentType } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  GraduationCap,
  Smartphone,
  Users,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const features: Feature[] = [
  {
    title: "Semester Registration",
    description: "Automated enrollment process with real-time seat availability.",
    icon: Calendar,
  },
  {
    title: "Class Management",
    description: "Schedule classes, track attendance, and manage sessions.",
    icon: GraduationCap,
  },
  {
    title: "Notice System",
    description: "Role-based notifications reaching the right people instantly.",
    icon: Bell,
  },
  {
    title: "Student Records",
    description: "Complete academic and personal information management.",
    icon: Users,
  },
  {
    title: "Reporting and Analytics",
    description: "Comprehensive insights into academic performance.",
    icon: BarChart3,
  },
  {
    title: "Mobile Access",
    description: "Full functionality on any device, anywhere.",
    icon: Smartphone,
  },
];

export function PublicHomeFeatures() {
  return (
    <section className="home-section" aria-labelledby="home-features-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="home-features-title"
            className="text-3xl font-bold text-(--text) sm:text-4xl animate-hero-fade-up delay-0"
          >
            Everything you need for campus management
          </h2>
          <p className="mt-4 text-lg text-(--text-dim) animate-hero-fade-up delay-100">
            Comprehensive tools designed for polytechnic institutions
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`hero-card rounded-xl p-6 animate-hero-scale-in delay-${(index % 6) * 100}`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: "var(--hero-badge-bg)",
                  border: "1px solid var(--hero-badge-border)",
                }}
              >
                <feature.icon className="h-6 w-6" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-(--text)">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
