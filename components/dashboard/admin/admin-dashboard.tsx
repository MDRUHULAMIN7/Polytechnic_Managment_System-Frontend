export function AdminDashboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
      <p className="text-sm text-(--text-dim)">
        This area is ready for admin modules. In the next step, module cards and
        analytics widgets can be added.
      </p>
      <div className="rounded-xl border border-(--line) bg-(--surface) p-5">
        <p className="text-sm">
          Base area ready: <span className="font-medium">/dashboard/admin</span>
        </p>
      </div>
    </section>
  );
}
