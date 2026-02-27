export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
};
