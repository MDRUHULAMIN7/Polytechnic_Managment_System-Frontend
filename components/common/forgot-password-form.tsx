"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, IdCard, LoaderCircle, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/lib/api/auth/password";
import { showToast } from "@/utils/common/toast";

export function ForgotPasswordForm() {
  const [id, setId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      await requestPasswordReset({ id });
      const description =
        "If the account exists, a reset link has been sent to the registered email address.";
      setSuccess(description);
      showToast({
        variant: "success",
        title: "Reset link sent",
        description,
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to send reset link.";
      setError(message);
      showToast({
        variant: "error",
        title: "Request failed",
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
          Account Recovery
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm leading-6 text-(--text-dim)">
          Enter your user ID. We&apos;ll send a password reset link to the email
          address connected to your account.
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

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
            <MailCheck size={16} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-ink) shadow-[0_12px_20px_rgba(37,99,235,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
          {pending ? "Sending link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-(--text-dim)">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-(--accent)"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </p>
    </section>
  );
}
