import Link from "next/link";
import type { Metadata } from "next";
import { getSemesterRegistrationServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { SemesterRegistrationDetailsContent } from "@/components/dashboard/admin/semester-registration/semester-registration-details-content";

export const metadata: Metadata = {
  title: "Semester Registration Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SemesterRegistrationDetailsPage({
  params,
}: PageProps) {
  let error: string | null = null;
  let details = null;

  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const registrationId = decodeURIComponent(rawId);

  if (!registrationId || registrationId === "undefined" || registrationId === "null") {
    error = "Invalid registration id.";
  } else {
    try {
      details = await getSemesterRegistrationServer(registrationId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load registration.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Instructor Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Semester Registration Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View semester registration information.
          </p>
        </div>
        <Link
          href="/dashboard/instructor/semester-registrations"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <SemesterRegistrationDetailsContent details={details} error={error} />
    </section>
  );
}
