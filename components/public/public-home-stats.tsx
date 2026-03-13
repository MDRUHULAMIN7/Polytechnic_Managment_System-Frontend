const stats = [
  { value: "1000+", label: "Active Students" },
  { value: "50+", label: "Faculty Members" },
  { value: "3", label: "Departments" },
  { value: "99.9%", label: "System Uptime" },
];

export function PublicHomeStats() {
  return (
    <section className="home-stats">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`animate-hero-fade-up delay-${index * 100}`}
            >
              <div className="text-4xl font-bold sm:text-5xl">{stat.value}</div>
              <div className="mt-2 text-base opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
