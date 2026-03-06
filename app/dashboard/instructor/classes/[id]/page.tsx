import Link from "next/link";
import type { Metadata } from "next";
import { InstructorClassDetail } from "@/components/dashboard/instructor/class-session/instructor-class-detail";
import { getInstructorClassDetailsServer } from "@/lib/api/dashboard/class-session/server";
import { buildClassSessionBackHref } from "@/utils/dashboard/class-session-list";

export const metadata: Metadata = {
  title: "Instructor Class Details",
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function InstructorClassDetailsPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const details = await getInstructorClassDetailsServer(resolvedParams.id);
  const backHref = buildClassSessionBackHref(
    "/dashboard/instructor/classes",
    resolvedSearchParams,
  );

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
      >
        Back to My Classes
      </Link>
      <InstructorClassDetail details={details} />
    </div>
  );
}
