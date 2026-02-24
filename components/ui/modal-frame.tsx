"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ModalFrameProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
};

export function ModalFrame({
  open,
  title,
  description,
  onClose,
  children,
  maxWidthClassName = "max-w-130"
}: ModalFrameProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 h-dvh w-screen bg-black/35 backdrop-blur-[3px]"
            aria-label="Close modal overlay"
          />
          <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
            <motion.section
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`w-full ${maxWidthClassName} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-[0_28px_60px_var(--shadow-color)] sm:max-h-[calc(100dvh-3rem)]`}
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                  <p className="mt-1 text-sm text-(--text-dim)">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring rounded-lg border border-(--line) p-1.5"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              {children}
            </motion.section>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
