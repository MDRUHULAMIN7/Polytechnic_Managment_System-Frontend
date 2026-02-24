"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { AlertCircle, KeyRound, ShieldUser } from "lucide-react";
import { isPrivilegedRole } from "@/lib/auth";
import { persistSession } from "@/lib/session";

type LoginFormValues = {
  id: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      // Call the Next.js API route — it sets httpOnly cookies server-side
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as {
        success: boolean;
        message: string;
        data?: { role: string; userId: string; needsPasswordChange?: boolean };
      };

      if (!response.ok || !json.success) {
        throw new Error(json.message ?? "Login failed. Please retry.");
      }

      const role = json.data?.role;
      const userId = json.data?.userId ?? values.id;

      if (!isPrivilegedRole(role)) {
        throw new Error(
          "Only admin, super admin, instructor, and student can access this dashboard.",
        );
      }

      // Persist only non-sensitive data for client-side UI use
      persistSession({ role, userId });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please retry.";
      setServerError(message);
    }
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card mx-auto w-full max-w-md rounded-2xl p-7 sm:p-8"
      aria-labelledby="login-title"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-(--primary-ink) p-2.5 text-(--primary)">
          <ShieldUser className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 id="login-title" className="text-2xl font-semibold tracking-tight">
            Login
          </h1>
          <p className="text-sm text-(--text-dim)">
            Admin, super admin, instructor, and student access
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="id" className="mb-1.5 block text-sm font-medium">
            User ID
          </label>
          <input
            id="id"
            type="text"
            autoComplete="username"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-4 py-2.5 text-sm outline-none transition"
            placeholder="Enter your user id"
            {...register("id", { required: "User id is required." })}
            aria-invalid={Boolean(errors.id)}
            aria-describedby={errors.id ? "id-error" : undefined}
          />
          {errors.id && (
            <p id="id-error" className="mt-1.5 text-sm text-(--danger)">
              {errors.id.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-4 py-2.5 pr-10 text-sm outline-none transition"
              placeholder="Enter your password"
              {...register("password", { required: "Password is required." })}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-dim)" aria-hidden />
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-sm text-(--danger)">
              {errors.password.message}
            </p>
          )}
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-(--text-dim)">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              className="h-4 w-4 rounded border-(--line) bg-(--surface)"
            />
            Show password
          </label>
        </div>

        {serverError && (
          <div className="rounded-xl border border-(--danger-line) bg-(--danger-soft) px-3 py-2 text-sm text-(--danger)" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" aria-hidden />
              <span>{serverError}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring w-full rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-sm text-(--text-dim)">
        Need public info first?{" "}
        <Link href="/" className="focus-ring rounded text-(--primary) underline underline-offset-2">
          Go to landing page
        </Link>
      </p>
    </motion.section>
  );
}
