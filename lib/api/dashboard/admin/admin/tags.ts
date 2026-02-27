export const ADMINS_TAG = "admins";

export function adminTag(id: string) {
  return `admin:${id}`;
}

export function userTag(id: string) {
  return `user:${id}`;
}
