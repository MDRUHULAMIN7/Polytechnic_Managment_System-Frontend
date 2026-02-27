import { getAcademicDepartmentServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { AcademicDepartmentDetailsContent } from "@/components/dashboard/admin/academic-department/academic-department-details-content";
import { AcademicDepartmentDetailsModalShell } from "@/components/dashboard/admin/academic-department/academic-department-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicDepartmentModalPage({
  params,
}: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const departmentId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;

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
    <AcademicDepartmentDetailsModalShell>
      <AcademicDepartmentDetailsContent details={details} error={error} />
    </AcademicDepartmentDetailsModalShell>
  );
}
