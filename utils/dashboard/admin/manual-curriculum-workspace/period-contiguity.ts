import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";

export function resolveMaxContiguousFromStart(
  periods: PeriodConfigItem[],
  startPeriod: number,
): number {
  if (!Number.isFinite(startPeriod) || startPeriod <= 0) {
    return 0;
  }
  const startIndex = periods.findIndex((p) => p.periodNo === startPeriod);
  if (startIndex === -1) return 0;
  let total = 1;
  for (let i = startIndex + 1; i < periods.length; i += 1) {
    if (periods[i].periodNo !== periods[i - 1].periodNo + 1) break;
    total += 1;
  }
  return total;
}
