import Link from "next/link";
import { CalendarDays, MapPin, Megaphone, Users } from "lucide-react";

const eventHighlights = [
  {
    title: "Academic talks",
    description: "Seminars, research presentations, and guest lectures.",
    icon: CalendarDays,
  },
  {
    title: "Student programs",
    description: "Clubs, cultural events, competitions, and campus celebrations.",
    icon: Users,
  },
  {
    title: "Industry sessions",
    description: "Job fairs, employer sessions, and alumni panels.",
    icon: MapPin,
  },
];

export function PublicHomeEvents() {
  return (
    <section className="home-section" aria-labelledby="home-events-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-(--accent)" />
            <h2 id="home-events-title" className="text-2xl font-semibold text-(--text)">
              Campus Events
            </h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-(--accent)">
            View all events -&gt;
          </Link>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-(--text-dim) sm:text-base">
          One public feed for seminars, student activities, and industry programs so
          everyone stays informed.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {eventHighlights.map((event, index) => (
            <article
              key={event.title}
              className={`hero-card rounded-xl p-6 animate-hero-scale-in delay-${index * 100}`}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-muted) text-(--accent)">
                  <event.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-(--text)">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                    {event.description}
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
