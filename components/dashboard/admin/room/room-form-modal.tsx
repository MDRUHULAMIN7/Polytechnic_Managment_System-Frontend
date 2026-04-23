"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createRoomAction,
  updateRoomAction,
} from "@/actions/dashboard/admin/room";
import type { RoomInput } from "@/lib/type/dashboard/admin/room";
import type { RoomFormModalProps } from "@/lib/type/dashboard/admin/room/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

function toPositiveNumber(
  value: string,
  label: string,
  options?: { allowBlank?: boolean },
) {
  if (!value.trim()) {
    if (options?.allowBlank) {
      return undefined;
    }

    throw new Error(`${label} is required.`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }

  return parsed;
}

export function RoomFormModal({
  open,
  mode,
  room,
  onClose,
  onSaved,
}: RoomFormModalProps) {
  const [roomName, setRoomName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [floor, setFloor] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setRoomName(room?.roomName ?? "");
    setRoomNumber(room?.roomNumber ? String(room.roomNumber) : "");
    setBuildingNumber(room?.buildingNumber ? String(room.buildingNumber) : "");
    setCapacity(room?.capacity ? String(room.capacity) : "");
    setFloor(room?.floor ? String(room.floor) : "");
    setIsActive(room?.isActive ?? true);
  }, [open, room]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload: RoomInput = {
        roomName: roomName.trim(),
        roomNumber: toPositiveNumber(roomNumber, "Room number") as number,
        buildingNumber: toPositiveNumber(
          buildingNumber,
          "Building number",
        ) as number,
        capacity: toPositiveNumber(capacity, "Capacity") as number,
        floor: toPositiveNumber(floor, "Floor", { allowBlank: true }),
        isActive,
      };

      if (!payload.roomName) {
        throw new Error("Room name is required.");
      }

      if (mode === "create") {
        await createRoomAction(payload);
        showToast({
          variant: "success",
          title: "Room created",
          description: `${payload.roomName} is ready to use.`,
        });
      } else if (room?._id) {
        await updateRoomAction(room._id, payload);
        showToast({
          variant: "success",
          title: "Room updated",
          description: `${payload.roomName} updated successfully.`,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Unable to save room",
        description:
          error instanceof Error ? error.message : "Please review the form.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create Room" : "Update Room"}
      description={
        mode === "create"
          ? "Add a room for class scheduling and capacity planning."
          : "Adjust room location, capacity, or availability."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Room Name
            </label>
            <input
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Electrical Lab - A"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Building Number
            </label>
            <input
              value={buildingNumber}
              onChange={(event) => setBuildingNumber(event.target.value)}
              inputMode="numeric"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Room Number
            </label>
            <input
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              inputMode="numeric"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Capacity
            </label>
            <input
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              inputMode="numeric"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Floor
            </label>
            <input
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              inputMode="numeric"
              placeholder="Optional"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-(--accent)"
          />
          <span>
            Keep this room active for scheduling and offered-subject planning.
          </span>
        </label>

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
