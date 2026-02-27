"use client";

import { useEffect, useRef, useState } from "react";
import {  X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {subscribeToToast, VARIANT_CONFIG } from "@/utils/common/toast";
import { ToastMessage } from "@/lib/type/toast/toast";




function ProgressBar({
  durationMs,
  color,
}: {
  durationMs: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 h-0.5 rounded-full"
      style={{ background: color }}
      initial={{ width: "100%" }}
      animate={{ width: "0%" }}
      transition={{ duration: durationMs / 1000, ease: "linear" }}
    />
  );
}


function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const cfg = VARIANT_CONFIG[toast.variant ?? "info"];
  const Icon = cfg.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.95,
        x: 48,
        transition: { duration: 0.22, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "var(--surface)",
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 0 1px ${cfg.ring}, 0 10px 24px rgba(15,23,42,0.14)`,
      }}
      role="status"
      aria-live="polite"
    >
      
      <div className="relative flex items-start gap-3 px-4 py-3.5">
    
        <div className="relative mt-0.5 shrink-0">
          <motion.div
            animate={hovered ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Icon size={18} style={{ color: cfg.iconColor }} />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: cfg.progressColor }}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: "var(--text)" }}
          >
            {toast.title}
          </p>
          {toast.description && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-0.5 text-xs leading-relaxed"
              style={{ color: "var(--text-dim)" }}
            >
              {toast.description}
            </motion.p>
          )}
        </div>
        <motion.button
          type="button"
          onClick={() => onDismiss(toast.id)}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
          style={{
            color: "var(--text-dim)",
            background: "var(--surface-muted)",
          }}
          aria-label="Dismiss notification"
        >
          <X size={13} />
        </motion.button>
      </div>
      {!hovered && (
        <ProgressBar durationMs={toast.durationMs} color={cfg.progressColor} />
      )}
    </motion.article>
  );
}


export function ToastRegion() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutMapRef = useRef<Map<string, number>>(new Map());

  function dismissToast(toastId: string) {
    const timeoutId = timeoutMapRef.current.get(toastId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(toastId);
    }
    setToasts((current) => current.filter((t) => t.id !== toastId));
  }

  useEffect(() => {
    const timeoutMap = timeoutMapRef.current;

    const unsubscribe = subscribeToToast((toast) => {
      setToasts((current) => [...current, toast].slice(-4));

      const timeoutId = window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.durationMs);

      timeoutMap.set(toast.id, timeoutId);
    });

    return () => {
      unsubscribe();
      timeoutMap.forEach((id) => window.clearTimeout(id));
      timeoutMap.clear();
    };
  }, []);

  return (
    <section className="pointer-events-none fixed right-4 top-4 z-100 flex w-[min(92vw,360px)] flex-col gap-2.5">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </AnimatePresence>
    </section>
  );
}
