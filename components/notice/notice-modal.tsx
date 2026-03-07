"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function NoticeModal({
  open,
  title,
  description,
  children,
  onClose,
}: Readonly<{
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}>) {
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
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <section
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_48px_rgba(15,23,42,0.16)] dark:border-(--line) dark:bg-(--surface)"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-(--line)">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                  {description ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-(--text-dim)">{description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-transparent dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
            </section>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
