import Link from "next/link";
import { Award, Handshake, Users } from "lucide-react";

const alumniHighlights = [
  {
    title: "Mentorship network",
    description: "Connect students with alumni mentors and advisors.",
    icon: Handshake,
  },
  {
    title: "Career support",
    description: "Share openings, referrals, and placement opportunities.",
    icon: Award,
  },
  {
    title: "Community stories",
    description: "Celebrate alumni milestones and campus contributions.",
    icon: Users,
  },
];

export function PublicHomeAlumni() {
  return (
    <section className="home-section" aria-labelledby="home-alumni-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-(--accent)" />
            <h2 id="home-alumni-title" className="text-2xl font-semibold text-(--text)">
              Alumni Network
            </h2>
          </div>
          <Link href="/alumni" className="text-sm font-semibold text-(--accent)">
            Explore alumni -&gt;
          </Link>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-(--text-dim) sm:text-base">
          Keep alumni engaged through mentorship, career collaboration, and community
          updates.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {alumniHighlights.map((item, index) => (
            <article
              key={item.title}
              className={`hero-card rounded-xl p-6 animate-hero-scale-in delay-${index * 100}`}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-muted) text-(--accent)">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-(--text)">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
