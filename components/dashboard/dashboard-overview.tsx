import { BarChart3, CalendarClock, CircleCheckBig, Clock3 } from "lucide-react";
import type { PrivilegedRole } from "@/lib/constants";

type DashboardOverviewProps = {
  role: PrivilegedRole;
};

const cards = [
  { label: "Managed Modules", value: "14", hint: "Core RMS domains", icon: BarChart3 },
  { label: "Active Workflows", value: "42", hint: "Creation + approval tracks", icon: CircleCheckBig },
  { label: "Pending Actions", value: "18", hint: "Need admin decision", icon: Clock3 },
  { label: "Current Session", value: "Spring", hint: "Academic timeline", icon: CalendarClock }
];

export function DashboardOverview({ role }: DashboardOverviewProps) {
  const heading =
    role === "superAdmin"
      ? "Super Admin Command Center"
      : role === "admin"
        ? "Admin Operations Hub"
        : role === "instructor"
          ? "Instructor Workspace"
          : "Student Workspace";

  return (
    <section className="space-y-7">
      <header className="rounded-2xl border border-(--line) bg-(--surface) p-6 shadow-[0_14px_35px_var(--shadow-color)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary)">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-(--text-dim)">
          Responsive dashboard foundation is ready. Next step is connecting each management module screen with table,
          details, create form, filters, and pagination.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-(--line) bg-(--surface) p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-(--text-dim)">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
                <p className="mt-1 text-sm text-(--text-dim)">{card.hint}</p>
              </div>
              <card.icon className="h-5 w-5 text-(--primary)" aria-hidden />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
