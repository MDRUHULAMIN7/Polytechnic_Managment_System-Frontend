import type {
  ApiResponse,
  Room,
  RoomInput,
  RoomListParams,
  RoomListPayload,
  RoomUpdateInput,
} from "@/lib/type/dashboard/admin/room";
import { buildRoomQuery } from "@/utils/dashboard/admin/room/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function getRooms(params: RoomListParams): Promise<RoomListPayload> {
  ensureApiBaseUrl();

  const query = buildRoomQuery(params);
  const response = await fetch(`${API_BASE_URL}/rooms?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<RoomListPayload>>(
    response,
    "Failed to load rooms.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load rooms.");
  }

  return payload.data;
}

export async function createRoom(input: RoomInput): Promise<Room> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/rooms/create-room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Room>>(
    response,
    "Failed to create room.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create room.");
  }

  return payload.data;
}

export async function updateRoom(id: string, input: RoomUpdateInput): Promise<Room> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<Room>>(
    response,
    "Failed to update room.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update room.");
  }

  return payload.data;
}
