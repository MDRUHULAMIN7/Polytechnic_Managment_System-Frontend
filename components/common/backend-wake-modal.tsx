"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LoaderCircle, RefreshCw, ServerCog } from "lucide-react";

const LAST_READY_STORAGE_KEY = "pms_backend_last_ready_at";
const RECHECK_AFTER_MS = 12 * 60 * 1000;
const SHOW_MODAL_AFTER_MS = 1600;
const LONG_WAIT_AFTER_MS = 15000;
const REQUEST_TIMEOUT_MS = 45000;

type WakeState = "checking" | "error";

function resolveHealthUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBase) {
    return null;
  }

  return `${apiBase.replace(/\/api\/v\d+\/?$/, "")}/health`;
}

function shouldSkipRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return pathname.startsWith("/dashboard");
}

function shouldSkipEnvironment(healthUrl: string | null) {
  if (process.env.NODE_ENV !== "production" || !healthUrl) {
    return true;
  }

  try {
    const host = new URL(healthUrl).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

function readLastReadyAt() {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(LAST_READY_STORAGE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function markBackendReady() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_READY_STORAGE_KEY, String(Date.now()));
}

export function BackendWakeModal() {
  const pathname = usePathname();
  const healthUrl = useMemo(() => resolveHealthUrl(), []);
  const isSuppressed = shouldSkipRoute(pathname) || shouldSkipEnvironment(healthUrl);
  const dismissedRef = useRef(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLongWait, setIsLongWait] = useState(false);
  const [state, setState] = useState<WakeState>("checking");

  useEffect(() => {
    if (isSuppressed) {
      return;
    }

    if (typeof window === "undefined" || !window.navigator.onLine) {
      return;
    }

    if (Date.now() - readLastReadyAt() < RECHECK_AFTER_MS) {
      return;
    }

    dismissedRef.current = false;

    const controller = new AbortController();
    let active = true;

    const showTimer = window.setTimeout(() => {
      if (!active || dismissedRef.current) {
        return;
      }
      setState("checking");
      setIsLongWait(false);
      setIsOpen(true);
    }, SHOW_MODAL_AFTER_MS);

    const longWaitTimer = window.setTimeout(() => {
      if (!active) {
        return;
      }
      setIsLongWait(true);
    }, LONG_WAIT_AFTER_MS);

    const abortTimer = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    void fetch(`${healthUrl}?source=warmup`, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }

        if (!active) {
          return;
        }

        markBackendReady();
        setState("checking");
        setIsLongWait(false);
        setIsOpen(false);
      })
      .catch(() => {
        if (!active || dismissedRef.current) {
          return;
        }

        setState("error");
        setIsLongWait(true);
        setIsOpen(true);
      })
      .finally(() => {
        window.clearTimeout(showTimer);
        window.clearTimeout(longWaitTimer);
        window.clearTimeout(abortTimer);
      });

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(showTimer);
      window.clearTimeout(longWaitTimer);
      window.clearTimeout(abortTimer);
    };
  }, [healthUrl, isSuppressed, retryNonce]);

  if (isSuppressed || !isOpen) {
    return null;
  }

  const title =
    state === "error" ? "Service startup is taking longer than expected" : "Starting Services";
  const description =
    state === "error"
      ? "Our backend is still waking up on the current hosting plan. Your visit has already triggered the startup process, and a retry should work shortly."
      : "We are waking up our application server for your first request. After short inactive periods, the first load can take a little longer.";

  return (
    <div className="fixed inset-0 z-140 flex items-center justify-center bg-slate-950/42 px-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="backend-wake-title"
        className="w-full max-w-md rounded-[28px] border border-(--line) bg-(--surface) p-6 shadow-[0_32px_90px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--surface-muted) text-(--accent)">
            {state === "error" ? (
              <RefreshCw className="h-5 w-5" strokeWidth={1.9} aria-hidden />
            ) : (
              <ServerCog className="h-5 w-5" strokeWidth={1.9} aria-hidden />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--accent)">
              Temporary Hosting Notice
            </p>
            <h2
              id="backend-wake-title"
              className="mt-2 text-lg font-semibold tracking-tight text-(--text)"
            >
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-(--text-dim)">{description}</p>

            <div className="mt-4 rounded-2xl border border-(--line) bg-(--surface-muted)/60 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-(--text)">
                {state === "error" ? (
                  <RefreshCw className="h-4 w-4 text-(--accent)" strokeWidth={2} aria-hidden />
                ) : (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin text-(--accent)"
                    strokeWidth={2}
                    aria-hidden
                  />
                )}
                <span>
                  {state === "error"
                    ? "The server needs another moment to respond."
                    : "Your request is already waking everything up."}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-(--text-dim)">
                {isLongWait
                  ? "Thanks for your patience. We are improving this deployment experience soon."
                  : "This only affects the first request after inactivity and should resolve automatically."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {state === "error" ? (
            <button
              type="button"
              onClick={() => {
                dismissedRef.current = false;
                setState("checking");
                setIsLongWait(false);
                setIsOpen(false);
                setRetryNonce((value) => value + 1);
              }}
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:brightness-110"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
              Retry now
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              dismissedRef.current = true;
              setIsOpen(false);
            }}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-2xl border border-(--line) px-4 text-sm font-medium text-(--text) transition hover:bg-(--surface-muted)"
          >
            Keep browsing
          </button>
        </div>
      </section>
    </div>
  );
}
