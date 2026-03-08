import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";

type AuthMutationResponse = {
  success?: boolean;
  message?: string;
};

export async function logoutUser(): Promise<void> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const payload = (await response.json()) as AuthMutationResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to logout.");
  }
}
