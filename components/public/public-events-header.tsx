import { SectionKicker } from "./public-home-shared";

export function PublicEventsHeader() {
  return (
    <header className="px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14">
      <div className="public-shell">
        <div className="flex flex-col gap-8 border-l-4 border-(--accent) pl-6 py-4 md:flex-row md:items-end md:justify-between md:pl-8">
          <div className="max-w-3xl space-y-5">
            <SectionKicker>Institutional calendar</SectionKicker>
            <h1 className="font-display text-5xl leading-[1.02] tracking-[-0.05em] text-(--text) sm:text-6xl lg:text-7xl">
              Academic gathering
              <br />
              <span className="text-(--accent)">and digital frontiers.</span>
            </h1>
          </div>

          <div className="space-y-1 md:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-(--text-dim)">Current semester</p>
            <p className="font-display text-2xl italic text-(--accent)">Spring 2026</p>
          </div>
        </div>
      </div>
    </header>
  );
}
