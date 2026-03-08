"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, LockKeyhole } from "lucide-react";
import { changePassword } from "@/lib/api/auth/password";
import { logoutUser } from "@/lib/api/auth/session";
import { showToast } from "@/utils/common/toast";

type ChangePasswordCardProps = {
  needsPasswordChange?: boolean;
  variant?: "panel" | "modal";
};

export function ChangePasswordCard({
  needsPasswordChange = false,
  variant = "panel",
}: ChangePasswordCardProps) {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isModal = variant === "modal";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setPending(true);

    try {
      await changePassword({ oldPassword, newPassword });
      await logoutUser();
      showToast({
        variant: "success",
        title: "Password updated",
        description: "Sign in again with your new password.",
      });
      router.push("/login");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to change password.";
      setError(message);
      showToast({
        variant: "error",
        title: "Password update failed",
        description: message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className={
        isModal
          ? "space-y-5"
          : "rounded-3xl border border-(--line) bg-(--surface) p-5 shadow-sm"
      }
    >
      <div className="flex items-start gap-3">
       
        <div>
         
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-(--text-dim)">
            Update your current password. You&apos;ll be signed out after the change
            so the new credential takes effect immediately.
          </p>
        </div>
      </div>

      {needsPasswordChange ? (
        <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Your account is marked for a password update. Complete this before
          continuing regular work.
        </div>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="oldPassword" className="text-sm font-medium">
              Current Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-dim)"
              />
              <input
                id="oldPassword"
                type={showPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                required
                className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-transparent pl-10 pr-3 text-sm"
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
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
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
            Show passwords
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
          className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-ink) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
          {pending ? "Updating password..." : "Update password"}
        </button>
      </form>
    </section>
  );
}
