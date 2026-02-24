export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info";
};
