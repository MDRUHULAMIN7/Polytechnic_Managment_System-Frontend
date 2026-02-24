import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-(--line) bg-(--surface) p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Access Restricted</h1>
      <p className="mt-3 text-sm leading-6 text-(--text-dim)">
        This page is not available for your current role. Use an authorized account or return to your dashboard.
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
