"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ArrowRight, BarChart3, ShieldCheck, Workflow } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 }
};

const problems = [
  "Paper-heavy operations slow down admission, semester planning, and department coordination.",
  "Dispersed records make it hard for admins to track who changed what and when.",
  "Manual communication between roles leads to delays and process-level errors."
];

const goals = [
  {
    icon: Workflow,
    title: "Unified Operations",
    body: "Bring users, semesters, departments, and subject lifecycle into one operational system."
  },
  {
    icon: ShieldCheck,
    title: "Role-Safe Access",
    body: "Use strict role permissions so each decision path stays controlled and auditable."
  },
  {
    icon: BarChart3,
    title: "Execution Clarity",
    body: "Provide dashboards that turn daily academic operations into visible, trackable workflows."
  }
];

export function LandingPage() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !particlesRef.current) return;

    const nodes = particlesRef.current.querySelectorAll<HTMLElement>("[data-pulse]");
    const context = gsap.context(() => {
      gsap.fromTo(
        nodes,
        { y: 0, opacity: 0.35 },
        { y: -16, opacity: 0.8, stagger: 0.18, repeat: -1, yoyo: true, duration: 2.2, ease: "sine.inOut" }
      );
    }, particlesRef);

    return () => context.revert();
  }, [reduceMotion]);

  return (
    <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-10">
      <header className="mb-14 flex items-center justify-between">
        <Link href="/" className="focus-ring rounded-md text-xl font-semibold tracking-tight">
          RMS Platform
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--frost) px-5 py-2.5 text-sm font-medium text-(--text) transition hover:border-(--primary) hover:text-(--primary)"
          >
            Admin Login
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-(--line) bg-(--surface) px-6 py-14 shadow-[0_24px_55px_var(--shadow-color)] sm:px-10 lg:px-14">
        <div ref={particlesRef} className="pointer-events-none absolute inset-0" aria-hidden>
          <div data-pulse className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-(--pulse-a) blur-xl" />
          <div data-pulse className="absolute right-[11%] top-[26%] h-20 w-20 rounded-full bg-(--pulse-b) blur-xl" />
          <div data-pulse className="absolute bottom-[10%] left-[28%] h-16 w-16 rounded-full bg-(--pulse-c) blur-xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12, duration: 0.45, ease: "easeOut" }}
          className="relative z-10 max-w-3xl"
        >
          <motion.p variants={fadeUp} className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-(--primary)">
            Digital Academic Management
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Transforming campus operations from manual paperwork to structured digital execution.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base leading-7 text-(--text-dim) md:text-lg">
            This software centralizes academic and administrative processes so decision-makers can move faster with
            fewer operational errors.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/login"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-(--primary) px-6 py-3 font-medium text-(--primary-ink) transition hover:brightness-110"
            >
              Login to Dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <article className="glass-card rounded-2xl p-7">
          <h2 className="text-2xl font-semibold tracking-tight">Problems Solved Digitally</h2>
          <ul className="mt-5 space-y-4">
            {problems.map((problem) => (
              <li key={problem} className="rounded-xl border border-(--line) bg-(--surface-2) px-4 py-3 text-sm leading-6 text-(--text-dim)">
                {problem}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card rounded-2xl p-7">
          <h2 className="text-2xl font-semibold tracking-tight">Software Goals</h2>
          <div className="mt-5 grid gap-4">
            {goals.map((goal) => (
              <div key={goal.title} className="rounded-xl border border-(--line) bg-(--surface-2) p-4">
                <div className="flex items-start gap-3">
                  <goal.icon className="mt-0.5 h-5 w-5 text-(--primary)" aria-hidden />
                  <div>
                    <h3 className="text-base font-semibold">{goal.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-(--text-dim)">{goal.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
