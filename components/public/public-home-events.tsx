import Image from "next/image";
import Link from "next/link";
import { homeEvents } from "./public-home-data";
import { SectionKicker } from "./public-home-shared";

export function PublicHomeEvents() {
  return (
    <section className="overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="public-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-center lg:col-span-4" data-animate="heading">
            <div className="space-y-6">
              <SectionKicker>Campus life</SectionKicker>
              <h2 className="font-display text-5xl leading-none tracking-[-0.05em] text-(--text)">
                Campus
                <br />
                <span className="text-(--accent)">vibrancy.</span>
              </h2>
              <p className="max-w-md leading-7 text-(--text-dim)">
                Beyond the classroom, RPI stays active through seminars, innovation showcases, career events, and community programs.
              </p>
              <Link
                href="/events"
                className="home-campus-button focus-ring inline-flex min-h-12 w-fit items-center justify-center rounded-2xl px-6 text-sm font-bold transition"
              >
                Full calendar
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-8 xl:grid-cols-2">
              {homeEvents.map((event) => (
                <article key={event.title} data-animate-item className="group min-w-0">
                  <Link href="/events">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(min-width: 1280px) 28rem, (min-width: 1024px) 50vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_22%,rgba(7,14,28,0.55)_100%)]" />
                      <div className="absolute left-6 top-6 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                        {event.date}
                      </div>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-(--text)">{event.title}</h3>
                    <p className="mt-2 leading-7 text-(--text-dim)">{event.description}</p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
