import type {
  ClassSessionListPayload,
} from "@/lib/type/dashboard/class-session";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";

export type ClassSessionListState = {
  semesterRegistration: string;
  subject: string;
  status: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
};

type SearchParamBag =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

export function readClassSessionListState(
  searchParams: SearchParamBag,
): ClassSessionListState {
  return {
    semesterRegistration: readParam(searchParams, "semesterRegistration"),
    subject: readParam(searchParams, "subject"),
    status: readParam(searchParams, "status"),
    startDate: readParam(searchParams, "startDate"),
    endDate: readParam(searchParams, "endDate"),
    page: parseNumberParam(readParam(searchParams, "page"), 1),
    limit: parseNumberParam(readParam(searchParams, "limit"), 10),
  };
}

export function buildClassSessionReturnQuery(
  state: Partial<ClassSessionListState>,
) {
  const query = new URLSearchParams();

  if (state.semesterRegistration) {
    query.set("semesterRegistration", state.semesterRegistration);
  }
  if (state.subject) {
    query.set("subject", state.subject);
  }
  if (state.status) {
    query.set("status", state.status);
  }
  if (state.startDate) {
    query.set("startDate", state.startDate);
  }
  if (state.endDate) {
    query.set("endDate", state.endDate);
  }
  if ((state.page ?? 1) > 1) {
    query.set("page", String(state.page));
  }
  if (state.limit && state.limit !== 10) {
    query.set("limit", String(state.limit));
  }

  return query.toString();
}

export function buildClassSessionBackHref(
  basePath: string,
  searchParams: SearchParamBag,
) {
  const query = buildClassSessionReturnQuery(readClassSessionListState(searchParams));
  return query ? `${basePath}?${query}` : basePath;
}

export function createEmptyClassSessionListPayload(
  limit: number,
): ClassSessionListPayload {
  return {
    meta: {
      page: 1,
      limit,
      total: 0,
      totalPage: 1,
    },
    result: [],
  };
}
