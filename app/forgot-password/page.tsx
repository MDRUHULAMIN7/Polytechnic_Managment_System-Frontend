import type { Metadata } from "next";
import { AuthPageShell } from "@/components/common/auth-page-shell";
import { ForgotPasswordForm } from "@/components/common/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your PMS account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
