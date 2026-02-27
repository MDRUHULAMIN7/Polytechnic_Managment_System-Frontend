import { cookies } from "next/headers";
import { getAdminsServer } from "@/lib/api/dashboard/admin/admin/server";
import type { PaginationMeta } from "@/lib/type/dashboard/admin/admin";
import type { AdminServerProps } from "@/lib/type/dashboard/admin/admin/ui";
import { AdminPage } from "./admin-page";

export async function AdminPageServer({
  searchTerm,
  page,
  limit,
  sort,
}: AdminServerProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get("pms_role")?.value;
  const canChangeStatus = role === "superAdmin";
  const listFields = "id,name,email,designation,user";

  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items = [];
  let meta = fallbackMeta;

  try {
    const adminsResult = await getAdminsServer({
      searchTerm,
      page,
      limit,
      sort,
      fields: listFields,
    });
    items = adminsResult.result ?? [];
    meta = adminsResult.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return (
    <AdminPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      canChangeStatus={canChangeStatus}
      error={error}
    />
  );
}
