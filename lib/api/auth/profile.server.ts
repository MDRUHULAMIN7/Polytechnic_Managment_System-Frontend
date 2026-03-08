import type {
  CurrentUserProfile,
  CurrentUserProfileResponse,
} from "@/lib/type/auth/profile";
import {
  API_BASE_URL,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import { getServerAuthHeaders } from "@/lib/api/dashboard/server-auth";

export async function getCurrentUserProfileServer(): Promise<CurrentUserProfile> {
  ensureApiBaseUrl();
  const serverAuthHeaders = await getServerAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      "Content-Type": "application/json",
      ...serverAuthHeaders,
    },
    cache: "no-store",
  });

  const payload = await parseJsonResponse<CurrentUserProfileResponse>(
    response,
    "Failed to load profile.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load profile.");
  }

  return payload.data;
}
