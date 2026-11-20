import { useMemo, useState, useEffect } from 'react';

import { useDebounce } from 'src/hooks/use-debound';

import { useCart } from 'src/store/cart';

import { OrderApi } from '../api/order';

import type { Quote } from '../api/order';

/**
 * Báo giá cho giỏ hàng hiện tại (POST /api/order/quote). Giá, phí vận chuyển, sách hết hàng đều do
 * server tính — giỏ ở trình duyệt chỉ giữ id + số lượng. Gọi lại (trễ 300ms) mỗi khi giỏ đổi.
 */
export function useQuote() {
  const items = useCart((s) => s.items);
  const key = useMemo(
    () => JSON.stringify(items.map((i) => ({ bookId: i.bookId, quantity: i.quantity }))),
    [items]
  );
  const debouncedKey = useDebounce(key, 300);
  const [quote, setQuote] = useState<Quote>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const body = JSON.parse(debouncedKey) as { bookId: string; quantity: number }[];
    if (body.length === 0) {
      setQuote(undefined);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    OrderApi.quote(body)
      .then((q) => {
        if (!alive) return;
        setQuote(q);
        setError(false);
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [debouncedKey]);

  return { items, quote, loading: loading || key !== debouncedKey, error };
}
