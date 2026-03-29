import { homeStats } from "./public-home-data";

export function PublicHomeStats() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8" data-animate-section>
      <div className="public-shell">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          {homeStats.map((stat) => (
            <div key={stat.label} data-animate-item className="text-center">
              <p className="font-display text-6xl leading-none tracking-[-0.06em] text-(--text)">{stat.value}</p>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.22em] text-(--text-dim)">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
