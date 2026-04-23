"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createPeriodConfigAction,
  updatePeriodConfigAction,
} from "@/actions/dashboard/admin/period-config";
import type { PeriodConfigInput } from "@/lib/type/dashboard/admin/period-config";
import type {
  PeriodConfigFormModalProps,
  PeriodConfigFormState,
} from "@/lib/type/dashboard/admin/period-config/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

function createRowId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function calculateDuration(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return "";
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (
    !Number.isFinite(startHour) ||
    !Number.isFinite(startMinute) ||
    !Number.isFinite(endHour) ||
    !Number.isFinite(endMinute)
  ) {
    return "";
  }

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (end <= start) {
    return "";
  }

  return String(end - start);
}

function createEmptyState(): PeriodConfigFormState {
  return {
    label: "",
    effectiveFrom: "",
    isActive: true,
    periods: [
      {
        id: createRowId(),
        periodNo: "1",
        title: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
        isBreak: false,
        isActive: true,
      },
    ],
  };
}

export function PeriodConfigFormModal({
  open,
  mode,
  periodConfig,
  onClose,
  onSaved,
}: PeriodConfigFormModalProps) {
  const [form, setForm] = useState<PeriodConfigFormState>(createEmptyState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!periodConfig) {
      setForm(createEmptyState());
      return;
    }

    setForm({
      label: periodConfig.label ?? "",
      effectiveFrom: periodConfig.effectiveFrom
        ? periodConfig.effectiveFrom.slice(0, 10)
        : "",
      isActive: periodConfig.isActive ?? false,
      periods:
        periodConfig.periods?.map((period) => ({
          id: createRowId(),
          periodNo: String(period.periodNo ?? ""),
          title: period.title ?? "",
          startTime: period.startTime ?? "",
          endTime: period.endTime ?? "",
          durationMinutes: String(period.durationMinutes ?? ""),
          isBreak: period.isBreak ?? false,
          isActive: period.isActive ?? true,
        })) ?? createEmptyState().periods,
    });
  }, [open, periodConfig]);

  function updatePeriodRow(
    rowId: string,
    updater: (row: PeriodConfigFormState["periods"][number]) => PeriodConfigFormState["periods"][number],
  ) {
    setForm((current) => ({
      ...current,
      periods: current.periods.map((row) => (row.id === rowId ? updater(row) : row)),
    }));
  }

  function addPeriodRow() {
    setForm((current) => ({
      ...current,
      periods: [
        ...current.periods,
        {
          id: createRowId(),
          periodNo: String(current.periods.length + 1),
          title: "",
          startTime: "",
          endTime: "",
          durationMinutes: "",
          isBreak: false,
          isActive: true,
        },
      ],
    }));
  }

  function removePeriodRow(rowId: string) {
    setForm((current) => ({
      ...current,
      periods:
        current.periods.length === 1
          ? current.periods
          : current.periods.filter((row) => row.id !== rowId),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const label = form.label.trim();
      if (!label) {
        throw new Error("Configuration label is required.");
      }

      if (!form.effectiveFrom) {
        throw new Error("Effective date is required.");
      }

      if (!form.periods.length) {
        throw new Error("Add at least one period.");
      }

      const payload: PeriodConfigInput = {
        label,
        effectiveFrom: form.effectiveFrom,
        isActive: form.isActive,
        periods: form.periods.map((row, index) => {
          const periodNo = Number(row.periodNo);
          if (!Number.isFinite(periodNo) || periodNo <= 0) {
            throw new Error(`Period ${index + 1} needs a valid period number.`);
          }

          if (!row.startTime || !row.endTime) {
            throw new Error(`Period ${index + 1} must include start and end time.`);
          }

          const durationMinutes = Number(
            row.durationMinutes || calculateDuration(row.startTime, row.endTime),
          );

          if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
            throw new Error(`Period ${index + 1} has an invalid time range.`);
          }

          return {
            periodNo,
            title: row.title.trim() || undefined,
            startTime: row.startTime,
            endTime: row.endTime,
            durationMinutes,
            isBreak: row.isBreak,
            isActive: row.isActive,
          };
        }),
      };

      if (mode === "create") {
        await createPeriodConfigAction(payload);
        showToast({
          variant: "success",
          title: "Period config created",
          description: `${payload.label} has been saved.`,
        });
      } else if (periodConfig?._id) {
        await updatePeriodConfigAction(periodConfig._id, payload);
        showToast({
          variant: "success",
          title: "Period config updated",
          description: `${payload.label} updated successfully.`,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Unable to save period config",
        description:
          error instanceof Error ? error.message : "Please review the configuration.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create Period Config" : "Update Period Config"}
      description="Define the active class periods used for schedule blocks and room planning."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Label
            </label>
            <input
              value={form.label}
              onChange={(event) =>
                setForm((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Regular Day Schedule"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Effective From
            </label>
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  effectiveFrom: event.target.value,
                }))
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
            className="h-4 w-4 accent-(--accent)"
          />
          <span>Set this configuration as the active timetable immediately.</span>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Period Rows
              </p>
              <p className="mt-1 text-sm text-(--text-dim)">
                Keep only teachable periods active. Break rows can stay in the same configuration.
              </p>
            </div>
            <button
              type="button"
              onClick={addPeriodRow}
              className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text) transition hover:bg-(--surface-muted)"
            >
              Add Period
            </button>
          </div>

          <div className="space-y-3">
            {form.periods.map((row, index) => (
              <div
                key={row.id}
                className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[0.7fr_1.4fr_1fr_1fr_0.8fr]">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                      Period No
                    </label>
                    <input
                      value={row.periodNo}
                      onChange={(event) =>
                        updatePeriodRow(row.id, (current) => ({
                          ...current,
                          periodNo: event.target.value,
                        }))
                      }
                      inputMode="numeric"
                      className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                      Title
                    </label>
                    <input
                      value={row.title}
                      onChange={(event) =>
                        updatePeriodRow(row.id, (current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder={`Period ${index + 1}`}
                      className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                      Start
                    </label>
                    <input
                      type="time"
                      value={row.startTime}
                      onChange={(event) =>
                        updatePeriodRow(row.id, (current) => ({
                          ...current,
                          startTime: event.target.value,
                          durationMinutes: calculateDuration(
                            event.target.value,
                            current.endTime,
                          ),
                        }))
                      }
                      className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                      End
                    </label>
                    <input
                      type="time"
                      value={row.endTime}
                      onChange={(event) =>
                        updatePeriodRow(row.id, (current) => ({
                          ...current,
                          endTime: event.target.value,
                          durationMinutes: calculateDuration(
                            current.startTime,
                            event.target.value,
                          ),
                        }))
                      }
                      className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                      Minutes
                    </label>
                    <input
                      value={row.durationMinutes}
                      readOnly
                      className="mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text-dim)"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-(--text-dim)">
                      <input
                        type="checkbox"
                        checked={row.isBreak}
                        onChange={(event) =>
                          updatePeriodRow(row.id, (current) => ({
                            ...current,
                            isBreak: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-(--accent)"
                      />
                      Break
                    </label>

                    <label className="flex items-center gap-2 text-sm text-(--text-dim)">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={(event) =>
                          updatePeriodRow(row.id, (current) => ({
                            ...current,
                            isActive: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-(--accent)"
                      />
                      Active
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePeriodRow(row.id)}
                    disabled={form.periods.length === 1}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-red-500/40 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
