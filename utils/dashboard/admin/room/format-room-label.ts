import type { Room } from "@/lib/type/dashboard/admin/room";

export function formatRoomOptionLabel(r: Room): string {
  const num = Number.isFinite(r.roomNumber) ? `#${r.roomNumber}` : "";
  const bld = Number.isFinite(r.buildingNumber) ? `Bld ${r.buildingNumber}` : "";
  return [r.roomName, num, bld, r.roomType].filter(Boolean).join(" · ");
}
