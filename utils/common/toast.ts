import { ToastInput, ToastMessage } from "@/lib/type/toast/toast";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { generateSecureUUID } from "./generateId";

const DEFAULT_DURATION_MS = 2800;
const TOAST_EVENT_NAME = "pms:toast";

function buildToastId(): string {
  return generateSecureUUID();
}

export function showToast(input: ToastInput) {
  if (typeof window === "undefined") {
    return;
  }

  const toast: ToastMessage = {
    id: buildToastId(),
    title: input.title,
    description: input.description,
    variant: input.variant ?? "info",
    durationMs: input.durationMs ?? DEFAULT_DURATION_MS
  };

  window.dispatchEvent(
    new CustomEvent<ToastMessage>(TOAST_EVENT_NAME, { detail: toast })
  );
}

export function subscribeToToast(handler: (toast: ToastMessage) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<ToastMessage>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(TOAST_EVENT_NAME, listener);
  return () => window.removeEventListener(TOAST_EVENT_NAME, listener);
}

export const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    ring: "rgba(16,185,129,0.22)",
    border: "rgba(16,185,129,0.55)",
    iconColor: "#34d399",
    progressColor: "#10b981",
  },
  error: {
    icon: AlertCircle,
    ring: "rgba(239,68,68,0.24)",
    border: "rgba(239,68,68,0.58)",
    iconColor: "#f87171",
    progressColor: "#ef4444",
  },
  info: {
    icon: Info,
    ring: "rgba(14,165,233,0.24)",
    border: "rgba(14,165,233,0.58)",
    iconColor: "#38bdf8",
    progressColor: "#0ea5e9",
  },
} as const;
