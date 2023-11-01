import { useEffect, useState } from 'react';

/**
 * Hook to debounce a value
 * @param value value to debounce
 * @param delay debounce delay
 * @returns debounced value
 */
export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return debouncedValue;
};

/**
 * Use effect with debounce on dependencies
 * @param callback useEffect callback
 * @param delay debounce delay
 * @param deps useEffect dependencies
 */
export const useDebounceEffect = (
  callback: () => void,
  delay: number,
  deps: unknown[]
) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || [])]);
};

/**
 * Hook to debounce a memoized value
 * @param callback callback to memoize
 * @param delay debounce delay
 * @param deps dependencies
 * @returns
 */
export const useDebounceMemo = <T>(
  callback: () => T,
  delay: number,
  deps: unknown[]
) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(callback());

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(callback());
    }, delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || [])]);

  return debouncedValue;
};
