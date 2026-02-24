import type {
  PaginationState,
  SearchParamsLike,
  TableQueryState,
} from "@/lib/types/query/table-query.types";

export type {
  PaginationState,
  SearchParamsLike,
  TableQueryState,
} from "@/lib/types/query/table-query.types";

export type SortDirection = "asc" | "desc";

export function toPositiveNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export function parseNameSort(value: string | null): "name" | "-name" {
  return value === "-name" ? "-name" : "name";
}

export function parseStartsWith(
  value: string | null,
): TableQueryState["startsWith"] {
  if (value === "a-m" || value === "n-z") return value;
  return "all";
}

export function parseTableState(
  searchParams: SearchParamsLike,
  defaults: TableQueryState,
): TableQueryState {
  return {
    searchTerm: searchParams.get("searchTerm") ?? defaults.searchTerm,
    sort: parseNameSort(searchParams.get("sort")),
    startsWith: parseStartsWith(searchParams.get("startsWith")),
    page: toPositiveNumber(searchParams.get("page"), defaults.page),
    limit: toPositiveNumber(searchParams.get("limit"), defaults.limit),
  };
}

export function tableStateToQuery(
  state: TableQueryState,
  defaults: TableQueryState,
) {
  const query = new URLSearchParams();
  const searchTerm = state.searchTerm.trim();
  if (searchTerm) query.set("searchTerm", searchTerm);
  if (state.sort !== defaults.sort) query.set("sort", state.sort);
  if (state.startsWith !== defaults.startsWith)
    query.set("startsWith", state.startsWith);
  if (state.page !== defaults.page) query.set("page", String(state.page));
  if (state.limit !== defaults.limit) query.set("limit", String(state.limit));
  return query;
}

export function isSameTableState(
  left: TableQueryState,
  right: TableQueryState,
) {
  return (
    left.searchTerm === right.searchTerm &&
    left.sort === right.sort &&
    left.startsWith === right.startsWith &&
    left.page === right.page &&
    left.limit === right.limit
  );
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function applySearch<T>(
  rows: T[],
  searchTerm: string,
  resolver: (row: T) => string,
) {
  const normalizedSearch = normalizeText(searchTerm);

  if (!normalizedSearch) {
    return rows;
  }

  return rows.filter((row) =>
    normalizeText(resolver(row)).includes(normalizedSearch),
  );
}

export function applyStartsWithFilter<T>(
  rows: T[],
  startsWith: TableQueryState["startsWith"],
  resolver: (row: T) => string,
) {
  if (startsWith === "all") {
    return rows;
  }

  return rows.filter((row) => {
    const name = normalizeText(resolver(row));
    if (!name) return false;

    const first = name[0];
    if (startsWith === "a-m") {
      return first >= "a" && first <= "m";
    }

    return first >= "n" && first <= "z";
  });
}

export function applySortByName<T>(
  rows: T[],
  direction: SortDirection,
  resolver: (row: T) => string,
) {
  return sortRows(rows, direction, resolver);
}

export function sortRows<T>(
  rows: T[],
  direction: SortDirection,
  resolver: (row: T) => string | number | null | undefined,
) {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  return [...rows].sort((a, b) => {
    const leftValue = resolver(a);
    const rightValue = resolver(b);

    const leftNumber =
      typeof leftValue === "number"
        ? leftValue
        : typeof leftValue === "string"
          ? Number(leftValue)
          : Number.NaN;
    const rightNumber =
      typeof rightValue === "number"
        ? rightValue
        : typeof rightValue === "string"
          ? Number(rightValue)
          : Number.NaN;

    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
      if (leftNumber < rightNumber) return direction === "asc" ? -1 : 1;
      if (leftNumber > rightNumber) return direction === "asc" ? 1 : -1;
      return 0;
    }

    const left = normalizeText(String(leftValue ?? ""));
    const right = normalizeText(String(rightValue ?? ""));
    const compared = collator.compare(left, right);
    if (compared === 0) return 0;

    return direction === "asc" ? compared : -compared;
  });
}

export function getTotalPages(total: number, limit: number) {
  return Math.max(1, Math.ceil(total / limit));
}

export function clampPage(page: number, totalPages: number) {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export function paginateRows<T>(rows: T[], state: PaginationState) {
  const total = rows.length;
  const totalPages = getTotalPages(total, state.limit);
  const page = clampPage(state.page, totalPages);
  const start = (page - 1) * state.limit;
  const end = start + state.limit;

  return {
    items: rows.slice(start, end),
    total,
    page,
    totalPages,
  };
}

export function buildBackendQuery(state: TableQueryState) {
  const query = new URLSearchParams();

  const searchTerm = state.searchTerm.trim();
  if (searchTerm) {
    query.set("searchTerm", searchTerm);
  }

  query.set("page", String(state.page));
  query.set("limit", String(state.limit));
  query.set("sort", state.sort);
  if (state.startsWith !== "all") {
    query.set("startsWith", state.startsWith);
  }

  return query;
}
