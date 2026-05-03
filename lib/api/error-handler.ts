/**
 * Standardized error types and handlers for consistent error management
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class TimeoutError extends Error {
  constructor(message = "Request timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Parse error response from API or fetch
 */
export function parseErrorResponse(error: unknown): {
  message: string;
  status: number;
  data?: Record<string, unknown>;
} {
  if (error instanceof APIError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data,
    };
  }

  if (error instanceof Response) {
    return {
      message: `HTTP ${error.status} ${error.statusText}`,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return {
        message: "Request was cancelled",
        status: 0,
      };
    }
    return {
      message: error.message || "An error occurred",
      status: 0,
    };
  }

  return {
    message: "An unknown error occurred",
    status: 0,
  };
}

/**
 * Handle fetch response with proper error checking
 */
export async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let data: Record<string, unknown> | undefined;
    try {
      data = await response.json();
    } catch {
      // JSON parse failed, continue with undefined data
    }

    throw new APIError(
      data?.message as string || response.statusText || "Request failed",
      response.status,
      data as Record<string, unknown>
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse response: ${(error as Error).message}`);
  }
}

/**
 * Retry fetch with exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoffMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      return await handleFetchResponse<T>(response);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors (4xx status codes)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < retries - 1) {
        const waitTime = backoffMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

/**
 * User-friendly error message mapper
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    const firstField = Object.keys(error.errors)[0];
    const firstError = error.errors[firstField]?.[0];
    return firstError || "Validation failed";
  }

  if (error instanceof APIError) {
    if (error.status === 401) return "Please log in again";
    if (error.status === 403) return "You don't have permission to perform this action";
    if (error.status === 404) return "The requested item was not found";
    if (error.status === 409) return "This item already exists";
    if (error.status === 422) return "Invalid data provided";
    if (error.status >= 500) return "Server error. Please try again later";
    return error.message || "Something went wrong";
  }

  if (error instanceof NetworkError) {
    return "Network error. Please check your connection";
  }

  if (error instanceof TimeoutError) {
    return "Request took too long. Please try again";
  }

  if (error instanceof Error) {
    return error.message || "Something went wrong";
  }

  return "An unknown error occurred";
}
