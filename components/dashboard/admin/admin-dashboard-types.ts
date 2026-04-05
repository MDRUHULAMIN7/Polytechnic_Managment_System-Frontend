export type AdminDashboardCardTone =
  | "primary"
  | "accent"
  | "amber"
  | "emerald"
  | "sky"
  | "slate";

export type AdminDashboardCard = {
  label: string;
  value: number;
  helper: string;
  href: string;
  tone: AdminDashboardCardTone;
};

export type AdminDashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type AdminDashboardChartDatum = {
  label: string;
  value: number;
};

export type AdminDashboardRecentActivityPoint = {
  label: string;
  total: number;
  completed: number;
  disrupted: number;
};

export type AdminDashboardSemesterOfferingPoint = {
  label: string;
  sections: number;
  subjects: number;
  instructors: number;
};

export type AdminDashboardSemesterInsight = {
  label: string;
  meta: string;
  offeredSubjects: number;
  uniqueSubjects: number;
  uniqueInstructors: number;
  registrationWindows: number;
  currentWindows: number;
  href: string;
};

export type AdminDashboardOverview = {
  cards: AdminDashboardCard[];
  quickMetrics: AdminDashboardMetric[];
  websiteStats: AdminDashboardMetric[];
  classStatusData: AdminDashboardChartDatum[];
  registrationStatusData: AdminDashboardChartDatum[];
  recentActivity: AdminDashboardRecentActivityPoint[];
  semesterOfferings: AdminDashboardSemesterOfferingPoint[];
  semesterInsights: AdminDashboardSemesterInsight[];
};
