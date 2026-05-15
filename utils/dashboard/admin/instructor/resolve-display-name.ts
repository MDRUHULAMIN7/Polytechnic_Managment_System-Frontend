/** Full instructor name for selects and labels (first · middle · last). */
export function resolveInstructorDisplayName(name?: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): string {
  if (!name) return "";
  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}
