export type SearchParamBag =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

export type MaybePromise<T> = T | Promise<T>;

export type PageProps = {
  searchParams?: MaybePromise<SearchParamBag>;
};