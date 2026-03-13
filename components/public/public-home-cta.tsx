import Link from "next/link";

export function PublicHomeCta() {
  return (
    <section className="home-cta" aria-labelledby="home-cta-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2
          id="home-cta-title"
          className="text-3xl font-bold text-(--text) sm:text-4xl animate-hero-fade-up delay-0"
        >
          Ready to get started?
        </h2>
        <p className="mt-4 text-base text-(--text-dim) sm:text-lg animate-hero-fade-up delay-100">
          Join hundreds of students and faculty already using our platform.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-hero-fade-up delay-200">
          <Link
            href="/register"
            className="hero-cta-primary focus-ring inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
          >
            Create Account
          </Link>
          <Link
            href="/contact"
            className="hero-cta-secondary focus-ring inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
          >
            Schedule Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
