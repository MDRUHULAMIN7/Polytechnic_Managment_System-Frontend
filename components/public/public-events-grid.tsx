import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Bookmark, MapPin, School, Users } from "lucide-react";
import { eventGrid, symposiumAttendees } from "./public-events-data";

export function PublicEventsGrid() {
  return (
    <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-28" data-animate-section>
      <div className="public-shell">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <article
            className="group md:col-span-8"
            data-animate-item
          >
            <div className="events-editorial-card grid h-full overflow-hidden rounded-[2rem] md:grid-cols-2">
              <div className="relative min-h-[18rem] overflow-hidden">
                <Image
                  src={eventGrid.careerFair.image}
                  alt={eventGrid.careerFair.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>

              <div className="flex flex-col justify-between p-8 lg:p-10">
                <div>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <span className="font-display text-3xl font-bold tracking-[-0.05em] text-(--accent)">{eventGrid.careerFair.date}</span>
                    <Bookmark className="h-5 w-5 text-(--text-dim)" />
                  </div>
                  <h3 className="font-display text-3xl leading-tight tracking-[-0.04em] text-(--text)">
                    {eventGrid.careerFair.title}
                  </h3>
                  <p className="mt-4 leading-7 text-(--text-dim)">{eventGrid.careerFair.description}</p>
                  <div className="mt-6 space-y-3 text-sm font-semibold text-(--text)">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-(--accent)" />
                      {eventGrid.careerFair.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-(--accent)" />
                      {eventGrid.careerFair.attendance}
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="focus-ring mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl border border-(--line) bg-(--surface) px-6 text-sm font-bold uppercase tracking-[0.2em] text-(--text) transition hover:border-(--accent) hover:bg-(--accent) hover:text-(--accent-ink)"
                >
                  Register now
                </Link>
              </div>
            </div>
          </article>

          <article
            className="group md:col-span-4"
            data-animate-item
          >
            <div className="events-soft-card flex h-full flex-col rounded-[2rem] p-8 lg:p-10">
              <div className="mb-8">
                <span className="events-chip inline-flex rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em]">
                  {eventGrid.workshop.badge}
                </span>
              </div>

              <h3 className="font-display text-2xl leading-snug tracking-[-0.04em] text-(--text)">{eventGrid.workshop.title}</h3>
              <p className="mt-4 leading-7 text-(--text-dim)">{eventGrid.workshop.description}</p>

              <div className="mt-auto pt-10">
                <span className="font-display text-4xl font-light italic text-(--accent)">{eventGrid.workshop.date}</span>
                <span className="mt-2 block text-xs font-bold uppercase tracking-[0.24em] text-(--text-dim)">{eventGrid.workshop.location}</span>
                <Link href="/events" className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-(--accent)">
                  Details
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </article>

          <article
            className="group md:col-span-4"
            data-animate-item
          >
            <div className="events-media-card h-full overflow-hidden rounded-[2rem]">
              <div className="relative h-56">
                <Image
                  src={eventGrid.cybersecurity.image}
                  alt={eventGrid.cybersecurity.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute right-4 top-4 rounded-xl border border-white/30 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-900 backdrop-blur-xl">
                  {eventGrid.cybersecurity.tag}
                </div>
              </div>

              <div className="p-8">
                <span className="block text-xs font-bold uppercase tracking-[0.24em] text-(--text-dim)">{eventGrid.cybersecurity.category}</span>
                <h3 className="mt-3 font-display text-2xl leading-snug tracking-[-0.04em] text-(--text)">
                  {eventGrid.cybersecurity.title}
                </h3>
                <Link href="/login" className="mt-6 inline-flex text-sm font-bold text-(--accent) underline decoration-(--line) underline-offset-4 transition hover:decoration-(--accent)">
                  Register for access
                </Link>
              </div>
            </div>
          </article>

          <article
            className="group md:col-span-5"
            data-animate-item
          >
            <div className="flex h-full flex-col rounded-[2rem] bg-[linear-gradient(140deg,#081122_0%,#0f2350_58%,#111827_100%)] p-8 text-white shadow-[0_30px_70px_rgba(15,23,42,0.22)] transition duration-500 hover:-translate-y-1 lg:p-10">
              <div className="mb-12 flex items-start justify-between gap-6">
                <School className="h-7 w-7 text-sky-300" />
                <div className="text-right">
                  <span className="block font-display text-3xl tracking-[-0.05em]">{eventGrid.symposium.date}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.24em] text-white/60">{eventGrid.symposium.location}</span>
                </div>
              </div>

              <h3 className="font-display text-3xl leading-tight tracking-[-0.04em]">{eventGrid.symposium.title}</h3>
              <p className="mt-5 leading-8 text-white/72">{eventGrid.symposium.description}</p>

              <div className="mb-10 mt-10 flex items-center -space-x-3">
                {symposiumAttendees.map((avatar) => (
                  <Image
                    key={avatar}
                    src={avatar}
                    alt="Research symposium attendee"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover"
                  />
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-(--accent) text-[10px] font-bold text-(--accent-ink)">
                  +12
                </div>
              </div>

              <Link
                href="/login"
                className="events-submit-button focus-ring mt-auto inline-flex min-h-14 items-center justify-center rounded-2xl px-6 text-sm font-bold uppercase tracking-[0.2em]"
              >
                Submit abstract
              </Link>
            </div>
          </article>

          <article
            className="group md:col-span-3"
            data-animate-item
          >
            <div className="events-minor-card flex h-full flex-col rounded-[2rem] p-8">
              <Award className="h-5 w-5 text-(--accent)" />
              <span className="mt-6 block text-xs font-bold uppercase tracking-[0.24em] text-(--text-dim)">{eventGrid.robotics.category}</span>
              <h3 className="mt-3 font-display text-2xl leading-snug tracking-[-0.04em] text-(--text)">
                {eventGrid.robotics.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-(--text-dim)">{eventGrid.robotics.description}</p>
              <span className="mt-auto pt-6 text-xs font-bold uppercase tracking-[0.24em] text-(--accent)">{eventGrid.robotics.meta}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
