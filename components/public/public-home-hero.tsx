import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { SectionKicker } from "./public-home-shared";

const heroStats = [
  { value: "50k+", label: "Global alumni" },
  { value: "98%", label: "Employment momentum" },
  { value: "Live", label: "Notices and updates" },
];

const mobileHighlights = ["Advanced Robotics", "95% attendance", "Block C update"];

export function PublicHomeHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
      <div className="home-editorial-hero-bg absolute inset-0 -z-10" />
      <div className="home-editorial-hero-orb absolute left-1/2 top-[-18rem] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-3xl" />

      <div className="public-shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="max-w-3xl space-y-8">
              <div className="space-y-5">
                <SectionKicker>Institutional excellence</SectionKicker>
                <div className="space-y-4">
                  <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] text-(--text) sm:text-6xl lg:text-8xl">
                    A smarter campus
                    <br />
                    <span className="text-(--accent)">experience.</span>
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-(--text-dim) sm:text-lg">
                    RPI Polytechnic brings notices, calendars, instructors, events, alumni, and academic operations into one digital front door built for clarity and trust.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-(--accent) px-7 text-sm font-bold text-(--accent-ink) shadow-[0_18px_40px_rgba(75,125,233,0.28)] transition hover:translate-y-[-1px] hover:brightness-110"
                >
                  Student Portal Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/academic-instructors"
                  className="focus-ring inline-flex min-h-14 items-center justify-center rounded-2xl border border-(--line) bg-(--surface) px-7 text-sm font-bold text-(--text) transition hover:border-(--accent) hover:bg-(--surface-muted)"
                >
                  Explore Instructors
                </Link>
              </div>

              <div className="grid gap-6 border-t border-(--line) pt-8 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-4xl font-bold tracking-[-0.04em] text-(--text)">{stat.value}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-(--text-dim)">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative mx-auto hidden max-w-[34rem] lg:block">
              <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)] blur-3xl" />
              <div className="absolute bottom-6 right-2 h-44 w-44 rounded-full bg-[rgba(16,185,129,0.18)] blur-3xl" />

              <div className="relative aspect-[1/1.05]">
                <div className="absolute inset-0 translate-x-6 translate-y-2 rotate-[7deg] overflow-hidden rounded-[2rem] border border-white/15 bg-(--surface) opacity-30 shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQlSHBwaM2i-AwyMaeNTlZ90LpnUf9sv7Yn7HJik0FR5RScUzOuoNO63gJOZShyK0FlXTFCu997CpdJXkR7SfxOedH60E8xdg4dAvUJ-gyTtDPHW66twxQ26j_jdzXqjMyHz8-Tek8hJxbgz4d-WOPkeSYBobFmj0xYWjDUEvAS3Lrb3VsbFsfdZYJbiwvuqB3qIKcfgPpcXHVky0eoGRhHZE2djKcGbilNuaZCOhQ_x81kGvTaKT4AhDplKPZNGh9fKPVS9scCFM"
                    alt="Modern academic building exterior"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 36rem, 100vw"
                  />
                </div>

                <div className="absolute inset-0 -rotate-[4deg] overflow-hidden rounded-[2rem] border border-[color:color-mix(in_srgb,var(--line)_80%,white_18%)] bg-(--surface) shadow-[0_40px_90px_rgba(15,23,42,0.16)]">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4nQyb0VLvP6mQVnwPqPerMu2MSk_jsIWB6iZMwkXLf7ddRCEtCKBf-i-e7O7zZixMC8iq7pdQwB4wYwSAtKk-69jBtAvaQQaoLNwSceIefvr1TVICyiHfg9NDZh_dymRKFza6O-SZEzoRZHQ7hnZcXQvR_BNjbaM6x2nChnMjJF5BI6epKxAWwzgV_G-8YZAFZDrBOIPtbPvPoxBJmoVNE59dtq1W008v5sLaNL82Y6vC2nPcBNlCBrQhU9Lx1hL7nz37m0BOgNs"
                    alt="Students walking through campus"
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 36rem, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(8,15,28,0.22)_100%)]" />
                </div>

                <div className="home-editorial-glass absolute -right-8 top-0 w-64 rounded-[1.5rem] p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--accent)_14%,white_70%)] text-(--accent)">
                      <Clock3 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-(--text-dim)">Next class</p>
                      <p className="mt-1 text-sm font-bold text-(--text)">Advanced Robotics</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-(--text-dim)">Hall B4 | 10:30 AM</p>
                </div>

                <div className="home-editorial-glass absolute left-[-2.75rem] top-[46%] w-56 rounded-[1.4rem] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-(--text-dim)">Attendance</p>
                    <p className="text-xs font-bold text-(--accent)">95%</p>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-(--surface-muted)">
                    <div className="h-full w-[95%] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent)_92%,white_6%),#2bc7a7)]" />
                  </div>
                </div>

                <div className="home-editorial-glass absolute bottom-[-2rem] right-3 w-72 rounded-[1.5rem] p-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-600">Latest notice</p>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-6 text-(--text)">Lab renovations begin Monday. Access around Block C is temporarily restricted.</p>
                </div>
              </div>
            </div>

            <article className="home-editorial-panel overflow-hidden rounded-[2rem] lg:hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4nQyb0VLvP6mQVnwPqPerMu2MSk_jsIWB6iZMwkXLf7ddRCEtCKBf-i-e7O7zZixMC8iq7pdQwB4wYwSAtKk-69jBtAvaQQaoLNwSceIefvr1TVICyiHfg9NDZh_dymRKFza6O-SZEzoRZHQ7hnZcXQvR_BNjbaM6x2nChnMjJF5BI6epKxAWwzgV_G-8YZAFZDrBOIPtbPvPoxBJmoVNE59dtq1W008v5sLaNL82Y6vC2nPcBNlCBrQhU9Lx1hL7nz37m0BOgNs"
                  alt="Students on campus"
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-3">
                {mobileHighlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4">
                    <p className="text-sm font-bold text-(--text)">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
