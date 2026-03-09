"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  BellRing,
  Bot,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const stats = [
  { value: "3", label: "Role-based views" },
  { value: "Live", label: "Notice and alert flow" },
  { value: "1", label: "Connected campus system" },
];

const quickItems = [
  {
    title: "Semester registration opened",
    detail: "Admin updates are reflected across dashboard and notice board.",
    icon: CalendarDays,
    tone: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200",
  },
  {
    title: "Students received notice",
    detail: "Pinned notices stay visible without manual follow-up.",
    icon: BellRing,
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-200",
  },
  {
    title: "Assistant answered publicly",
    detail: "Structured replies come from the same PMS data layer.",
    icon: Bot,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
];

export function LandingHero() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero='copy']", {
        opacity: 0,
        y: 22,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.08,
      });

      gsap.from("[data-hero='panel']", {
        opacity: 0,
        y: 30,
        scale: 0.985,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-18 pt-6 sm:px-6 lg:pb-24"
    >
      <div className="pointer-events-none absolute left-0 top-6 h-44 w-44 rounded-full bg-sky-400/16 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-52 w-52 rounded-full bg-emerald-400/12 blur-3xl" />

      <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="relative max-w-2xl">
          <div
            data-hero="copy"
            className="inline-flex items-center gap-2 rounded-full border border-(--line)/80 bg-(--surface)/86 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-(--text-dim) shadow-[0_10px_26px_rgba(15,23,42,0.08)] backdrop-blur-sm"
          >
            <Sparkles size={13} className="text-(--accent)" />
            Polytechnic management, redesigned
          </div>

          <h1
            data-hero="copy"
            className="mt-5 max-w-[11ch] text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-[4.5rem] lg:leading-[0.98]"
          >
            A cleaner way to run campus operations.
          </h1>

          <p
            data-hero="copy"
            className="mt-5 max-w-xl text-base leading-7 text-(--text-dim) sm:text-lg"
          >
            PMS keeps notices, semester operations, class management, and public
            assistance in one focused workflow so admins, instructors, and students
            always see the right thing at the right time.
          </p>

          <div
            data-hero="copy"
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href="/login"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--accent) px-6 text-sm font-semibold text-(--accent-ink) shadow-[0_20px_42px_rgba(37,99,235,0.28)] transition hover:brightness-110"
            >
              Enter dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/notices"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-(--line)/80 bg-(--surface)/88 px-6 text-sm font-semibold text-(--text) backdrop-blur-sm transition hover:bg-(--surface-muted)"
            >
              Open notice board
            </Link>
          </div>

          <div
            data-hero="copy"
            className="mt-8 grid gap-3 sm:grid-cols-3"
          >
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-(--line)/80 bg-(--surface)/84 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-sm"
              >
                <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                <p className="mt-2 text-sm text-(--text-dim)">{item.label}</p>
              </div>
            ))}
          </div>

          <div
            data-hero="copy"
            className="mt-7 flex flex-col gap-3 rounded-[1.7rem] border border-(--line)/80 bg-[linear-gradient(135deg,rgba(75,125,233,0.08),rgba(255,255,255,0.46))] px-4 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Calm interface, role-aware output
              </p>
              <p className="mt-1 text-sm leading-6 text-(--text-dim)">
                Less clutter in the UI, clearer actions in every workflow.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-(--surface)/92 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              <ShieldCheck size={14} className="text-emerald-500" />
              production-ready flow
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
          <div className="pointer-events-none absolute inset-x-6 top-10 h-52 rounded-full bg-sky-400/18 blur-3xl" />

          <div
            data-hero="panel"
            className="relative overflow-hidden rounded-[2.2rem] border border-(--line)/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.96))] p-5 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.98))] sm:p-6"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(75,125,233,0.2),transparent_72%)]" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-dim)">
                    PMS Command View
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-[2rem]">
                    Focused, not crowded.
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-emerald-200/70 bg-emerald-50/85 px-4 py-3 text-sm shadow-[0_12px_28px_rgba(16,185,129,0.14)] dark:border-emerald-900/60 dark:bg-emerald-950/24">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-200">
                    System synchronized
                  </p>
                  <p className="mt-1 text-emerald-700/80 dark:text-emerald-200/80">
                    Dashboard, notices, and assistant stay aligned.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.7rem] border border-(--line)/80 bg-(--bg)/72 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 border-b border-(--line)/80 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                      Today overview
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      Polytechnic management system
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-(--surface) px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                    Live status
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {quickItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-[1.35rem] border border-(--line)/80 bg-(--surface)/88 px-3.5 py-3.5"
                      >
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}
                        >
                          <Icon size={17} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tracking-tight">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-(--text-dim)">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:absolute lg:-bottom-7 lg:left-4 lg:right-4">
            <div
              data-hero="panel"
              className="rounded-[1.6rem] border border-(--line)/80 bg-(--surface)/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.14)] backdrop-blur-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
                Notice delivery
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                Publish once, visible everywhere.
              </p>
              <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-(--text-dim)">
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />
                Navbar access, notice board, and role-aware visibility remain consistent.
              </div>
            </div>

            <div
              data-hero="panel"
              className="rounded-[1.6rem] border border-(--line)/80 bg-[linear-gradient(135deg,rgba(75,125,233,0.12),rgba(255,255,255,0.92))] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:bg-[linear-gradient(135deg,rgba(75,125,233,0.16),rgba(15,23,42,0.98))]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
                Assistant layer
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                Helpful answers, less UI noise.
              </p>
              <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-(--text-dim)">
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-(--accent)" />
                Public questions can be answered from structured PMS data instead of guesswork.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
