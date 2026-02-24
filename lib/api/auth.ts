import { apiRequest } from "./client";
import type { LoginPayload } from "./types";

export function loginRequest(payload: LoginPayload) {
  return apiRequest<{ accessToken?: string; needsPasswordChange?: boolean }>("/auth/login", {
    method: "POST",
    body: payload
  });
}
