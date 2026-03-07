import type { Metadata } from "next";
import { RootNavbar } from "@/components/common/root-navbar";
import { NoticeDetailPage } from "@/components/notice/notice-detail-page";

export const metadata: Metadata = {
  title: "Notice Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function NoticeDetailsRoute({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <RootNavbar />
      <NoticeDetailPage noticeId={decodeURIComponent(resolvedParams.id ?? "")} />
    </main>
  );
}
