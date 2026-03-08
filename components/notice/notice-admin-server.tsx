import { cookies } from "next/headers";
import { getManagedNoticesServer } from "@/lib/api/notice/server";
import type { Notice, PaginationMeta } from "@/lib/type/notice";
import { NoticeAdminPage } from "./notice-admin-page";

export async function NoticeAdminServer({
  searchTerm,
  page,
  limit,
  status,
  category,
  priority,
  targetAudience,
}: Readonly<{
  searchTerm: string;
  page: number;
  limit: number;
  status: Notice["status"] | "";
  category: Notice["category"] | "";
  priority: Notice["priority"] | "";
  targetAudience: Notice["targetAudience"] | "";
}>) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Notice[] = [];
  let meta = fallbackMeta;
  const cookieStore = await cookies();
  const canTargetAdmin = cookieStore.get("pms_role")?.value === "superAdmin";

  try {
    const data = await getManagedNoticesServer({
      searchTerm: searchTerm || undefined,
      page,
      limit,
      status: status || undefined,
      category: category || undefined,
      priority: priority || undefined,
      targetAudience: targetAudience || undefined,
    });
    items = data.result ?? [];
    meta = data.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load notices.";
  }

  return (
    <NoticeAdminPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      status={status}
      category={category}
      priority={priority}
      targetAudience={targetAudience}
      error={error}
      canTargetAdmin={canTargetAdmin}
    />
  );
}
