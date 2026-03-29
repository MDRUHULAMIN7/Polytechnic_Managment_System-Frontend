import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeNotices } from "./public-home-data";
import { SectionKicker } from "./public-home-shared";

export function PublicHomeNotices() {
  return (
    <section className="bg-[color:color-mix(in_srgb,var(--surface-muted)_72%,transparent)] px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="public-shell">
        <div className="flex flex-wrap items-end justify-between gap-6" data-animate="heading">
          <div className="space-y-3">
            <SectionKicker>Bulletin board</SectionKicker>
            <h2 className="font-display text-4xl tracking-[-0.04em] text-(--text) sm:text-5xl">Public notices</h2>
          </div>
          <Link href="/notices" className="inline-flex items-center gap-2 text-sm font-bold text-(--accent)">
            View archive
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {homeNotices.map((notice) => (
            <article
              key={notice.title}
              data-animate-item
              className="home-editorial-panel group rounded-[1.8rem] p-8 transition duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-(--accent)">{notice.date}</p>
                <span className="home-editorial-badge rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
                  {notice.accent}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold leading-tight text-(--text) transition group-hover:text-(--accent)">{notice.title}</h3>
              <p className="mt-4 leading-7 text-(--text-dim)">{notice.description}</p>
              <Link href="/notices" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-(--accent)">
                Read more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
