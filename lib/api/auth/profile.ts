import type {
  CurrentUserProfile,
  CurrentUserProfileResponse,
  CurrentUserProfileUpdate,
} from "@/lib/type/auth/profile";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function updateCurrentUserProfile(
  profile: CurrentUserProfileUpdate,
  file?: File | null,
): Promise<CurrentUserProfile> {
  ensureApiBaseUrl();

  const authHeaderValues = authHeadersFromCookie();
  let headers: HeadersInit = authHeaderValues;
  let body: BodyInit;

  if (file) {
    const formData = new FormData();
    formData.append("data", JSON.stringify({ profile }));
    formData.append("file", file);
    body = formData;
  } else {
    headers = {
      "Content-Type": "application/json",
      ...authHeaderValues,
    };
    body = JSON.stringify({ profile });
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers,
    body,
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

export async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
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
