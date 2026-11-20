import { useCallback } from 'react';

import { useTranslate } from 'src/locales';
import { useCart, CART_MAX_ITEMS } from 'src/store/cart';

import { toast } from 'src/components/toast';

type CartBook = { id?: string; slug: string; name: string; picture?: string | null };

/** Thêm sách vào giỏ (khách: trình duyệt, đã đăng nhập: thêm cả vào /api/cart) kèm thông báo. Trả về true khi thêm được. */
export function useAddToCart() {
  const { t } = useTranslate();
  const add = useCart((s) => s.add);

  return useCallback(
    (book: CartBook, quantity = 1) => {
      const ok = add(
        {
          bookId: book.id || book.slug,
          slug: book.slug,
          name: book.name,
          picture: book.picture ?? null,
        },
        quantity
      );
      if (ok) toast.success(t('bookstore.card.added', { name: book.name }));
      else toast.warning(t('bookstore.card.cartFull', { max: CART_MAX_ITEMS }));
      return ok;
    },
    [add, t]
  );
}
