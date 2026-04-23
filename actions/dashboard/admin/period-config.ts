"use server";

import { revalidateTag } from "next/cache";
import type { PeriodConfigInput } from "@/lib/type/dashboard/admin/period-config";
import {
  ACTIVE_PERIOD_CONFIG_TAG,
  createPeriodConfigServer,
  PERIOD_CONFIGS_TAG,
  periodConfigTag,
  updatePeriodConfigServer,
} from "@/lib/api/dashboard/admin/period-config/server";

export async function createPeriodConfigAction(input: PeriodConfigInput) {
  const result = await createPeriodConfigServer(input);
  revalidateTag(PERIOD_CONFIGS_TAG, { expire: 0 });
  revalidateTag(ACTIVE_PERIOD_CONFIG_TAG, { expire: 0 });
  if (result?._id) {
    revalidateTag(periodConfigTag(result._id), { expire: 0 });
  }
  return result;
}

export async function updatePeriodConfigAction(
  id: string,
  input: PeriodConfigInput,
) {
  const result = await updatePeriodConfigServer(id, input);
  revalidateTag(PERIOD_CONFIGS_TAG, { expire: 0 });
  revalidateTag(ACTIVE_PERIOD_CONFIG_TAG, { expire: 0 });
  revalidateTag(periodConfigTag(id), { expire: 0 });
  return result;
}
