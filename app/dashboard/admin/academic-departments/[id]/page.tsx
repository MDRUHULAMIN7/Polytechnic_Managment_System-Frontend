import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getAcademicDepartmentServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { AcademicDepartmentDetailsContent } from "@/components/dashboard/admin/academic-department/academic-department-details-content";

export const metadata: Metadata = {
  title: "Academic Department Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicDepartmentDetailsPage({
  params,
}: PageProps) {
  let error: string | null = null;
  let details = null;

  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const departmentId = decodeURIComponent(rawId);

  if (!departmentId || departmentId === "undefined" || departmentId === "null") {
    error = "Invalid department id.";
  } else {
    try {
      details = await getAcademicDepartmentServer(departmentId);
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to load department.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Academic Department Details"
        description="View department information."
        action={
          <Link
            href="/dashboard/admin/academic-departments"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <AcademicDepartmentDetailsContent details={details} error={error} />
    </section>
  );
}
