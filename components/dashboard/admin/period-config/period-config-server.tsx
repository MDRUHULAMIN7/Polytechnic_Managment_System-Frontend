import { cookies } from "next/headers";
import type {
  PaginationMeta,
  PeriodConfig,
} from "@/lib/type/dashboard/admin/period-config";
import type { PeriodConfigServerProps } from "@/lib/type/dashboard/admin/period-config/ui";
import { getPeriodConfigsServer } from "@/lib/api/dashboard/admin/period-config/server";
import { PeriodConfigPage } from "./period-config-page";

export async function PeriodConfigPageServer({
  searchTerm,
  page,
  limit,
  sort,
  isActive,
}: PeriodConfigServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: PeriodConfig[] = [];
  let meta = fallbackMeta;

  try {
    const result = await getPeriodConfigsServer({
      searchTerm,
      page,
      limit,
      sort,
      isActive: isActive || undefined,
    });

    items = result.result ?? [];
    meta = result.meta ?? fallbackMeta;
  } catch (fetchError) {
    error =
      fetchError instanceof Error
        ? fetchError.message
        : "Failed to load period configurations.";
  }

  const cookieStore = await cookies();
  const canManage = cookieStore.get("pms_role")?.value === "superAdmin";

  return (
    <PeriodConfigPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      isActive={isActive}
      canManage={canManage}
      error={error}
    />
  );
}
