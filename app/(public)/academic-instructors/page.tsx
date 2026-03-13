import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Search, Users } from "lucide-react";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { getPublicAcademicInstructors } from "@/lib/api/public/academic-instructor";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";

export const metadata: Metadata = {
  title: "Academic Instructors",
  description: "Directory of academic instructors and teaching leadership.",
};

const highlights = [
  {
    title: "Teaching excellence",
    description: "Profiles stay aligned with department leadership and schedules.",
    icon: GraduationCap,
  },
  {
    title: "Student clarity",
    description: "Students find the right faculty contact without extra steps.",
    icon: Users,
  },
];

function initialsFromName(name: string) {
  const [first, second] = name.trim().split(" ");
  if (!first) {
    return "—";
  }
  return `${first[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
}

export default async function AcademicInstructorsPage() {
  let instructors: AcademicInstructor[] = [];
  let instructorError: string | null = null;
  const instructorStats = [
    { value: "Verified", label: "Faculty listing" },
    { value: "24/7", label: "Public visibility" },
  ];

  try {
    const payload = await getPublicAcademicInstructors({
      page: 1,
      limit: 24,
      sort: "name",
    });
    instructors = payload.result;
  } catch (error) {
    instructorError =
      error instanceof Error ? error.message : "Failed to load instructors.";
  }

  const instructorCount = instructors.length;
  const instructorCountStat = instructorCount ? `${instructorCount}` : "—";

  return (
    <main className="min-h-screen bg-(--bg) text-(--text)">
      <PublicPageHero
        badge="Academic instructors"
        title="A public directory that feels professional."
        description="Expose verified instructor profiles so students and guardians can find the right faculty contact immediately."
        imageUrl="https://images.unsplash.com/photo-1750931794013-d5e57e45d08c?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1600"
        imageAlt="Instructor leading a classroom session"
        tags={["Public directory", "Faculty verified", "Student access"]}
        stats={[{ value: instructorCountStat, label: "Instructors" }, ...instructorStats]}
        note={{
          title: "Directory status",
          description: "Profiles stay synced with department leadership.",
        }}
        primaryCta={{ href: "/academic-calendar", label: "View academic calendar" }}
        secondaryCta={{ href: "/events", label: "Upcoming events" }}
      />

      <section className="public-section landing-band-soft">
        <div className="public-shell">
          <div className="public-section-head">
            <div>
              <span className="public-kicker">Directory</span>
              <h2 className="public-section-title">Faculty you can reach quickly.</h2>
              <p className="public-section-subtitle">
                One directory for every program with consistent naming, roles, and
                teaching leadership.
              </p>
            </div>
            <Link href="/academic-calendar" className="text-sm font-semibold text-(--accent)">
              Department calendar
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-(--line) bg-(--surface) px-4 py-3 text-sm text-(--text-dim)">
            <Search className="h-4 w-4" />
            <span>Search, filter, and department grouping coming soon.</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {instructors.map((instructor, index) => (
              <article
                key={instructor._id}
                className="public-card public-fade"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="public-initial">
                    {initialsFromName(instructor.name)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-(--text)">
                      {instructor.name}
                    </h3>
                    <p className="text-sm text-(--text-dim)">
                      Academic instructor
                    </p>
                  </div>
                </div>
              </article>
            ))}
            {!instructors.length && (
              <div className="public-card md:col-span-2 xl:col-span-3">
                <p className="text-sm text-(--text-dim)">
                  {instructorError ??
                    "No instructors are available yet. Please check back soon."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-shell">
          <div className="grid gap-4 lg:grid-cols-2">
          {highlights.map((item, index) => (
            <article
              key={item.title}
              className="public-card public-fade"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="landing-icon">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-(--text)">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                {item.description}
              </p>
            </article>
          ))}
          </div>
        </div>
      </section>
    </main>
  );
}
