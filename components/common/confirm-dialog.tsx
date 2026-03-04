"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open, onCancel]);

  const confirmClasses =
    confirmVariant === "danger"
      ? "bg-red-500 text-white hover:bg-red-500/90"
      : "bg-(--accent) text-(--accent-ink) hover:opacity-90";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 h-[100svh] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed inset-0 z-50 flex h-[100svh] items-center justify-center px-4 py-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <section
              role="dialog"
              aria-modal="true"
              className="w-full max-w-lg rounded-2xl border border-(--line) bg-(--surface) shadow-[0_24px_48px_rgba(15,23,42,0.2)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-(--line) px-6 py-4">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                {description ? (
                  <p className="mt-1 text-sm text-(--text-dim)">{description}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`focus-ring inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClasses}`}
                >
                  {isLoading ? "Deleting..." : confirmLabel}
                </button>
              </div>
            </section>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
