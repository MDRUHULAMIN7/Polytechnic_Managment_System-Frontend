"use server";

import { revalidateTag } from "next/cache";
import {
  completeClassSessionServer,
  getDashboardSummaryServer,
  startClassSessionServer,
  syncClassSessionsServer,
} from "@/lib/api/dashboard/class-session/server";
import {
  CLASS_DASHBOARD_TAG,
  CLASS_SESSIONS_TAG,
  classSessionTag,
} from "@/lib/api/dashboard/class-session/tags";
import type {
  StartClassSessionInput,
  SyncClassSessionsInput,
} from "@/lib/type/dashboard/class-session";

export async function syncClassSessionsAction(input: SyncClassSessionsInput) {
  const result = await syncClassSessionsServer(input);
  revalidateTag(CLASS_SESSIONS_TAG, { expire: 0 });
  revalidateTag(CLASS_DASHBOARD_TAG, { expire: 0 });
  return result;
}

export async function startClassSessionAction(
  id: string,
  input: StartClassSessionInput,
) {
  const result = await startClassSessionServer(id, input);
  revalidateTag(CLASS_SESSIONS_TAG, { expire: 0 });
  revalidateTag(CLASS_DASHBOARD_TAG, { expire: 0 });
  revalidateTag(classSessionTag(id), { expire: 0 });
  return result;
}

export async function completeClassSessionAction(id: string) {
  const result = await completeClassSessionServer(id);
  revalidateTag(CLASS_SESSIONS_TAG, { expire: 0 });
  revalidateTag(CLASS_DASHBOARD_TAG, { expire: 0 });
  revalidateTag(classSessionTag(id), { expire: 0 });
  return result;
}

export async function refreshClassDashboardAction() {
  revalidateTag(CLASS_DASHBOARD_TAG, { expire: 0 });
  return getDashboardSummaryServer();
}
