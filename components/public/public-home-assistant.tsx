import { ArrowRight, Bot } from "lucide-react";

export function PublicHomeAssistant() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32" data-animate-section>
      <div className="public-shell">
        <div className="home-editorial-panel relative overflow-hidden rounded-[2.5rem] px-8 py-12 lg:px-14 lg:py-16">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)] blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[rgba(16,185,129,0.14)] blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-center">
            <div className="space-y-8" data-animate="heading">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-600">Online assistant</span>
              </div>
              <div className="space-y-4">
                <h2 className="font-display text-4xl leading-tight tracking-[-0.04em] text-(--text) sm:text-5xl">
                  Have a question?
                  <br />
                  Ask the RPI AI assistant.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-(--text-dim)">
                  Visitors can ask about semesters, instructors, notices, registration, or public academic information without jumping across pages.
                </p>
              </div>
              <button
                type="button"
                className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-(--accent) px-7 text-sm font-bold text-(--accent-ink) shadow-[0_18px_38px_rgba(75,125,233,0.24)] transition hover:brightness-110"
              >
                Chat with RPI AI
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-center lg:justify-end" data-animate-item>
              <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-[linear-gradient(180deg,#3b82f6,#2563eb)] p-8 shadow-[0_32px_70px_rgba(75,125,233,0.3)]">
                <Bot className="absolute h-32 w-32 text-white/16" />
                <div className="relative w-full rotate-[10deg] rounded-[1.4rem] border border-white/18 bg-white/10 p-5 backdrop-blur-xl">
                  <div className="mb-3 flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                  </div>
                  <p className="text-xs font-medium leading-6 text-white">&quot;How do I pay my semester fees?&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
