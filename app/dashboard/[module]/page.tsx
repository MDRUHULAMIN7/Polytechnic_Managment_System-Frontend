import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

type ModulePageProps = {
  params: Promise<{ module: string }> | { module: string };
};

const knownModules = new Set([
  "academic-instructor",
  "academic-department",
  "academic-semester",
  "semester-registrations",
  "offered-subjects",
  "instructors",
  "students",
  "subjects",
  "admins"
]);

export const metadata: Metadata = {
  title: "Module Workspace"
};

export default async function ModulePage({ params }: ModulePageProps) {
  const { module } = await params;

  if (!knownModules.has(module)) {
    notFound();
  }

  if (module === "admins") {
    const cookieStore = await cookies();
    const role = cookieStore.get("rms_role")?.value;
    if (role !== "superAdmin") {
      redirect("/dashboard/forbidden");
    }
  }

  const title = module
    .split("-")
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-(--line) bg-(--surface) p-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-(--text-dim)">
          This module shell is ready for responsive table, details view, and create/update forms based on your backend
          services.
        </p>
      </header>

      <article className="rounded-2xl border border-dashed border-(--line) bg-(--surface) p-6">
        <h2 className="text-xl font-semibold tracking-tight">Implementation Next Step</h2>
        <p className="mt-2 text-sm leading-6 text-(--text-dim)">
          We can now implement data fetching, reusable search/filter/pagination utilities, and CRUD screens for this
          module.
        </p>
      </article>
    </section>
  );
}
