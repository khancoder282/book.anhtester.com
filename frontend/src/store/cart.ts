import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Giỏ hàng nằm ở trình duyệt (localStorage), không cần đăng nhập. Giá luôn lấy lại từ
// POST /api/order/quote — ở đây chỉ giữ id + số lượng + ảnh/tên để hiện ngay khi chưa có báo giá.

export const CART_STORAGE_KEY = 'book-anhtester:cart';
export const CART_MAX_QTY = 99;
export const CART_MAX_ITEMS = 50;

export type CartItem = {
  bookId: string;
  slug: string;
  name: string;
  picture: string | null;
  quantity: number;
  addedAt: number;
};

type CartState = {
  items: CartItem[];
  /** Thêm sách (đã có thì cộng số lượng). Trả về false khi giỏ đã đủ số đầu sách tối đa. */
  add: (item: Omit<CartItem, 'quantity' | 'addedAt'>, quantity?: number) => boolean;
  setQuantity: (bookId: string, quantity: number) => void;
  remove: (bookId: string) => void;
  clear: () => void;
};

const clampQty = (q: number) => Math.min(Math.max(Math.round(q) || 1, 1), CART_MAX_QTY);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, quantity = 1) => {
        const { items } = get();
        const found = items.find((i) => i.bookId === item.bookId);
        if (found) {
          set({
            items: items.map((i) =>
              i.bookId === item.bookId
                ? { ...i, ...item, quantity: clampQty(i.quantity + quantity) }
                : i
            ),
          });
          return true;
        }
        if (items.length >= CART_MAX_ITEMS) return false;
        set({ items: [...items, { ...item, quantity: clampQty(quantity), addedAt: Date.now() }] });
        return true;
      },
      setQuantity: (bookId, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.bookId === bookId ? { ...i, quantity: clampQty(quantity) } : i
          ),
        })),
      remove: (bookId) => set((s) => ({ items: s.items.filter((i) => i.bookId !== bookId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);

/** Tổng số cuốn trong giỏ (cộng số lượng). */
export const useCartCount = () => useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
