import Link from "next/link";

export default function InstructorNotFoundPage() {
  return (
    <section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-(--line) bg-(--surface) p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary)">
        Dashboard Instructor
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--text)">
        Instructor Page Not Found
      </h1>
      <p className="mt-3 text-sm leading-6 text-(--text-dim)">
        This instructor route does not exist yet or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="focus-ring mt-6 inline-flex rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-(--primary-ink)"
      >
        Back to Dashboard
      </Link>
    </section>
  );
}

