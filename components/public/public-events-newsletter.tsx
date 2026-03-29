export function PublicEventsNewsletter() {
  return (
    <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-28" data-animate-section>
      <div className="public-shell">
        <div
          className="events-newsletter-shell relative overflow-hidden rounded-4xl px-8 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8 lg:px-14 lg:pb-14 lg:pt-10"
          data-animate-item
        >
          <div className="events-newsletter-orb absolute right-[-10%] top-[-10%]  w-80 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-4xl leading-tight tracking-[-0.04em] text-(--text) sm:text-5xl">Never miss a breakthrough.</h2>
            <p className="mt-5 text-lg leading-8 text-(--text-dim)">
              Subscribe to the RPI Polytechnic monthly digest for curated events, research highlights, and campus announcements.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Institutional email"
                className="events-newsletter-input min-h-14 flex-1 rounded-2xl px-5 text-sm outline-none ring-0 transition"
              />
              <button
                type="button"
                className="focus-ring inline-flex min-h-14 items-center justify-center rounded-2xl bg-(--accent) px-8 text-sm font-bold text-(--accent-ink) shadow-[0_18px_38px_rgba(75,125,233,0.22)] transition hover:brightness-110"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
