import Link from "next/link";
import { Bell } from "lucide-react";

type NoticePriority = "important" | "urgent" | "normal";

type NoticeItem = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  priority: NoticePriority;
};

// TODO: Replace sample notices with API data.
const sampleNotices: NoticeItem[] = [
  {
    id: 1,
    title: "Mid-term Examination Schedule Published",
    excerpt:
      "The mid-term examination schedule for all departments has been published. Students are advised to check the notice board regularly.",
    date: "2026-03-08",
    category: "exam",
    priority: "important",
  },
  {
    id: 2,
    title: "Campus Closed on March 26",
    excerpt:
      "The campus will remain closed on March 26 on account of Independence Day. Regular classes will resume on March 27.",
    date: "2026-03-05",
    category: "holiday",
    priority: "urgent",
  },
  {
    id: 3,
    title: "Semester Registration Opens",
    excerpt:
      "Online semester registration for Summer 2026 will open from March 15. Students can register through the student portal.",
    date: "2026-03-01",
    category: "academic",
    priority: "normal",
  },
];

function badgeLabel(priority: NoticePriority) {
  if (priority === "urgent") {
    return "Urgent";
  }
  if (priority === "important") {
    return "Important";
  }
  return "General";
}

export function PublicHomeNotices() {
  return (
    <section className="home-section" aria-labelledby="home-notices-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 animate-hero-fade-up delay-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-(--accent)" />
            <h2 id="home-notices-title" className="text-2xl font-semibold text-(--text)">
              Latest Notices
            </h2>
          </div>
          <Link href="/notices" className="text-sm font-semibold text-(--accent)">
            View All Notices -&gt;
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {sampleNotices.map((notice, index) => (
            <article
              key={notice.id}
              className={`hero-card rounded-xl p-6 animate-hero-scale-in delay-${index * 100}`}
            >
              <span
                className={`home-notice-badge ${
                  notice.priority === "important"
                    ? "home-notice-badge-important"
                    : notice.priority === "urgent"
                      ? "home-notice-badge-urgent"
                      : ""
                }`}
              >
                {badgeLabel(notice.priority)}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-(--text)">
                {notice.title}
              </h3>
              <p className="mt-2 text-sm text-(--text-dim) line-clamp-2">
                {notice.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-(--text-dim)">
                <time dateTime={notice.date}>{notice.date}</time>
                <Link href="/notices" className="text-sm font-semibold text-(--accent)">
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
