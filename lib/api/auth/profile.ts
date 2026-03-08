import type {
  CurrentUserProfile,
  CurrentUserProfileResponse,
  CurrentUserProfileUpdate,
} from "@/lib/type/auth/profile";
import {
  API_BASE_URL,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function updateCurrentUserProfile(
  profile: CurrentUserProfileUpdate,
): Promise<CurrentUserProfile> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ profile }),
  });

  const payload = await parseJsonResponse<CurrentUserProfileResponse>(
    response,
    "Failed to update profile.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update profile.");
  }

  return payload.data;
}
