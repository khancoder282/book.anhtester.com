import { useRef, useCallback } from 'react';

/**
 * Giữ một phần tử (VD thanh phân trang) đứng yên tại chỗ trên màn hình trong lúc nội dung phía trên
 * thay đổi (2026-11-21). Gọi `keep()` ngay trước khi đổi trang: trong `durationMs` tiếp theo, mỗi khung hình
 * (~16ms, không dùng requestAnimationFrame vì tab nền không chạy rAF) nếu phần tử bị đẩy lệch (bảng ngắn / dài đi, dữ liệu mới vẽ lại, trang bị cuộn lên đầu) thì cuộn bù lại.
 * Người dùng tự cuộn (con lăn, chạm, phím) thì dừng neo ngay.
 */
export function useKeepInView<T extends HTMLElement>(durationMs = 1500) {
  const ref = useRef<T>(null);

  const keep = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const until = performance.now() + durationMs;
    let stopped = false;
    const stop = () => {
      stopped = true;
    };
    const events = ['wheel', 'touchstart', 'keydown'] as const;
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));

    const tick = () => {
      if (stopped || !el.isConnected) return;
      const delta = el.getBoundingClientRect().top - top;
      if (Math.abs(delta) > 1) window.scrollBy(0, delta);
      if (performance.now() < until) setTimeout(tick, 16);
      else events.forEach((e) => window.removeEventListener(e, stop));
    };
    setTimeout(tick, 0);
  }, [durationMs]);

  return { ref, keep };
}
