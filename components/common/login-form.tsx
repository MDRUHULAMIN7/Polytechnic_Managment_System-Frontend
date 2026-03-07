"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, IdCard, LoaderCircle, LockKeyhole } from "lucide-react";
import { loginUser } from "@/lib/api/auth/login";
import { dashboardPathByRole, parseTokenRole } from "@/utils/auth/login";
import { setCookie } from "@/utils/common/cookie";
import { showToast } from "@/utils/common/toast";

const ROLE_COOKIE = "pms_role";
const ACCESS_TOKEN_COOKIE = "pms_access_token";

export function LoginForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { accessToken, needsPasswordChange } = await loginUser({
        id,
        password,
      });

      const role = parseTokenRole(accessToken);
      if (!role) {
        throw new Error("Could not resolve role from access token.");
      }

      const nextPath = needsPasswordChange
        ? "/dashboard/profile"
        : dashboardPathByRole(role);

      setCookie(ROLE_COOKIE, role, 60 * 60 * 24);
      setCookie(ACCESS_TOKEN_COOKIE, accessToken, 60 * 60);
      showToast({
        variant: "success",
        title: "Login successful",
        description: needsPasswordChange
          ? "Redirecting to your profile so you can update your password."
          : "Redirecting to your dashboard."
      });

      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Login failed.";
      setError(
        message
      );
      showToast({
        variant: "error",
        title: "Login failed",
        description: message
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="login-card w-full max-w-md rounded-3xl p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
          Welcome Back
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm leading-6 text-(--text-dim)">
          Sign in with your user ID and password to continue into the
          Polytechnic Management dashboard.
        </p>
        
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm font-medium">
            User ID
          </label>
          <div className="relative">
            <IdCard
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-dim)"
            />
            <input
              id="id"
              name="id"
              type="text"
              value={id}
              onChange={(event) => setId(event.target.value)}
              placeholder="A-0001"
              required
              className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-transparent pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-(--accent) transition hover:opacity-80"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-dim)"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
              className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-transparent pl-10 pr-3 text-sm"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-(--text-dim)">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              className="h-4 w-4 rounded border-(--line) accent-(--accent)"
            />
            Show password
          </label>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-ink) shadow-[0_12px_20px_rgba(37,99,235,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
          {pending ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-(--text-dim)">
        Need public home?{" "}
        <Link href="/" className="font-semibold text-(--accent)">
          Go Home
        </Link>
      </p>
    </section>
  );
}
