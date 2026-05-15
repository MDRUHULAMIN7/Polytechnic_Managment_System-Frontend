"use client";

import type { ReactNode } from "react";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";

type PeriodCol = { periodNo: number; startTime: string; endTime: string };

export function PeriodMatrix({
  days,
  periods,
  renderCell,
}: {
  days: OfferedSubjectDay[];
  periods: PeriodCol[];
  renderCell: (day: OfferedSubjectDay, periodNo: number) => ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-(--line)">
      <table className="min-w-full text-[11px]">
        <thead className="bg-(--surface-muted)">
          <tr>
            <th className="px-2 py-2 text-left font-semibold text-(--text-dim)">Day / P</th>
            {periods.map((p) => (
              <th key={p.periodNo} className="px-1 py-2 text-center font-semibold text-(--text-dim)">
                <div>P{p.periodNo}</div>
                <div className="text-[9px] font-normal opacity-70">
                  {p.startTime}-{p.endTime}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td className="px-2 py-1.5 font-semibold text-(--text-dim)">{day}</td>
              {periods.map((p) => (
                <td key={`${day}-${p.periodNo}`} className="px-0.5 py-0.5 align-top">
                  {renderCell(day, p.periodNo)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
