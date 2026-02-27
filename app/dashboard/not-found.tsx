import Link from "next/link";

export default function DashboardNotFoundPage() {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center">
      <section className="w-full max-w-2xl rounded-2xl border border-(--line) bg-(--surface) p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-(--text-dim)">
          Dashboard
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-(--text-dim)">
          This dashboard page does not exist or you do not have access yet.
        </p>
        <Link
          href="/dashboard"
          className="focus-ring mt-6 inline-flex items-center justify-center rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
        >
          Back to Dashboard
        </Link>
      </section>
    </div>
  );
}
