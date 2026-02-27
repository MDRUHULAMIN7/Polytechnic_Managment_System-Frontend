"use server";

import { revalidateTag } from "next/cache";
import type { AdminCreatePayload, AdminStatus } from "@/lib/type/dashboard/admin/admin";
import {
  ADMINS_TAG,
  adminTag,
  changeAdminStatusServer,
  createAdminServer,
  userTag,
} from "@/lib/api/dashboard/admin/admin/server";

export async function createAdminAction(payload: AdminCreatePayload) {
  const result = await createAdminServer(payload);
  revalidateTag(ADMINS_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(adminTag(result._id), { expire: 0 });
  }
  if (result?.user?._id) {
    revalidateTag(userTag(result.user._id), { expire: 0 });
  }
  return result;
}

export async function changeAdminStatusAction(
  userId: string,
  status: AdminStatus,
  adminId?: string
) {
  const result = await changeAdminStatusServer(userId, status);
  revalidateTag(ADMINS_TAG, { expire: 0 });
  if (adminId) {
    revalidateTag(adminTag(adminId), { expire: 0 });
  }
  revalidateTag(userTag(userId), { expire: 0 });
  return result;
}
