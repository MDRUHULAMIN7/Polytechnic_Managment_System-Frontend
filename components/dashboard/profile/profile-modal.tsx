"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ProfileModalProps = {
  open: boolean;

  children: React.ReactNode;
  onClose: () => void;
};

export function ProfileModal({
  open,
  children,
  onClose,
}: ProfileModalProps) {
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 h-dvh min-h-svh bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex h-dvh min-h-svh items-center justify-center overflow-y-auto px-4 py-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
          >
            <section
              role="dialog"
              aria-modal="true"
              className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-(--surface) shadow-[0_32px_90px_rgba(2,8,23,0.42)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative border-b border-(--line) px-6 py-5 sm:px-7">
             
               
                  <button
                    type="button"
                    onClick={onClose}
                    className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) text-(--text-dim) transition hover:bg-(--surface-muted)"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
             
              </div>
              <div className="max-h-[78svh] overflow-y-auto px-6 py-6 sm:px-7">
                {children}
              </div>
            </section>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
