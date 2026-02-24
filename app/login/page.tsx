import type { Metadata } from "next";
import { LoginForm } from "@/components/login/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login for admin, super admin, instructor, and student to access RMS dashboard.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="mb-6">
            <ThemeToggle />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-(--primary)">RMS Secure Access</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Centralized login for academic and administrative operation control.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-(--text-dim)">
            This phase enables admin, super admin, instructor, and student
            authentication with role-specific dashboard permissions.
          </p>
        </section>

        <div className="space-y-4">
          <div className="flex justify-end lg:hidden">
            <ThemeToggle />
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
