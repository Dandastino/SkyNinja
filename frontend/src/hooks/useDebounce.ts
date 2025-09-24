import { useState, useEffect } from 'react';

// Generic debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(newTimer);
  }) as T;

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}

// Search debounce hook
export function useSearchDebounce(searchTerm: string, delay: number = 300): string {
  return useDebounce(searchTerm, delay);
}

// Form debounce hook
export function useFormDebounce<T extends Record<string, any>>(
  formData: T,
  delay: number = 500
): T {
  return useDebounce(formData, delay);
}

// API call debounce hook
export function useApiDebounce<T>(
  apiCall: () => Promise<T>,
  dependencies: any[],
  delay: number = 1000
): T | null {
  const [result, setResult] = useState<T | null>(null);

  const debouncedDependencies = useDebounce(dependencies, delay);

  useEffect(() => {
    if (debouncedDependencies.length > 0 && debouncedDependencies.some(dep => dep !== undefined && dep !== '')) {
      apiCall()
        .then(setResult)
        .catch(console.error);
    }
  }, [debouncedDependencies, apiCall]);

  return result;
}
