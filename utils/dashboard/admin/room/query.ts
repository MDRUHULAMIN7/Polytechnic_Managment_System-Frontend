import type { RoomListParams } from "@/lib/type/dashboard/admin/room";

export function buildRoomQuery(params: RoomListParams) {
  const searchParams = new URLSearchParams();

  if (params.searchTerm?.trim()) {
    searchParams.set("searchTerm", params.searchTerm.trim());
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.isActive) {
    searchParams.set("isActive", params.isActive);
  }
  if (params.buildingNumber) {
    searchParams.set("buildingNumber", params.buildingNumber);
  }
  if (params.fields) {
    searchParams.set("fields", params.fields);
  }

  return searchParams;
}
