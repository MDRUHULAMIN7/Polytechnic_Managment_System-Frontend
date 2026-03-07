import type { Metadata } from "next";
import { AuthPageShell } from "@/components/common/auth-page-shell";
import { ResetPasswordForm } from "@/components/common/reset-password-form";
import type { PageProps } from "@/lib/type/dashboard/admin/type";
import { readParam } from "@/utils/dashboard/admin/utils";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your PMS account.",
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const id = readParam(resolvedSearchParams, "id");
  const token = readParam(resolvedSearchParams, "token");

  return (
    <AuthPageShell>
      <ResetPasswordForm id={id} token={token} />
    </AuthPageShell>
  );
}
