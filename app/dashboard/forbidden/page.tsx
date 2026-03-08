"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/auth/session";

export default function ForbiddenPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let handle: number | null = null;

    void logoutUser()
      .catch(() => undefined)
      .finally(() => {
        if (!active) {
          return;
        }

        handle = window.setTimeout(() => {
          router.replace("/login");
          router.refresh();
        }, 150);
      });

    return () => {
      active = false;
      if (handle !== null) {
        window.clearTimeout(handle);
      }
    };
  }, [router]);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
      <div className="w-full rounded-2xl border border-(--line) bg-(--surface) p-8 text-center">
        <h1 className="text-2xl font-semibold">You are not authorized!</h1>
        <p className="mt-2 text-sm text-(--text-dim)">
          You have been signed out for security. Redirecting to login...
        </p>

        <Link
          href="/login"
          className="focus-ring mt-6 inline-flex rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-ink)"
        >
          Go to Login
        </Link>
      </div>
    </section>
  );
}
