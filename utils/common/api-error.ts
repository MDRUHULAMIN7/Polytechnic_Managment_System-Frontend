type ApiErrorSource = {
  path?: string | number;
  message?: string;
};

type ApiErrorPayload = {
  message?: string;
  errorSources?: ApiErrorSource[];
};

const sensitiveMessagePatterns = [
  /syntaxerror/i,
  /unexpected token/i,
  /<html/i,
  /<!doctype/i,
  /mongodb/i,
  /mongoose/i,
  /referenceerror/i,
  /stack/i,
  /received:/i,
];

function isSafeMessage(message?: string) {
  if (!message?.trim()) {
    return false;
  }

  return !sensitiveMessagePatterns.some((pattern) => pattern.test(message));
}

function formatFieldLabel(path?: string | number) {
  if (path === undefined || path === null || path === "") {
    return "";
  }

  return String(path)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function getSafeApiErrorMessage<T extends ApiErrorPayload>(
  payload: T,
  fallbackMessage: string,
) {
  const firstError = payload.errorSources?.find((item) => isSafeMessage(item.message));

  if (firstError?.message) {
    const fieldLabel = formatFieldLabel(firstError.path);
    return fieldLabel ? `${fieldLabel}: ${firstError.message}` : firstError.message;
  }

  if (isSafeMessage(payload.message)) {
    return payload.message as string;
  }

  return fallbackMessage;
}

export function getSafeClientErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof Error && isSafeMessage(error.message)) {
    return error.message;
  }

  return fallbackMessage;
}
