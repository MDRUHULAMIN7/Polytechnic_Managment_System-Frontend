import { apiRequest } from "./client";
import type { UserStatus } from "./types";

export function changeUserStatus(id: string, payload: { status: UserStatus }) {
  return apiRequest<{ _id: string; status: UserStatus }>(`/users/change-status/${id}`, {
    method: "POST",
    body: payload,
  });
}
