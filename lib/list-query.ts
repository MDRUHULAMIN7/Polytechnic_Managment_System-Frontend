import type {
  SearchParamsLike,
  ServerListState,
} from "@/lib/types/query/list-query.types";

export type {
  SearchParamsLike,
  ServerListState,
} from "@/lib/types/query/list-query.types";

export function toPositiveNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export function parseServerListState(
  searchParams: SearchParamsLike,
  defaults: ServerListState,
  allowedSorts: readonly string[],
): ServerListState {
  const rawSort = searchParams.get("sort");
  const sort =
    rawSort && allowedSorts.includes(rawSort) ? rawSort : defaults.sort;

  return {
    searchTerm: searchParams.get("searchTerm") ?? defaults.searchTerm,
    sort,
    page: toPositiveNumber(searchParams.get("page"), defaults.page),
    limit: toPositiveNumber(searchParams.get("limit"), defaults.limit),
  };
}

export function isSameServerListState(
  left: ServerListState,
  right: ServerListState,
) {
  return (
    left.searchTerm === right.searchTerm &&
    left.sort === right.sort &&
    left.page === right.page &&
    left.limit === right.limit
  );
}

export function toRouteQuery(
  state: ServerListState,
  defaults: ServerListState,
) {
  const query = new URLSearchParams();
  const searchTerm = state.searchTerm.trim();

  if (searchTerm) query.set("searchTerm", searchTerm);
  if (state.sort !== defaults.sort) query.set("sort", state.sort);
  if (state.page !== defaults.page) query.set("page", String(state.page));
  if (state.limit !== defaults.limit) query.set("limit", String(state.limit));

  return query;
}

export function toApiQuery(
  state: ServerListState,
  defaults: ServerListState,
  fields: readonly string[],
) {
  const query = toRouteQuery(state, defaults);
  query.set("page", String(state.page));
  query.set("limit", String(state.limit));
  query.set("fields", fields.join(","));
  return query;
}
