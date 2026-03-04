type ParamValue = string | number | null | undefined;
type ParamEntry = [string, ParamValue];

type UpdateListSearchParamsOptions = {
  pathname: string;
  searchParams: { toString: () => string };
  router: { push: (href: string, options?: { scroll?: boolean }) => void };
  startTransition: (callback: () => void) => void;
  entries: ParamEntry[];
  defaults?: {
    page?: number;
    limit?: number;
    sort?: string;
  };
  clearKeys?: string[];
};

function hasKey(entries: ParamEntry[], key: string) {
  return entries.some(([entryKey, value]) => entryKey === key && value !== undefined);
}

export function updateListSearchParams({
  pathname,
  searchParams,
  router,
  startTransition,
  entries,
  defaults,
  clearKeys = [],
}: UpdateListSearchParamsOptions) {
  const params = new URLSearchParams(searchParams.toString());

  for (const key of clearKeys) {
    if (params.has(key)) {
      params.delete(key);
    }
  }

  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }

    if (value === null || value === "") {
      params.delete(key);
      continue;
    }

    params.set(key, String(value));
  }

  const pageDefault = defaults?.page ?? 1;
  const limitDefault = defaults?.limit ?? 10;
  const sortDefault = defaults?.sort;

  if (hasKey(entries, "page")) {
    const rawPage = params.get("page");
    const parsed = rawPage ? Number(rawPage) : NaN;
    if (!rawPage || !Number.isFinite(parsed) || parsed <= pageDefault) {
      params.delete("page");
    }
  }

  if (hasKey(entries, "limit")) {
    const rawLimit = params.get("limit");
    const parsed = rawLimit ? Number(rawLimit) : NaN;
    if (!rawLimit || !Number.isFinite(parsed) || parsed === limitDefault) {
      params.delete("limit");
    }
  }

  if (hasKey(entries, "sort") && sortDefault !== undefined) {
    const rawSort = params.get("sort");
    if (!rawSort || rawSort === sortDefault) {
      params.delete("sort");
    }
  }

  const queryString = params.toString();
  const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
  const currentUrl = `${pathname}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  if (nextUrl !== currentUrl) {
    startTransition(() => {
      router.push(nextUrl, { scroll: false });
    });
  }
}
