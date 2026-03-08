type AuthMutationResponse = {
  success?: boolean;
  message?: string;
};

export async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  const payload = (await response.json()) as AuthMutationResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to logout.");
  }
}
