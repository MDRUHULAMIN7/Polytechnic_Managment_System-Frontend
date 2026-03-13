
"use client"
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";

const offerHighlights = [
  "Everything public is grouped by purpose, not department.",
  "Role-based visibility keeps internal updates secure.",
  "Clear calls-to-action guide visitors to the right page.",
];

const offerStats = [
  { value: "4", label: "Public entry points" },
  { value: "3", label: "Core audiences served" },
  { value: "1", label: "Unified campus feed" },
];

const offerCards = [
  {
    icon: Bell,
    title: "Public Noticeboard",
    description:
      "Publish once for the public, while role-specific updates stay private in PMS.",
    cta: { label: "Browse public notices", href: "/notices" },
    accent: "Public access",
  },
  {
    icon: CalendarDays,
    title: "Academic Calendar",
    description:
      "Verified dates for admissions, registration windows, exams, and holidays.",
    cta: { label: "View calendar", href: "/academic-calendar" },
    accent: "Academic governance",
  },
  {
    icon: Megaphone,
    title: "Events Hub",
    description:
      "One trusted feed for seminars, workshops, and campus activities with RSVP-ready details.",
    cta: { label: "Explore events", href: "/events" },
    accent: "Campus energy",
  },
  {
    icon: GraduationCap,
    title: "Alumni Network",
    description:
      "Keep alumni connected through reunions, mentorships, and career collaboration.",
    cta: { label: "Visit alumni", href: "/alumni" },
    accent: "Community for life",
  },
];

const academicTracks = [
  {
    title: "Academic Department Calendar",
    description:
      "Department timelines for semester starts, lab slots, exam weeks, and curriculum milestones.",
    items: ["Semester timeline", "Exam windows", "Lab & room planning"],
  },
  {
    title: "Academic Instructor Calendar",
    description:
      "Instructor schedules with assigned courses, class meetings, and office hours.",
    items: ["Teaching load", "Class sessions", "Office hours"],
  },
];

const eventTracks = [
  {
    title: "Academic Events",
    description: "Seminars, research talks, and guest lectures with attendance tracking.",
    icon: BookOpen,
  },
  {
    title: "Student Experience",
    description: "Cultural programs, clubs, competitions, and campus celebrations.",
    icon: Users,
  },
  {
    title: "Industry & Career",
    description: "Job fairs, employer sessions, alumni panels, and placement drives.",
    icon: MapPin,
  },
];

const alumniCards = [
  {
    title: "Alumni Directory",
    description: "Searchable alumni profiles to reconnect and build professional bridges.",
  },
  {
    title: "Mentorship & Giving",
    description:
      "Match students with alumni mentors and track scholarships or community contributions.",
  },
  {
    title: "Reunions & Stories",
    description:
      "Celebrate alumni milestones, spotlight success stories, and keep everyone involved.",
  },
];

const alumniHighlights = [
  "Profiles stay current with alumni roles and achievements.",
  "Mentorship pairing and giving stay in one workflow.",
  "Reunion updates stay visible alongside key events.",
];

export function LandingSections() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-animate-section]");

      sections.forEach((section) => {
        const heading = section.querySelectorAll("[data-animate='heading']");
        const items = section.querySelectorAll("[data-animate-item]");

        gsap.from(heading, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
          },
        });

        if (items.length) {
          gsap.from(items, {
            opacity: 0,
            y: 22,
            scale: 0.98,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="space-y-16 pb-20">
      <section
        id="offers"
        className="landing-band landing-band-soft"
        data-animate-section
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
            <div className="space-y-6" data-animate="heading">
              <span className="landing-pill">What we offer</span>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                A public experience that feels organized, fast, and trusted.
              </h2>
              <p className="landing-lead">
                Visitors get what they need first: notices, calendars, events, and alumni.
                Each section is designed to reduce confusion and shorten decisions.
              </p>
              <ul className="landing-checklist">
                {offerHighlights.map((item) => (
                  <li key={item} className="landing-check">
                    <span className="landing-check-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="landing-summary-card" data-animate-item>
              <div className="landing-summary-head">
                <div>
                  <p className="text-sm font-semibold text-(--text)">Performance-ready</p>
                  <p className="mt-2 text-sm text-(--text-dim)">
                    Fast loading, clear hierarchy, and predictable paths for every visitor.
                  </p>
                </div>
                <span className="landing-pill landing-pill-compact">UX first</span>
              </div>
              <div className="landing-stat-grid">
                {offerStats.map((stat) => (
                  <div key={stat.label} className="landing-stat">
                    <span className="landing-stat-value">{stat.value}</span>
                    <span className="landing-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {offerCards.map((card) => (
              <article
                key={card.title}
                className="landing-card"
                data-animate-item
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="landing-icon">
                    <card.icon className="h-5 w-5" />
                  </span>
                  <span className="landing-chip">{card.accent}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-(--text)">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                  {card.description}
                </p>
                {card.cta ? (
                  <Link
                    href={card.cta.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--accent)"
                  >
                    {card.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calendar" className="landing-band" data-animate-section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-8">
          <div className="space-y-5" data-animate="heading">
            <span className="landing-pill">Academic calendars</span>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Two calendars, zero confusion.
            </h2>
            <p className="landing-lead">
              Separate department planning from instructor execution. Everyone sees the
              schedule that matters to them, without overlap or noise.
            </p>
            <div className="landing-outline" data-animate-item>
              <p className="text-sm font-semibold text-(--text)">Shared milestones</p>
              <p className="mt-2 text-sm text-(--text-dim)">
                Registration deadlines, exam windows, and official holidays stay synced
                across the platform.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {academicTracks.map((track) => (
              <article
                key={track.title}
                className="landing-card"
                data-animate-item
              >
                <h3 className="text-lg font-semibold text-(--text)">{track.title}</h3>
                <p className="mt-2 text-sm leading-6 text-(--text-dim)">
                  {track.description}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-(--text-dim)">
                  {track.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="events"
        className="landing-band landing-band-contrast"
        data-animate-section
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-5" data-animate="heading">
              <span className="landing-pill">Events</span>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                A single events feed for the entire campus.
              </h2>
              <p className="landing-lead">
                Publish events once and reach students, instructors, alumni, and visitors.
                Locations, RSVP links, and streaming notes stay in one place.
              </p>
              <div className="landing-outline" data-animate-item>
                <p className="text-sm font-semibold text-(--text)">Operations-ready</p>
                <p className="mt-2 text-sm text-(--text-dim)">
                  Approvals, visibility controls, and reminders keep events consistent and
                  discoverable.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {eventTracks.map((track ) => (
                <article
                  key={track.title}
                  className="landing-card"
                  data-animate-item
                >
                  <div className="flex items-center gap-3">
                    <span className="landing-icon">
                      <track.icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-base font-semibold text-(--text)">{track.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                    {track.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="alumni" className="landing-band" data-animate-section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
            <div className="space-y-5" data-animate="heading">
              <span className="landing-pill">Alumni</span>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep alumni connected long after graduation.
              </h2>
              <p className="landing-lead">
                Alumni engagement stays strong when updates, events, and success stories
                have a dedicated home inside PMS.
              </p>
              <ul className="landing-checklist">
                {alumniHighlights.map((item) => (
                  <li key={item} className="landing-check">
                    <span className="landing-check-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent)"
              >
                Explore alumni workflows
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {alumniCards.map((card) => (
                <article
                  key={card.title}
                  className="landing-card"
                  data-animate-item
                >
                  <h3 className="text-base font-semibold text-(--text)">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
