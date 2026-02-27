import type { Metadata } from "next";
import { getAdminServer } from "@/lib/api/dashboard/admin/admin/server";
import { AdminDetailsContent } from "@/components/dashboard/admin/admin/admin-details-content";
import Link from "next/link";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin Details</h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View Admin information.
          </p>
        </div>
        <Link
          href="/dashboard/admin/admins"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <AdminDetailsContent details={details} error={error} />
    </section>
  );
}
