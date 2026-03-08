import type { Metadata } from "next";
import { AuthPageShell } from "@/components/common/auth-page-shell";
import { LoginForm } from "@/components/common/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to access  Dashboard"
};

export default function LoginPage() {
  return (
    <AuthPageShell>
        <LoginForm />
    </AuthPageShell>
  );
}
