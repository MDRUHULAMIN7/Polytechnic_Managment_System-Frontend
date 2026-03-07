import type { Metadata } from "next";
import { getAdminServer } from "@/lib/api/dashboard/admin/admin/server";
import { AdminDetailsContent } from "@/components/dashboard/admin/admin/admin-details-content";
import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";

export const metadata: Metadata = {
  title: "Admin Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AdminDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const adminId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getAdminServer(adminId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load admin.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Admin Details"
        description="View Admin information."
        action={
          <Link
            href="/dashboard/admin/admins"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <AdminDetailsContent details={details} error={error} />
    </section>
  );
}
