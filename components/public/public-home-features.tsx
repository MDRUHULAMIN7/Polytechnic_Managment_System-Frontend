import Image from "next/image";
import { homeFeatures } from "./public-home-data";
import { SectionKicker } from "./public-home-shared";

export function PublicHomeFeatures() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="public-shell">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="space-y-10" data-animate="heading">
            <div className="space-y-5">
              <SectionKicker>Platform capability</SectionKicker>
              <h2 className="font-display text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
                Precision tools for academic <span className="text-(--accent)">orchestration.</span>
              </h2>
              <p className="max-w-xl text-lg leading-8 text-(--text-dim)">
                A polished public layer connected to the real academic engine behind registration, notices, scheduling, and institutional communication.
              </p>
            </div>

            <div className="space-y-8">
              {homeFeatures.map((feature) => (
                <article key={feature.title} className="flex gap-5" data-animate-item>
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--accent) text-(--accent-ink) shadow-[0_14px_26px_color-mix(in_srgb,var(--accent)_22%,transparent)]">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-(--text)">{feature.title}</h3>
                    <p className="mt-2 leading-7 text-(--text-dim)">{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="relative" data-animate-item>
            <div className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] blur-[120px]" />
            <div className="home-editorial-panel relative overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-(--line) bg-slate-900/90 px-5 py-4 dark:bg-slate-950">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">RPI system dashboard</p>
              </div>
              <div className="relative aspect-[4/3]">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz6eU_CHJ3b-LD-oLxdj10hUwsjnDIxl7KgXakNDA3Q1oTB_2fd4ISzLCvoQ0ViGdHjavx_QJXGEN5vqLiqYfR0IB-9ignicvdeT8QkKL40guizwkBgMwHJEhmyNwZM5MVO3Wm7zq7V-U2paQ2kg5KeCbIbTqqKixvUEJIe63T_WaQKYBgKo-4j354XHysz2G7BjpHDbrPkcqxIzBlf0jmrx8CtwFIj7GAZB2Kbq1rJPWfAW_IM33Z6BJ6Yd-Zlf-hHua_ttKgO8o"
                  alt="Dashboard interface preview"
                  fill
                  className="object-cover opacity-95"
                  sizes="(min-width: 1024px) 40rem, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
