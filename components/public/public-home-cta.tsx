import Link from "next/link";

export function PublicHomeCta() {
  return (
    <section className="px-4 pb-24 pt-8 text-center sm:px-6 lg:px-8 lg:pb-32" data-animate-section>
      <div className="public-shell">
        <div className="mx-auto max-w-4xl space-y-10" data-animate="heading">
          <div className="space-y-4">
            <h2 className="font-display text-5xl leading-none tracking-[-0.05em] text-(--text) sm:text-7xl">Join the digital campus.</h2>
            <p className="mx-auto max-w-2xl text-xl leading-8 text-(--text-dim)">
              A sharper, calmer, and more professional public experience for students, guardians, alumni, and academic leadership.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="focus-ring inline-flex min-h-16 items-center justify-center rounded-[1.25rem] bg-(--accent) px-10 text-lg font-bold text-(--accent-ink) shadow-[0_20px_40px_rgba(75,125,233,0.24)] transition hover:brightness-110"
            >
              Portal login
            </Link>
            <Link
              href="/notices"
              className="focus-ring inline-flex min-h-16 items-center justify-center rounded-[1.25rem] border border-(--line) bg-(--surface) px-10 text-lg font-bold text-(--text) transition hover:border-(--accent) hover:bg-(--surface-muted)"
            >
              Browse notices
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-sm font-bold uppercase tracking-[0.22em] text-(--text-dim)">
            <span>Role-based platform</span>
            <span>Government-ready workflows</span>
            <span>Real-time updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
