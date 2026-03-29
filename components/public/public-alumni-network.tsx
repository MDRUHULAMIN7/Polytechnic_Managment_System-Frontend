import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { alumniNetwork } from "./public-alumni-data";

export function PublicAlumniNetwork() {
  return (
    <section
      id="alumni-directory"
      className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      data-animate-section
    >
      <div className="public-shell">
        <div className="alumni-network-shell relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-8 lg:px-12" data-animate-item>
          <div className="absolute inset-0">
            <Image
              src={alumniNetwork.backgroundImage}
              alt={alumniNetwork.backgroundAlt}
              fill
              className="object-cover opacity-12"
              sizes="(min-width: 1280px) 80rem, 100vw"
            />
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
              {alumniNetwork.title}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {alumniNetwork.description}
            </p>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {alumniNetwork.stats.map((stat) => (
                <article key={stat.label} className="alumni-network-stat rounded-[1.5rem] p-6">
                  <span className="font-display text-4xl font-bold tracking-[-0.05em] text-sky-300">
                    {stat.value}
                  </span>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-white/58">
                    {stat.label}
                  </p>
                </article>
              ))}
            </div>

            <div className="alumni-network-preview relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-[2rem] border border-white/10" data-animate-item>
              <div className="alumni-network-lock absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] bg-slate-950/72 backdrop-blur-md">
                <div className="max-w-xl px-6 text-center">
                  <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-bold tracking-[-0.04em] text-white">
                    {alumniNetwork.lockTitle}
                  </h3>
                  <Link
                    href={alumniNetwork.cta.href}
                    className="focus-ring alumni-network-button mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl px-8 text-sm font-bold uppercase tracking-[0.18em]"
                  >
                    {alumniNetwork.cta.label}
                  </Link>
                </div>
              </div>

              <div className="relative h-72">
                <Image
                  src={alumniNetwork.previewImage}
                  alt={alumniNetwork.previewAlt}
                  fill
                  className="object-cover blur-[1px]"
                  sizes="(min-width: 1024px) 64rem, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
