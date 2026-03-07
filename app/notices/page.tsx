import type { Metadata } from "next";
import { RootNavbar } from "@/components/common/root-navbar";
import { NoticeBoardServer } from "@/components/notice/notice-board-server";
import type { NoticeCategory } from "@/lib/type/notice";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";

export const metadata: Metadata = {
  title: "Notice Board",
  description: "Browse public and role-aware campus notices.",
};

export default async function NoticesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const category = readParam(resolvedSearchParams, "category") as
    | NoticeCategory
    | "";
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);

  return (
    <main className="min-h-screen bg-(--bg) text-(--text)">
      <RootNavbar />
      <NoticeBoardServer category={category} page={page} limit={limit} />
    </main>
  );
}
