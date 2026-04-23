import type { PaginationMeta, Room } from "@/lib/type/dashboard/admin/room";
import type { RoomServerProps } from "@/lib/type/dashboard/admin/room/ui";
import { getRoomsServer } from "@/lib/api/dashboard/admin/room/server";
import { RoomPage } from "./room-page";

export async function RoomPageServer({
  searchTerm,
  page,
  limit,
  sort,
  isActive,
}: RoomServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Room[] = [];
  let meta = fallbackMeta;

  try {
    const result = await getRoomsServer({
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
      fetchError instanceof Error ? fetchError.message : "Failed to load rooms.";
  }

  return (
    <RoomPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      isActive={isActive}
      error={error}
    />
  );
}
