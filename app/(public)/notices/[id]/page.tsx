import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NoticeDetailPage } from "@/components/notice/notice-detail-page";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export const metadata: Metadata = {
  title: "Notice Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function NoticeDetailsRoute({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const cookieStore = await cookies();
  const isAuthenticated =
    Boolean(cookieStore.get("pms_access_token")?.value) ||
    Boolean(cookieStore.get("refreshToken")?.value);

  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <PublicNavbar />
      <main
        id="main-content"
        className="min-h-screen overflow-x-hidden bg-(--bg) text-(--text)"
      >
        <NoticeDetailPage
          noticeId={decodeURIComponent(resolvedParams.id ?? "")}
          isAuthenticated={isAuthenticated}
        />
      </main>
      <PublicFooter />
    </>
  );
}
