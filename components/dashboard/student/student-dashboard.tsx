export function StudentDashboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Student Dashboard
      </h1>
      <p className="text-sm text-(--text-dim)">
        This area is ready for student modules like enrolled subjects,
        registration, and profile management.
      </p>
      <div className="rounded-xl border border-(--line) bg-(--surface) p-5">
        <p className="text-sm">
          Base area ready:{" "}
          <span className="font-medium">/dashboard/student</span>
        </p>
      </div>
    </section>
  );
}
