import Link from "next/link";
import { alumniClosing } from "./public-alumni-data";

export function PublicAlumniCta() {
  return (
    <section className="px-4 py-24 text-center sm:px-6 lg:px-8" data-animate-section>
      <div className="public-shell">
        <div className="mx-auto max-w-4xl" data-animate="heading">
          <div className="mx-auto mb-10 h-1 w-20 rounded-full bg-(--accent)" />
          <h2 className="font-display text-4xl font-bold leading-tight tracking-[-0.05em] text-(--text) sm:text-5xl">
            {alumniClosing.title}
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-(--text-dim)">
            {alumniClosing.description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" data-animate-item>
            <Link
              href={alumniClosing.primaryCta.href}
              className="focus-ring alumni-gradient-button inline-flex min-h-14 items-center justify-center rounded-2xl px-8 text-sm font-bold uppercase tracking-[0.18em] text-white"
            >
              {alumniClosing.primaryCta.label}
            </Link>
            <Link
              href={alumniClosing.secondaryCta.href}
              className="focus-ring inline-flex min-h-14 items-center justify-center rounded-2xl border border-(--line) bg-(--surface) px-8 text-sm font-bold uppercase tracking-[0.18em] text-(--text) transition hover:border-(--accent) hover:text-(--accent)"
            >
              {alumniClosing.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
