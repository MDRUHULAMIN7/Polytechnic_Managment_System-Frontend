import Image from "next/image";
import { TextQuote } from "lucide-react";
import { alumniStories } from "./public-alumni-data";

const leadStory = alumniStories[0];
const quoteStory = alumniStories[1];
const portraitStory = alumniStories[2];
const finalStory = alumniStories[3];

export function PublicAlumniStories() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="public-shell">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-animate="heading">
          <div className="max-w-2xl">
            <span className="public-kicker">Global impact</span>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-[-0.05em] text-(--text) sm:text-5xl">
              Notable success stories
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-8 text-(--text-dim)">
            From advanced research labs to mission-driven startups, RPI graduates are shaping industries everywhere.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <article className="alumni-story-card group relative min-h-[36rem] overflow-hidden rounded-[2rem]" data-animate-item>
            <Image
              src={leadStory.image}
              alt={leadStory.imageAlt}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="alumni-story-overlay absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-white">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/72">
                {leadStory.category}
              </span>
              <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em]">
                {leadStory.name}
              </h3>
              <p className="mt-2 text-sm text-white/84">{leadStory.role}</p>
              <p className="mt-5 border-l-2 border-sky-300 pl-4 font-display text-xl italic leading-8 text-white/92">
                &ldquo;{leadStory.quote}&rdquo;
              </p>
            </div>
          </article>

          <div className="flex flex-col gap-8">
            <article className="alumni-quote-card flex min-h-[17rem] flex-col justify-between rounded-[2rem] p-8 text-white" data-animate-item>
              <TextQuote className="h-12 w-12 text-sky-300" />
              <div>
                <p className="font-display text-2xl leading-10 tracking-[-0.03em]">
                  &ldquo;{quoteStory.quote}&rdquo;
                </p>
                <div className="mt-6">
                  <h3 className="text-lg font-bold">{quoteStory.name}</h3>
                  <p className="mt-1 text-sm text-white/64">{quoteStory.role}</p>
                </div>
              </div>
            </article>

            <article className="alumni-story-card group relative min-h-[17rem] overflow-hidden rounded-[2rem]" data-animate-item>
              <Image
                src={portraitStory.image}
                alt={portraitStory.imageAlt}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-slate-950/18 transition group-hover:bg-slate-950/6" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/78 backdrop-blur-xl">
                  {portraitStory.category}
                </span>
                <h3 className="mt-4 max-w-xs font-display text-2xl tracking-[-0.04em] text-white">
                  {portraitStory.title}
                </h3>
              </div>
            </article>
          </div>

          <article className="alumni-story-card group relative min-h-[36rem] overflow-hidden rounded-[2rem]" data-animate-item>
            <Image
              src={finalStory.image}
              alt={finalStory.imageAlt}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="alumni-story-overlay absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-white">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/72">
                {finalStory.category}
              </span>
              <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em]">
                {finalStory.name}
              </h3>
              <p className="mt-2 text-sm text-white/84">{finalStory.role}</p>
              <p className="mt-5 border-l-2 border-sky-300 pl-4 font-display text-xl italic leading-8 text-white/92">
                &ldquo;{finalStory.quote}&rdquo;
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
