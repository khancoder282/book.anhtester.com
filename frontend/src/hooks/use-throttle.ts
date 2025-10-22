import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook: useThrottle
 * Giới hạn tần suất gọi hàm (chỉ gọi 1 lần trong khoảng delay)
 * @param callback - Hàm cần throttle
 * @param delay - Thời gian chờ (ms)
 * @returns Hàm đã được throttle
 */
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  const throttled = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      // Nếu đã quá delay kể từ lần gọi cuối
      if (now - lastCallRef.current >= delay) {
        callback(...args);
        lastCallRef.current = now;
      } else {
        // Nếu đang trong thời gian chờ → hủy timer cũ và tạo mới
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastCallRef.current = Date.now();
            timeoutRef.current = null;
          },
          delay - (now - lastCallRef.current)
        );
      }
    }) as T,
    [callback, delay]
  );

  // Cleanup khi unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return throttled;
}
