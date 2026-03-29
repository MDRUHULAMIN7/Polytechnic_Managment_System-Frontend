import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeQuickLinks } from "./public-home-data";

export function PublicHomeQuickLinks() {
  return (
    <section className="border-y border-(--line) bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] py-20" data-animate-section>
      <div className="public-shell">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {homeQuickLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              data-animate-item
              className="home-editorial-panel group rounded-[1.8rem] p-7 transition duration-300 hover:-translate-y-1 hover:border-(--accent)"
            >
              <span className="home-editorial-icon inline-flex h-14 w-14 items-center justify-center rounded-2xl text-(--accent)">
                <item.icon className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-lg font-bold text-(--text)">{item.title}</h2>
              <p className="mt-2 text-sm text-(--text-dim)">{item.subtitle}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-(--accent)">
                Access
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
