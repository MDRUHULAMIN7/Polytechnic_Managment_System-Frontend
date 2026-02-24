import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <section className="w-full rounded-2xl border border-(--line) bg-(--surface) p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Page Not Found</h1>
        <p className="mt-3 text-sm leading-6 text-(--text-dim)">
          The page you requested does not exist or has not been implemented yet.
        </p>
        <Link
          href="/"
          className="focus-ring mt-6 inline-flex rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-(--primary-ink)"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
