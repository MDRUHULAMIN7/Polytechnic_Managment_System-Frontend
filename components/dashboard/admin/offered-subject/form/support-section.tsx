"use client";

import Link from "next/link";
import { Sparkles, Info, Clock, MapPin } from "lucide-react";
import type { PeriodConfig, PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";

interface SupportSectionProps {
  form: {
    instructor: string;
    semesterRegistration: string;
  };
  supportLoading: boolean;
  supportError: string | null;
  activePeriodConfig: PeriodConfig | null;
  rooms: Room[];
  schedulablePeriods: PeriodConfigItem[];
  busyLoading: boolean;
  busyError: string | null;
  busySlots: OfferedSubject[];
}

export function SupportSection({
  form,
  supportLoading,
  supportError,
  activePeriodConfig,
  rooms,
  schedulablePeriods,
  busyLoading,
  busyError,
  busySlots,
}: SupportSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-(--line) pb-4">
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <Info className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Scheduling Support</p>
          </div>
          <div className="flex gap-3 text-[10px] font-bold text-(--accent)">
            <Link href="/dashboard/admin/period-configs" className="hover:underline">CONFIGS</Link>
            <Link href="/dashboard/admin/rooms" className="hover:underline">ROOMS</Link>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin/curriculum-planning"
              className="focus-ring flex h-10 items-center justify-center gap-2 rounded-xl border border-(--accent) bg-(--accent)/5 px-4 text-xs font-bold text-(--accent) transition hover:bg-(--accent)/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              OPEN AI PLANNER
            </Link>
            <p className="text-[10px] leading-relaxed text-(--text-dim)">
              Use the AI curriculum planner for automated multi-subject routine generation.
            </p>
          </div>

          {supportLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 rounded-xl bg-(--surface-muted)" />
              <div className="h-10 rounded-xl bg-(--surface-muted)" />
            </div>
          ) : supportError ? (
            <p className="text-xs text-red-400">{supportError}</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-(--surface-muted)/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-(--text)">
                    {activePeriodConfig?.label ?? "No Active Config"}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-(--text-dim)">
                    <MapPin className="h-3 w-3" />
                    {rooms.length} Rooms
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-(--text-dim)">
                  Effective: {activePeriodConfig?.effectiveFrom?.slice(0, 10) ?? "--"}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {schedulablePeriods.length ? (
                  schedulablePeriods.map((period) => (
                    <span
                      key={period.periodNo}
                      className="inline-flex items-center gap-1 rounded-lg border border-(--line) bg-(--surface) px-2 py-1 text-[10px] font-bold text-(--text-dim)"
                    >
                      <Clock className="h-2.5 w-2.5" />
                      P{period.periodNo}
                    </span>
                  ))
                ) : (
                  <p className="text-[10px] italic text-(--text-dim)">No teachable periods found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-(--line) pb-4 text-(--text-dim)">
          <Clock className="h-4 w-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Instructor Availability</p>
        </div>

        <div className="mt-4">
          {!form.instructor || !form.semesterRegistration ? (
            <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
              <Clock className="h-8 w-8 text-(--text-dim)" />
              <p className="mt-2 text-[10px] font-medium italic">Select instructor & registration to check slots</p>
            </div>
          ) : busyLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-10 animate-pulse rounded-xl bg-(--surface-muted)" />
              <div className="h-10 animate-pulse rounded-xl bg-(--surface-muted)" />
            </div>
          ) : busyError ? (
            <p className="py-2 text-xs text-red-400">{busyError}</p>
          ) : busySlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-(--text-dim)">
              <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                <Info className="h-5 w-5" />
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider">No Busy Slots Found</p>
            </div>
          ) : (
            <div className="max-h-40 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
              {busySlots.map((slot) => {
                const subjectTitle = typeof slot.subject === "string" ? slot.subject : slot.subject?.title;
                return (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between rounded-xl border border-(--line) bg-(--surface-muted)/20 p-3 transition-colors hover:bg-(--surface-muted)/40"
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-xs font-bold text-(--text)">{subjectTitle ?? "Assigned Subject"}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-(--text-dim)">{slot.days?.join(", ") ?? "--"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-(--text)">{slot.startTime} - {slot.endTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
