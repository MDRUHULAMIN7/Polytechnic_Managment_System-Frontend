"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  IdCard,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { resetPassword } from "@/lib/api/auth/password";
import { showToast } from "@/utils/common/toast";

type ResetPasswordFormProps = {
  id: string;
  token: string;
};

export function ResetPasswordForm({
  id,
  token,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const invalidLink = !id || !token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalidLink) {
      setError("This reset link is missing required parameters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = "New password and confirmation do not match.";
      setError(message);
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      await resetPassword({ id, newPassword, token });
      const description =
        "Password updated successfully. Sign in with your new password.";
      setSuccess(description);
      showToast({
        variant: "success",
        title: "Password reset complete",
        description,
      });
      router.push("/login");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to reset password.";
      setError(message);
      showToast({
        variant: "error",
        title: "Reset failed",
        description: message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="login-card w-full max-w-md rounded-3xl p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
          Secure Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Reset Password
        </h1>
        <p className="mt-2 text-sm leading-6 text-(--text-dim)">
          Set a new password for your account and return to the dashboard with
          fresh credentials.
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
              type="text"
              value={id}
              readOnly
              className="h-11 w-full rounded-xl border border-(--line) bg-(--surface-muted) pl-10 pr-3 text-sm text-(--text-dim)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-dim)"
            />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-transparent pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-dim)"
            />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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

        {success ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending || invalidLink}
          className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-ink) shadow-[0_12px_20px_rgba(37,99,235,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
          {pending ? "Updating password..." : "Update password"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-(--text-dim)">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-(--accent)"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
        <Link href="/forgot-password" className="font-semibold text-(--accent)">
          Request new link
        </Link>
      </div>
    </section>
  );
}
