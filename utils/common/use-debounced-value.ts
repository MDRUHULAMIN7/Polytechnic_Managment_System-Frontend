import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = globalThis.setTimeout(() => setDebounced(value), delayMs);
    return () => globalThis.clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
