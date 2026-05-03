/**
 * Standardized API utilities for consistent error handling and pagination
 */

import { PAGINATION } from "@/lib/constants/routes";
import { APIError, handleFetchResponse, getUserFriendlyMessage } from "./error-handler";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Validates and normalizes pagination parameters
 */
export function normalizePaginationParams(
  params: Partial<PaginationParams>
): Required<PaginationParams> {
  return {
    page: Math.max(
      PAGINATION.DEFAULT_PAGE,
      Math.min(Math.floor(params.page || PAGINATION.DEFAULT_PAGE), 999999)
    ),
    limit: Math.max(
      PAGINATION.MIN_LIMIT,
      Math.min(Math.floor(params.limit || PAGINATION.DEFAULT_LIMIT), PAGINATION.MAX_LIMIT)
    ),
    sort: params.sort?.slice(0, 100) || "", // Prevent excessively long sort strings
    search: params.search?.slice(0, 200) || "", // Prevent excessively long search strings
  };
}

/**
 * Build query string from parameters, safely encoding values
 */
export function buildQueryString(params: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null) {
          searchParams.append(key, String(v));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams;
}

/**
 * Safe API fetch with standardized error handling
 */
export async function apiFetch<T>(
  url: string | URL,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await handleFetchResponse<T>(response);
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error: ${error.message}`, error.data);
    } else if (error instanceof Error && error.name === "AbortError") {
      console.error("API request timeout");
      throw new Error("Request took too long. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build a complete API URL with query parameters
 */
export function buildApiUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, unknown>
): URL {
  const url = new URL(path, baseUrl);

  if (params) {
    const queryString = buildQueryString(params);
    url.search = queryString.toString();
  }

  return url;
}

/**
 * Helper to get user-friendly error messages for toast notifications
 */
export function getErrorToastMessage(error: unknown): string {
  return getUserFriendlyMessage(error);
}

/**
 * Validate API response structure
 */
export function validateApiResponse<T>(
  response: unknown
): response is { success: boolean; data: T; message?: string } {
  if (typeof response !== "object" || response === null) {
    return false;
  }

  const obj = response as Record<string, unknown>;
  return (
    typeof obj.success === "boolean" &&
    (obj.data !== undefined || obj.success === false)
  );
}

/**
 * Extract data from paginated API response
 */
export function extractPaginatedData<T>(
  response: unknown
): PaginatedResponse<T> | null {
  if (!validateApiResponse<T[]>(response)) {
    return null;
  }

  const responseData = response as {
    success: boolean;
    data: T[];
    pagination?: Record<string, unknown>;
  };

  if (!Array.isArray(responseData.data)) {
    return null;
  }

  const pagination = responseData.pagination || {};

  return {
    data: responseData.data,
    pagination: {
      page: (pagination.page as number) || PAGINATION.DEFAULT_PAGE,
      limit: (pagination.limit as number) || PAGINATION.DEFAULT_LIMIT,
      total: (pagination.total as number) || responseData.data.length,
      totalPages: (pagination.totalPages as number) || 1,
    },
  };
}
