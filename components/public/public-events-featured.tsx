import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";
import { eventFilters, featuredEvent } from "./public-events-data";

export function PublicEventsFeatured() {
  return (
    <>
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20" data-animate-section>
        <div className="public-shell">
          <div className="events-featured-shell relative min-h-[32rem] overflow-hidden rounded-[2rem]" data-animate-item>
            <div className="absolute inset-0">
              <Image
                src={featuredEvent.image}
                alt={featuredEvent.title}
                fill
                priority
                className="events-featured-image object-cover"
                sizes="(min-width: 1280px) 80rem, 100vw"
              />
              <div className="events-featured-overlay absolute inset-0" />
            </div>

            <div className="relative z-10 max-w-3xl p-8 sm:p-10 lg:p-16 xl:p-20">
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <span className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-200">
                  {featuredEvent.badge}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-white/70">
                  <Clock3 className="h-4 w-4 text-sky-300" />
                  {featuredEvent.countdown}
                </span>
              </div>

              <h2 className="font-display text-4xl leading-tight tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                {featuredEvent.title}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                {featuredEvent.description}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  href="/login"
                  className="focus-ring inline-flex min-h-14 items-center justify-center rounded-2xl bg-(--accent) px-8 text-base font-bold text-(--accent-ink) shadow-[0_20px_44px_rgba(75,125,233,0.28)] transition hover:brightness-110"
                >
                  Secure your invitation
                </Link>
                <div className="inline-flex items-center gap-3 text-sm font-semibold text-white/86">
                  <MapPin className="h-4 w-4 text-sky-300" />
                  {featuredEvent.location}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8 lg:pb-12" data-animate-section>
        <div className="public-shell">
          <div className="flex flex-col gap-5 border-b border-(--line) pb-4 lg:flex-row lg:items-center lg:justify-between" data-animate-item>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {eventFilters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  className={`events-filter-button rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] transition ${
                    index === 0
                      ? "events-filter-button-active"
                      : ""
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-3 text-sm text-(--text-dim) lg:flex">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--line) bg-(--surface)">
                24
              </span>
              Displaying curated event results
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
