import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { alumniMentorship } from "./public-alumni-data";

export function PublicAlumniMentorship() {
  return (
    <section className="landing-band-soft overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="public-shell">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative" data-animate-item>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-square overflow-hidden rounded-[1.75rem]">
                <Image
                  src={alumniMentorship.images[0].src}
                  alt={alumniMentorship.images[0].alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 24rem, 100vw"
                />
              </div>
              <div className="pt-12">
                <div className="relative aspect-square overflow-hidden rounded-[1.75rem]">
                  <Image
                    src={alumniMentorship.images[1].src}
                    alt={alumniMentorship.images[1].alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 24rem, 100vw"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 right-0 h-40 w-40 rounded-full bg-sky-300/18 blur-3xl" />
          </div>

          <div className="max-w-2xl" data-animate="heading">
            <span className="public-kicker">{alumniMentorship.badge}</span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-[-0.05em] text-(--text) sm:text-5xl">
              {alumniMentorship.title}
            </h2>
            <p className="mt-7 text-lg leading-8 text-(--text-dim)">
              {alumniMentorship.description}
            </p>
            <p className="mt-4 text-base font-semibold text-(--text)">
              {alumniMentorship.summary}
            </p>

            <div className="mt-10 space-y-6">
              {alumniMentorship.benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4" data-animate-item>
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-(--accent)" />
                  <div>
                    <h3 className="text-lg font-semibold text-(--text)">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-(--text-dim)">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={alumniMentorship.cta.href}
              className="focus-ring alumni-gradient-button mt-10 inline-flex min-h-14 items-center justify-center rounded-2xl px-8 text-sm font-bold uppercase tracking-[0.18em] text-white"
            >
              {alumniMentorship.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
