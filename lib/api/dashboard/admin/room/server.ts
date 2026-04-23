import { cookies } from "next/headers";
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
  ACCESS_TOKEN_COOKIE,
  authHeaders,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import { ROOMS_TAG, roomTag } from "./tags";

async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRoomsServer(
  params: RoomListParams,
): Promise<RoomListPayload> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const query = buildRoomQuery(params);
  const response = await fetch(`${API_BASE_URL}/rooms?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [ROOMS_TAG],
    },
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

export async function createRoomServer(input: RoomInput): Promise<Room> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/rooms/create-room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
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

export async function updateRoomServer(
  id: string,
  input: RoomUpdateInput,
): Promise<Room> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
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

export { ROOMS_TAG, roomTag };
