"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ToastItem } from "@/lib/toast";

export type { ToastItem } from "@/lib/toast";

type ToastRegionProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

const styleByType: Record<ToastItem["type"], string> = {
  success: "border-(--success-line) bg-(--success-soft) text-(--success-text)",
  error: "border-(--danger-line) bg-(--danger-soft) text-(--danger)",
  info: "border-(--info-line) bg-(--info-soft) text-(--info-text)"
};

function Icon({ type }: { type: ToastItem["type"] }) {
  if (type === "success") return <CheckCircle2 className="h-4 w-4" aria-hidden />;
  if (type === "error") return <AlertCircle className="h-4 w-4" aria-hidden />;
  return <Info className="h-4 w-4" aria-hidden />;
}

export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-80 flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={`pointer-events-auto rounded-xl border px-3.5 py-3 shadow-[0_8px_28px_var(--shadow-color)] ${styleByType[toast.type]}`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5">
                <Icon type={toast.type} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-0.5 text-xs opacity-90">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="focus-ring rounded px-1 text-xs font-semibold opacity-70 transition hover:opacity-100"
                aria-label="Dismiss toast"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
