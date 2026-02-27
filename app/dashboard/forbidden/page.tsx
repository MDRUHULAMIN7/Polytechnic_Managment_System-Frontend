import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
      <div className="w-full rounded-2xl border border-(--line) bg-(--surface) p-8 text-center">
        <h1 className="text-2xl font-semibold">You are not authorized!</h1>

        <Link
          href="/dashboard"
          className="focus-ring mt-6 inline-flex rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-ink)"
        >
          Retry
        </Link>
      </div>
    </section>
  );
}
