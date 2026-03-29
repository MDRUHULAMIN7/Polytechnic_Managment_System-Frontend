import { homeAlumniPrograms } from "./public-home-data";
import { SectionKicker } from "./public-home-shared";

export function PublicHomeAlumni() {
  return (
    <section className="home-alumni-section relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="home-alumni-section-bg absolute inset-0 -z-10" />
      <div className="home-alumni-section-stripe absolute -right-32 top-0 -z-10 h-full w-[40%] skew-x-[-18deg]" />

      <div className="public-shell">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8 home-alumni-copy" data-animate="heading">
            <SectionKicker dark>Alumni network</SectionKicker>
            <h2 className="home-alumni-title font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">
              Our legacy is your <span className="home-alumni-accent">network.</span>
            </h2>
            <p className="home-alumni-copy-muted max-w-xl text-lg leading-8">
              RPI alumni help shape careers, communities, and opportunity. The public experience should make that network feel immediate and real.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2" data-animate-item>
            {homeAlumniPrograms.map((program, index) => (
              <article key={program.title} className={`home-editorial-dark-card rounded-[1.7rem] p-6 ${index % 2 === 0 ? "sm:translate-y-8" : ""}`}>
                <span className="home-alumni-icon inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                  <program.icon className="h-5 w-5" />
                </span>
                <h3 className="home-alumni-card-title mt-5 text-xl font-bold">{program.title}</h3>
                <p className="home-alumni-card-body mt-3 leading-7">{program.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
