export function InstructorDashboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Instructor Dashboard
      </h1>
      <p className="text-sm text-[var(--text-dim)]">
        This area is ready for instructor subject flow, class scheduling, and
        student-related modules.
      </p>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="text-sm">
          Base area ready:{" "}
          <span className="font-medium">/dashboard/instructor</span>
        </p>
      </div>
    </section>
  );
}
