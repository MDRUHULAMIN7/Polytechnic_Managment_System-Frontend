"use server";

import { revalidateTag } from "next/cache";
import type { RoomInput, RoomUpdateInput } from "@/lib/type/dashboard/admin/room";
import {
  createRoomServer,
  ROOMS_TAG,
  roomTag,
  updateRoomServer,
} from "@/lib/api/dashboard/admin/room/server";

export async function createRoomAction(input: RoomInput) {
  const result = await createRoomServer(input);
  revalidateTag(ROOMS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(roomTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updateRoomAction(id: string, input: RoomUpdateInput) {
  const result = await updateRoomServer(id, input);
  revalidateTag(ROOMS_TAG, { expire: 0 });
  revalidateTag(roomTag(id), { expire: 0 });
  return result;
}
