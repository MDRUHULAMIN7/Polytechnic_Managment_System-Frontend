import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Megaphone, Users } from "lucide-react";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { PublicPageMotion } from "@/components/public/public-page-motion";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming campus events, seminars, and student programs.",
};

const featuredTracks = [
  {
    title: "Academic programs",
    details: "Seminars, research talks, and guest lectures with attendance notes.",
    icon: CalendarDays,
  },
  {
    title: "Student experience",
    details: "Clubs, competitions, cultural nights, and campus celebrations.",
    icon: Users,
  },
  {
    title: "Industry and careers",
    details: "Employer sessions, job fairs, alumni panels, and placement days.",
    icon: MapPin,
  },
];

const readinessChecklist = [
  "One publish flow for public and internal visibility.",
  "RSVP links, locations, and entry rules are all in one place.",
  "Reminders and updates are tracked for every audience.",
];

const operationsSteps = [
  {
    title: "Submit and approve",
    description:
      "Departments submit events, leadership approves, and the public feed updates.",
  },
  {
    title: "Promote and coordinate",
    description:
      "Share links, update venues, and align with security and facilities teams.",
  },
  {
    title: "Track and recap",
    description:
      "Attendance notes, media, and follow-ups stay attached to the event record.",
  },
];

const operationsMetrics = [
  { value: "Live", label: "RSVP status" },
  { value: "Central", label: "Event registry" },
  { value: "Role-based", label: "Visibility rules" },
];

export default function EventsPage() {
  return (
    <PublicPageMotion>
      <main className="min-h-screen bg-(--bg) text-(--text)">
        <PublicPageHero
          badge="Events"
          title="One campus calendar that feels organized and live."
          description="Share seminars, workshops, and student programs from a single place with clear visibility, clean navigation, and immediate updates."
          imageUrl="https://images.unsplash.com/photo-1759922378100-89dca9fe3c98?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1600"
          imageAlt="Audience attending a campus seminar"
          tags={["Campus calendar", "Student life", "Industry events"]}
          stats={[
            { value: "3", label: "Event tracks" },
            { value: "Live", label: "Updates" },
            { value: "24/7", label: "Public view" },
          ]}
          note={{
            title: "Events board",
            description: "Visibility controls ensure the right audience sees each event.",
          }}
          primaryCta={{ href: "/notices", label: "Public noticeboard" }}
          secondaryCta={{ href: "/academic-calendar", label: "Academic calendar" }}
        />

        <section
          className="public-section landing-band-soft"
          data-animate-section
        >
          <div className="public-shell">
            <div className="public-split">
              <div>
                <div className="public-section-head" data-animate="heading">
                  <div>
                    <span className="public-kicker">Programming</span>
                    <h2 className="public-section-title">
                      Featured campus programming.
                    </h2>
                    <p className="public-section-subtitle">
                      A clear view of academic, student, and career events with clean
                      navigation for every visitor.
                    </p>
                  </div>
                  <Link href="/alumni" className="text-sm font-semibold text-(--accent)">
                    Alumni engagement
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {featuredTracks.map((event) => (
                    <article
                      key={event.title}
                      className="public-card"
                      data-animate-item
                    >
                      <span className="landing-icon">
                        <event.icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold text-(--text)">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                        {event.details}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="public-panel" data-animate-item>
                <p className="public-panel-title">Event readiness</p>
                <p className="public-panel-text">
                  Every event ships with the details people ask for most.
                </p>
                <ul className="public-panel-list">
                  {readinessChecklist.map((item) => (
                    <li key={item} className="public-panel-item">
                      <span className="public-panel-dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="public-metrics">
                  {operationsMetrics.map((metric) => (
                    <div key={metric.label} className="public-metric">
                      <span className="public-metric-value">{metric.value}</span>
                      <span className="public-metric-label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            <div className="mt-8 public-cta" data-animate-item>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-(--text)">Next flagship event</p>
                  <p className="mt-2 text-sm text-(--text-dim)">
                    Annual Tech Symposium - Auditorium A - 10:00 AM to 3:00 PM
                  </p>
                </div>
                <span className="text-sm font-semibold text-(--accent)">
                  RSVP workflows ready
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section" data-animate-section>
          <div className="public-shell">
            <div className="public-section-head" data-animate="heading">
              <div>
                <span className="public-kicker">Operations</span>
                <h2 className="public-section-title">
                  Built for reliable event execution.
                </h2>
                <p className="public-section-subtitle">
                  The public page stays clean while admin workflows handle approvals and
                  reminders.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-(--text-dim)">
                <Megaphone className="h-4 w-4" />
                One workflow from planning to follow-up.
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {operationsSteps.map((step, index) => (
                <article key={step.title} className="public-card public-step" data-animate-item>
                  <span className="public-step-index">{`0${index + 1}`}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-(--text)">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 public-cta" data-animate-item>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-(--text)">
                    Keep every event on schedule
                  </p>
                  <p className="mt-2 text-sm text-(--text-dim)">
                    Publish once, update fast, and keep stakeholders informed in real time.
                  </p>
                </div>
                <Link href="/notices" className="text-sm font-semibold text-(--accent)">
                  View public notices
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageMotion>
  );
}
