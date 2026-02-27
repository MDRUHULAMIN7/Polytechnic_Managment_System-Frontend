import type { Metadata } from "next";
import { RootNavbar } from "@/components/common/root-navbar";

export const metadata: Metadata = {
  title: "Landing",
  description:
    "Understand which institutional problems PMS solves digitally and the operational goal of the software."
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <RootNavbar />
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <p className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1 text-sm text-[var(--text-dim)]">
          Polytechnic Management System
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Structured academic operations with role-based dashboard workflows.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-dim)] md:text-lg">
          Admin, Instructor, and Student workflows are separated and secured with
          dedicated dashboard areas. After login, users are redirected to their
          role-specific dashboard.
        </p>
      </section>
    </main>
  );
}
