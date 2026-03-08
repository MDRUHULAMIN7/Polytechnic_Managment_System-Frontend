import { getNoticesServer } from "@/lib/api/notice/server";
import type { Notice, NoticeCategory, PaginationMeta } from "@/lib/type/notice";
import { NoticeBoardPage } from "./notice-board-page";

export async function NoticeBoardServer({
  category,
  page,
  limit,
}: Readonly<{
  category: NoticeCategory | "";
  page: number;
  limit: number;
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

  try {
    const listData = await getNoticesServer({
      category: category || undefined,
      page,
      limit,
    });

    items = listData.result ?? [];
    meta = listData.meta ?? fallbackMeta;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load notices.";
  }

  return (
    <NoticeBoardPage
      items={items}
      meta={meta}
      category={category}
      page={page}
      limit={limit}
      error={error}
    />
  );
}
