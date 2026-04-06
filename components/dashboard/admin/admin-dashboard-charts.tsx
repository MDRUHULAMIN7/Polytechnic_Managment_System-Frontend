"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type {
  AdminDashboardChartDatum,
  AdminDashboardOverview,
} from "@/components/dashboard/admin/admin-dashboard-types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

type ChartPalette = {
  text: string;
  textDim: string;
  line: string;
  accent: string;
  accentInk: string;
  amber: string;
  emerald: string;
  rose: string;
  sky: string;
  slate: string;
};

const defaultPalette: ChartPalette = {
  text: "#0f172a",
  textDim: "#435069",
  line: "#d8dfeb",
  accent: "#4b7de9",
  accentInk: "#eff6ff",
  amber: "#f59e0b",
  emerald: "#10b981",
  rose: "#f43f5e",
  sky: "#38bdf8",
  slate: "#94a3b8",
};

function readCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function useChartPalette() {
  const [palette, setPalette] = useState<ChartPalette>(defaultPalette);

  useEffect(() => {
    const updatePalette = () => {
      setPalette({
        text: readCssVar("--text", defaultPalette.text),
        textDim: readCssVar("--text-dim", defaultPalette.textDim),
        line: readCssVar("--line", defaultPalette.line),
        accent: readCssVar("--accent", defaultPalette.accent),
        accentInk: readCssVar("--accent-ink", defaultPalette.accentInk),
        amber: defaultPalette.amber,
        emerald: defaultPalette.emerald,
        rose: defaultPalette.rose,
        sky: defaultPalette.sky,
        slate: defaultPalette.slate,
      });
    };

    updatePalette();

    const observer = new MutationObserver(updatePalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return palette;
}

function useCompactChartMode() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => {
      setCompact(window.innerWidth < 640);
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return compact;
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-overview-panel min-w-0 overflow-hidden rounded-3xl border border-(--line) bg-(--surface) p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="admin-overview-heading text-lg font-bold tracking-tight text-(--text)">{title}</h3>
        <p className="admin-overview-body mt-1 text-sm text-(--text-dim)">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="admin-overview-nested flex h-64 items-center justify-center rounded-2xl border border-dashed border-(--line) bg-(--surface-muted) px-6 text-center text-sm text-(--text-dim) sm:h-72">
      {message}
    </div>
  );
}

function hasNonZeroValues(items: AdminDashboardChartDatum[]) {
  return items.some((item) => item.value > 0);
}

function wrapAxisLabel(label: string, compact: boolean) {
  if (!compact || !label.includes(" ")) {
    return label;
  }

  return label.split(" ");
}

export function AdminDashboardCharts({
  overview,
}: {
  overview: Pick<
    AdminDashboardOverview,
    | "classStatusData"
    | "registrationStatusData"
    | "recentActivity"
    | "semesterOfferings"
    | "superAdmin"
  >;
}) {
  const palette = useChartPalette();
  const compact = useCompactChartMode();

  const sharedLegend = useMemo(
    () => ({
      display: true,
      position: "bottom" as const,
      labels: {
        color: palette.textDim,
        boxWidth: compact ? 10 : 12,
        boxHeight: compact ? 10 : 12,
        padding: compact ? 12 : 18,
        usePointStyle: true,
        pointStyle: "circle" as const,
        font: {
          size: compact ? 10 : 12,
        },
      },
    }),
    [compact, palette.textDim],
  );

  const doughnutOptions = useMemo(
    (): ChartOptions<"doughnut"> => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: compact ? "66%" : "72%",
      layout: {
        padding: compact ? 4 : 8,
      },
      plugins: {
        legend: sharedLegend,
        tooltip: {
          backgroundColor: palette.text,
          titleColor: palette.accentInk,
          bodyColor: palette.accentInk,
          padding: compact ? 10 : 12,
          displayColors: true,
        },
      },
    }),
    [compact, palette.accentInk, palette.text, sharedLegend],
  );

  const barOptions = useMemo(
    (): ChartOptions<"bar"> => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          ...sharedLegend,
          position: "top" as const,
        },
        tooltip: {
          backgroundColor: palette.text,
          titleColor: palette.accentInk,
          bodyColor: palette.accentInk,
          padding: compact ? 10 : 12,
        },
      },
      layout: {
        padding: compact ? { top: 4, right: 2, bottom: 2, left: 0 } : 8,
      },
      scales: {
        x: {
          ticks: {
            color: palette.textDim,
            font: {
              size: compact ? 10 : 12,
            },
            maxRotation: 0,
            minRotation: 0,
            autoSkipPadding: compact ? 14 : 20,
          },
          grid: {
            color: compact ? "transparent" : palette.line,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: palette.textDim,
            precision: 0,
            font: {
              size: compact ? 10 : 12,
            },
          },
          grid: {
            color: palette.line,
          },
        },
      },
    }),
    [compact, palette.accentInk, palette.line, palette.text, palette.textDim, sharedLegend],
  );

  const horizontalBarOptions = useMemo(
    (): ChartOptions<"bar"> => ({
      ...barOptions,
      indexAxis: compact ? "x" : "y",
      scales: compact
        ? barOptions.scales
        : {
            x: {
              beginAtZero: true,
              ticks: {
                color: palette.textDim,
                precision: 0,
                font: {
                  size: 12,
                },
              },
              grid: {
                color: palette.line,
              },
            },
            y: {
              ticks: {
                color: palette.textDim,
                font: {
                  size: 11,
                },
              },
              grid: {
                color: "transparent",
              },
            },
          },
    }),
    [barOptions, compact, palette.line, palette.textDim],
  );

  const classStatusData = useMemo(
    () => ({
      labels: overview.classStatusData.map((item) => item.label),
      datasets: [
        {
          data: overview.classStatusData.map((item) => item.value),
          backgroundColor: [
            palette.accent,
            palette.amber,
            palette.emerald,
            palette.rose,
            palette.slate,
          ],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    }),
    [overview.classStatusData, palette],
  );

  const registrationStatusData = useMemo(
    () => ({
      labels: overview.registrationStatusData.map((item) => item.label),
      datasets: [
        {
          data: overview.registrationStatusData.map((item) => item.value),
          backgroundColor: [palette.amber, palette.emerald, palette.slate],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    }),
    [overview.registrationStatusData, palette],
  );

  const superAdminUserStatusData = useMemo(
    () =>
      overview.superAdmin
        ? {
            labels: overview.superAdmin.userStatusData.map((item) => item.label),
            datasets: [
              {
                label: "Accounts",
                data: overview.superAdmin.userStatusData.map((item) => item.value),
                backgroundColor: [palette.accent, palette.emerald, palette.rose],
                borderRadius: 14,
                maxBarThickness: compact ? 36 : 52,
              },
            ],
          }
        : null,
    [compact, overview.superAdmin, palette.accent, palette.emerald, palette.rose],
  );

  const recentActivityData = useMemo(
    () => ({
      labels: overview.recentActivity.map((item) => item.label),
      datasets: [
        {
          label: "Total Classes",
          data: overview.recentActivity.map((item) => item.total),
          backgroundColor: palette.accent,
          borderRadius: 10,
        },
        {
          label: "Completed",
          data: overview.recentActivity.map((item) => item.completed),
          backgroundColor: palette.emerald,
          borderRadius: 10,
        },
        {
          label: "Disrupted",
          data: overview.recentActivity.map((item) => item.disrupted),
          backgroundColor: palette.rose,
          borderRadius: 10,
        },
      ],
    }),
    [overview.recentActivity, palette.accent, palette.emerald, palette.rose],
  );

  const semesterOfferingsData = useMemo(
    () => ({
      labels: overview.semesterOfferings.map((item) =>
        wrapAxisLabel(item.label, compact),
      ),
      datasets: [
        {
          label: "Sections",
          data: overview.semesterOfferings.map((item) => item.sections),
          backgroundColor: palette.accent,
          borderRadius: 10,
        },
        {
          label: "Subjects",
          data: overview.semesterOfferings.map((item) => item.subjects),
          backgroundColor: palette.sky,
          borderRadius: 10,
        },
        {
          label: "Instructors",
          data: overview.semesterOfferings.map((item) => item.instructors),
          backgroundColor: palette.slate,
          borderRadius: 10,
        },
      ],
    }),
    [compact, overview.semesterOfferings, palette.accent, palette.sky, palette.slate],
  );

  const hasRecentActivity = overview.recentActivity.some(
    (item) => item.total > 0 || item.completed > 0 || item.disrupted > 0,
  );
  const hasClassStatus = hasNonZeroValues(overview.classStatusData);
  const hasRegistrationStatus = hasNonZeroValues(overview.registrationStatusData);
  const hasSemesterOfferings = overview.semesterOfferings.some(
    (item) => item.sections > 0 || item.subjects > 0 || item.instructors > 0,
  );
  const hasSuperAdminUserStatus = hasNonZeroValues(
    overview.superAdmin?.userStatusData ?? [],
  );

  return (
    <div className="grid min-w-0 gap-6">
      {overview.superAdmin ? (
        <ChartCard
          title="User Access Health"
          description="Role-based account volume across total, active, and blocked internal users."
        >
          {hasSuperAdminUserStatus && superAdminUserStatusData ? (
            <div className="h-72 min-w-0 sm:h-80">
              <Bar
                data={superAdminUserStatusData}
                options={{
                  ...barOptions,
                  plugins: {
                    ...barOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <EmptyChartState message="User status analytics will appear once internal accounts are available." />
          )}
        </ChartCard>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <ChartCard
          title="7-Day Class Activity"
          description="Daily teaching load, completed delivery, and disrupted sessions over the last week."
        >
          {hasRecentActivity ? (
            <div className="h-72 min-w-0 sm:h-80">
              <Bar data={recentActivityData} options={barOptions} />
            </div>
          ) : (
            <EmptyChartState message="Recent class activity will appear here once sessions are scheduled." />
          )}
        </ChartCard>

        <ChartCard
          title="Class Operations Split"
          description="How the full class inventory is currently distributed across status buckets."
        >
          {hasClassStatus ? (
            <div className="h-72 min-w-0 sm:h-80">
              <Doughnut data={classStatusData} options={doughnutOptions} />
            </div>
          ) : (
            <EmptyChartState message="No class session status data is available yet." />
          )}
        </ChartCard>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Semester Offering Mix"
          description="Top academic semesters by active section count, subject breadth, and faculty load."
        >
          {hasSemesterOfferings ? (
            <div className="h-80 min-w-0 sm:h-80">
              <Bar data={semesterOfferingsData} options={horizontalBarOptions} />
            </div>
          ) : (
            <EmptyChartState message="Semester offering breakdown will appear once offered subjects exist." />
          )}
        </ChartCard>

        <ChartCard
          title="Registration Windows"
          description="Registration pipeline health across upcoming, ongoing, and closed semester windows."
        >
          {hasRegistrationStatus ? (
            <div className="h-72 min-w-0 sm:h-80">
              <Doughnut data={registrationStatusData} options={doughnutOptions} />
            </div>
          ) : (
            <EmptyChartState message="No semester registration data is available yet." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
