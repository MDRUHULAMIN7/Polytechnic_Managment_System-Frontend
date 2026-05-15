import type { PeriodConfig } from "@/lib/type/dashboard/admin/period-config";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";

export function formatSemesterRegistrationShort(
  reg: SemesterRegistration | undefined,
): string {
  if (!reg) return "This semester registration";
  const semester = reg.academicSemester;
  const semesterLabel =
    typeof semester === "string"
      ? semester
      : `${semester?.name ?? ""} ${semester?.year ?? ""}`.trim();
  const bits = [semesterLabel || "Semester", reg.shift, reg.status].filter(Boolean);
  return bits.join(" · ");
}

export function formatActivePeriodConfigShort(
  config: PeriodConfig | undefined | null,
  schedulablePeriodCount: number,
): string {
  const label = config?.label?.trim();
  if (label) {
    return `${label} · ${schedulablePeriodCount} teaching period${
      schedulablePeriodCount === 1 ? "" : "s"
    }`;
  }
  return `Active period config · ${schedulablePeriodCount} teaching period${
    schedulablePeriodCount === 1 ? "" : "s"
  }`;
}

/** Shown under room / instructor panel titles. */
export function buildAvailabilityPanelSubtitle(
  semesterRegistration: SemesterRegistration | undefined,
  periodConfig: PeriodConfig | undefined | null,
  schedulablePeriodCount: number,
): string {
  const sem = formatSemesterRegistrationShort(semesterRegistration);
  const pc = formatActivePeriodConfigShort(periodConfig, schedulablePeriodCount);
  return `DB offered subjects for: ${sem}. Grid columns = ${pc} (breaks / inactive periods hidden).`;
}
