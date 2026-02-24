"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToastItem } from "@/lib/toast";

export function useToastManager(autoDismissMs = 4200) {
  const timeoutRef = useRef<Record<string, number>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutRef.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutRef.current[id];
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastItem["type"], title: string, description?: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, title, description }]);

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, autoDismissMs);

      timeoutRef.current[id] = timeoutId;
    },
    [autoDismissMs, dismissToast],
  );

  const toast = useMemo(
    () => ({
      show: addToast,
      success: (title: string, description?: string) =>
        addToast("success", title, description),
      error: (title: string, description?: string) =>
        addToast("error", title, description),
      info: (title: string, description?: string) =>
        addToast("info", title, description),
    }),
    [addToast],
  );

  useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach((id) => window.clearTimeout(id));
      timeoutRef.current = {};
    };
  }, []);

  return {
    toasts,
    addToast,
    dismissToast,
    toast,
  };
}
