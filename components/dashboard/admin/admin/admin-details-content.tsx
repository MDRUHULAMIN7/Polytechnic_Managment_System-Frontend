import type { AdminDetailsContentProps } from "@/lib/type/dashboard/admin/admin/ui";
import { formatDate } from "@/utils/common/utils";
import { StudentProfileImage } from "../student/student-profile-image";

function resolveName(name?: { firstName?: string; middleName?: string; lastName?: string }) {
  if (!name) {
    return "--";
  }

  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}

export function AdminDetailsContent({ details, error }: AdminDetailsContentProps) {
  if (error) {
    return <DashboardErrorBanner error={error} />;
  }

  if (!details) {
    return (
      <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-6 text-center text-sm text-(--text-dim)">
        No details available.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-col gap-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Admin</p>
          <p className="mt-2 text-base font-semibold">{resolveName(details.name)}</p>
          <p className="mt-1 text-xs text-(--text-dim)">ID: {details.id}</p>
        </div>
        <StudentProfileImage
          src={details.profileImg}
          alt={resolveName(details.name)}
          className="h-16 w-16 rounded-full border border-(--line) object-cover"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Email</p>
          <p className="mt-2 font-medium wrap-break-word">{details.email}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Status</p>
          <p className="mt-2 font-medium capitalize">{details.user?.status ?? "--"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Designation
          </p>
          <p className="mt-2 font-medium">{details.designation}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Gender</p>
          <p className="mt-2 font-medium capitalize">{details.gender}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Blood Group
          </p>
          <p className="mt-2 font-medium">{details.bloogGroup ?? "--"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Date of Birth
          </p>
          <p className="mt-2 font-medium">{formatDate(details.dateOfBirth)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Contact
          </p>
          <p className="mt-2 font-medium">{details.contactNo}</p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Emergency: {details.emergencyContactNo}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Present Address
          </p>
          <p className="mt-2 font-medium">{details.presentAddress}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Permanent Address
          </p>
          <p className="mt-2 font-medium">{details.permanentAddress}</p>
        </div>
      </div>
    </div>
  );
}
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
