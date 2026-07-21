import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 * Useful for debouncing search inputs so downstream filters/effects
 * only run when the user pauses typing.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
