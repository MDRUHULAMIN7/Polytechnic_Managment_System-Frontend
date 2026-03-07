"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ClassSessionFilterOption } from "@/lib/type/dashboard/class-session";
import { updateListSearchParams } from "@/utils/dashboard/admin/search-params";

type StatusOption = {
  value: string;
  label: string;
};

type ClassSessionFiltersProps = {
  semesterRegistration: string;
  subject: string;
  status: string;
  startDate: string;
  endDate: string;
  limit: number;
  semesterOptions: ClassSessionFilterOption[];
  subjectOptions: ClassSessionFilterOption[];
  statusOptions: StatusOption[];
};

export function ClassSessionFilters({
  semesterRegistration,
  subject,
  status,
  startDate,
  endDate,
  limit,
  semesterOptions,
  subjectOptions,
  statusOptions,
}: ClassSessionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const serverForm = useMemo(
    () => ({
      semesterRegistration,
      subject,
      status,
      startDate,
      endDate,
    }),
    [semesterRegistration, subject, status, startDate, endDate],
  );
  const serverFormKey = JSON.stringify(serverForm);
  const [draft, setDraft] = useState(serverForm);
  const [draftKey, setDraftKey] = useState(serverFormKey);
  const form = draftKey === serverFormKey ? draft : serverForm;
  const hasPendingSemesterChange =
    form.semesterRegistration !== semesterRegistration;
  const effectiveSubjectOptions = hasPendingSemesterChange ? [] : subjectOptions;
  const selectClassName =
    "focus-ring h-11 w-full min-w-0 rounded-xl border border-(--line) bg-(--surface) px-3 pr-10 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-60";
  const inputClassName =
    "focus-ring h-11 w-full min-w-0 rounded-xl border border-(--line) bg-transparent px-3 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-60";

  function updateField(
    key: "semesterRegistration" | "subject" | "status" | "startDate" | "endDate",
    value: string,
  ) {
    setDraftKey(serverFormKey);
    setDraft({
      ...form,
      [key]: value,
      ...(key === "semesterRegistration" ? { subject: "" } : {}),
    });
  }

  function applyFilters() {
    updateListSearchParams({
      pathname,
      searchParams,
      router,
      startTransition,
      entries: [
        ["semesterRegistration", form.semesterRegistration || null],
        ["subject", form.subject || null],
        ["status", form.status || null],
        ["startDate", form.startDate || null],
        ["endDate", form.endDate || null],
        ["page", 1],
        ["limit", limit],
      ],
      defaults: { page: 1, limit: 10 },
    });
  }

  return (
    <div className="grid w-full min-w-0 gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1.3fr)_repeat(3,minmax(0,0.85fr))_auto]">
      <select
        value={form.semesterRegistration}
        onChange={(event) => updateField("semesterRegistration", event.target.value)}
        className={selectClassName}
      >
        <option value="">Select Semester </option>
        {semesterOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select
        value={form.subject}
        onChange={(event) => updateField("subject", event.target.value)}
        disabled={!form.semesterRegistration || hasPendingSemesterChange}
        className={selectClassName}
      >
        <option value="">
          {hasPendingSemesterChange ? "Apply semester to load subjects" : "All Subjects"}
        </option>
        {effectiveSubjectOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={form.startDate}
        onChange={(event) => updateField("startDate", event.target.value)}
        disabled={!form.semesterRegistration}
        className={inputClassName}
      />

      <input
        type="date"
        value={form.endDate}
        onChange={(event) => updateField("endDate", event.target.value)}
        disabled={!form.semesterRegistration}
        className={inputClassName}
      />

      <select
        value={form.status}
        onChange={(event) => updateField("status", event.target.value)}
        disabled={!form.semesterRegistration}
        className={selectClassName}
      >
        <option value="">All Status</option>
        {statusOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={applyFilters}
        disabled={isPending}
        className="focus-ring inline-flex h-11 w-full min-w-0 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 xl:col-span-1"
      >
        {isPending
          ? "Applying..."
          : form.semesterRegistration
            ? "Apply"
            : "Load Classes"}
      </button>
    </div>
  );
}
