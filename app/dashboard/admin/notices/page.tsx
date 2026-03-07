import type { Metadata } from "next";
import { NoticeAdminServer } from "@/components/notice/notice-admin-server";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import type { Notice } from "@/lib/type/notice";

export const metadata: Metadata = {
  title: "Manage Notices",
};

function parseStatusParam(value: string): Notice["status"] | "" {
  return value === "draft" || value === "published" || value === "archived"
    ? value
    : "";
}

function parseCategoryParam(value: string): Notice["category"] | "" {
  return [
    "academic",
    "exam",
    "holiday",
    "event",
    "administrative",
    "urgent",
    "general",
  ].includes(value)
    ? (value as Notice["category"])
    : "";
}

function parsePriorityParam(value: string): Notice["priority"] | "" {
  return value === "normal" || value === "important" || value === "urgent"
    ? value
    : "";
}

function parseAudienceParam(value: string): Notice["targetAudience"] | "" {
  return value === "public" ||
    value === "student" ||
    value === "instructor" ||
    value === "admin"
    ? value
    : "";
}

export default async function AdminNoticesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const status = parseStatusParam(readParam(resolvedSearchParams, "status"));
  const category = parseCategoryParam(readParam(resolvedSearchParams, "category"));
  const priority = parsePriorityParam(readParam(resolvedSearchParams, "priority"));
  const targetAudience = parseAudienceParam(
    readParam(resolvedSearchParams, "targetAudience"),
  );

  return (
    <NoticeAdminServer
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      status={status}
      category={category}
      priority={priority}
      targetAudience={targetAudience}
    />
  );
}
