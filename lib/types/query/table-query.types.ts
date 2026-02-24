export type PaginationState = {
  page: number;
  limit: number;
};

export type SearchParamsLike = {
  get: (key: string) => string | null;
};

export type TableQueryState = PaginationState & {
  searchTerm: string;
  sort: string;
  startsWith: "all" | "a-m" | "n-z";
};
