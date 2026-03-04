import { SearchParamBag } from "@/lib/type/dashboard/admin/type";

export function readParam(searchParams: SearchParamBag, key: string) {
  if (!searchParams) {
    return "";
  }

  if (typeof (searchParams as URLSearchParams).get === "function") {
    return (searchParams as URLSearchParams).get(key) ?? "";
  }

  const value = (searchParams as Record<string, string | string[] | undefined>)[
    key
  ];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function parseNumberParam(value: string, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function resolveName(name?: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}) {
  if (!name) {
    return "--";
  }
  return [name.firstName, name.middleName, name.lastName]
    .filter(Boolean)
    .join(" ");
}

export function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

export function resolveId(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && "_id" in value) {
    return (value as { _id?: string })._id;
  }
  return undefined;
}
