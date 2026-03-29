import Image from "next/image";
import Link from "next/link";
import { alumniHero } from "./public-alumni-data";

export function PublicAlumniHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-12" data-animate-section>
      <div className="public-shell">
        <div className="alumni-hero-shell relative overflow-hidden rounded-[2.5rem] px-6 py-12 sm:px-8 lg:min-h-[46rem] lg:px-12 lg:py-16" data-animate-item>
          <div className="absolute inset-0">
            <Image
              src={alumniHero.backdropImage}
              alt={alumniHero.backdropAlt}
              fill
              priority
              className="alumni-hero-backdrop-image object-cover"
              sizes="(min-width: 1280px) 80rem, 100vw"
            />
          </div>
          <div className="alumni-hero-overlay absolute inset-0" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="public-kicker home-editorial-kicker-dark">
                {alumniHero.badge}
              </span>

              <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.96] tracking-[-0.06em] text-(--text) sm:text-6xl lg:text-7xl">
                Legacy beyond the{" "}
                <span className="italic text-(--accent)">{alumniHero.accent}</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-(--text-dim) sm:text-xl">
                {alumniHero.description}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={alumniHero.primaryCta.href}
                  className="focus-ring alumni-gradient-button inline-flex min-h-14 items-center justify-center rounded-2xl px-8 text-sm font-bold uppercase tracking-[0.18em] text-white"
                >
                  {alumniHero.primaryCta.label}
                </Link>
                <Link
                  href={alumniHero.secondaryCta.href}
                  className="focus-ring inline-flex min-h-14 items-center justify-center rounded-2xl border border-transparent px-2 text-sm font-bold uppercase tracking-[0.18em] text-(--text-dim) transition hover:text-(--accent)"
                >
                  {alumniHero.secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:block">
              <div className="relative">
                <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-sky-200/55 blur-3xl" />
                <div className="alumni-glass-panel relative overflow-hidden rounded-[2rem] p-4 shadow-[0_28px_64px_rgba(15,23,42,0.18)]">
                  <div className="relative h-[31rem] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={alumniHero.image}
                      alt={alumniHero.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 34rem, 100vw"
                    />
                  </div>

                  <div className="alumni-glass-panel absolute bottom-8 right-[-1.5rem] max-w-[18rem] rounded-[1.5rem] p-6">
                    <p className="font-display text-xl italic leading-8 text-(--text)">
                      &ldquo;{alumniHero.quote.body}&rdquo;
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-(--text-dim)">
                      {alumniHero.quote.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
