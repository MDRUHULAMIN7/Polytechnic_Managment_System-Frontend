import {
  API_BASE_URL,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

type AuthMutationResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export type ForgotPasswordInput = {
  id: string;
};

export type ResetPasswordInput = {
  id: string;
  newPassword: string;
  token: string;
};

export type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
};

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<void> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<AuthMutationResponse>(
    response,
    "Failed to request password reset.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.message || "Failed to request password reset.",
    );
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      id: input.id,
      newPassword: input.newPassword,
    }),
  });

  const payload = await parseJsonResponse<AuthMutationResponse>(
    response,
    "Failed to reset password.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to reset password.");
  }
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<void> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<AuthMutationResponse>(
    response,
    "Failed to change password.",
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to change password.");
  }
}
