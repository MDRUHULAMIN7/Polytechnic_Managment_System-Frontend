import { AdminDetailsModalShell } from "@/components/dashboard/admin/admin/admin-details-modal-shell";
import { AdminDetailsContent } from "@/components/dashboard/admin/admin/admin-details-content";
import { getAdminServer } from "@/lib/api/dashboard/admin/admin/server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AdminDetailsModalPage({ params }: PageProps) {
  const adminId = params.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getAdminServer(adminId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load admin.";
  }

  return (
    <AdminDetailsModalShell>
      <AdminDetailsContent details={details} error={error} />
    </AdminDetailsModalShell>
  );
}
