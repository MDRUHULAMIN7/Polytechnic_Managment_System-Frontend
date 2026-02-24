export type ServerListState = {
  searchTerm: string;
  sort: string;
  page: number;
  limit: number;
};

export type SearchParamsLike = {
  get: (key: string) => string | null;
};
