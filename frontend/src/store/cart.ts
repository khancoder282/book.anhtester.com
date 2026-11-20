import type { ServerCart } from 'src/api/cart';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { CartApi } from 'src/api/cart';

import { toast } from 'src/components/toast';

import { useAuth } from './auth';

// Giỏ hàng (2026-11-21):
// - Khách chưa đăng nhập: giỏ nằm ở trình duyệt (localStorage), `owner = null`.
// - Đã đăng nhập: giỏ nằm ở server (/api/cart). Store là bản sao để hiện ngay (`owner = id user`);
//   mỗi thay đổi sửa bản sao trước rồi gọi API, kết quả server ghi đè bản sao.
// - Đăng nhập khi đang có giỏ khách → gộp vào giỏ server (POST /api/cart/merge). Đăng xuất → xoá bản sao.
// Giá luôn lấy lại từ server (POST /api/order/quote) — ở đây chỉ giữ id + số lượng + ảnh/tên.

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
  /** id user mà `items` là bản sao giỏ server của họ; `null` = giỏ khách ở trình duyệt. */
  owner: string | null;
  /** Thêm sách (đã có thì cộng số lượng). Trả về false khi giỏ đã đủ số đầu sách tối đa. */
  add: (item: Omit<CartItem, 'quantity' | 'addedAt'>, quantity?: number) => boolean;
  setQuantity: (bookId: string, quantity: number) => void;
  remove: (bookId: string) => void;
  clear: () => void;
  /** Bỏ các sách vừa đặt khỏi bản sao rồi tải lại giỏ server (server đã tự bỏ chúng khỏi giỏ). */
  afterOrder: (bookIds: string[]) => void;
  /** Đọc lại giỏ server (khi đã đăng nhập). */
  reload: () => Promise<void>;
};

const clampQty = (q: number) => Math.min(Math.max(Math.round(q) || 1, 1), CART_MAX_QTY);

const fromServer = (cart: ServerCart): CartItem[] =>
  cart.items.map((l) => ({
    bookId: l.bookId,
    slug: l.slug,
    name: l.name,
    picture: l.picture,
    quantity: l.quantity,
    addedAt: new Date(l.addedAt).getTime(),
  }));

/** Mỗi lần gọi API giỏ tăng số thứ tự; chỉ kết quả của lần gọi mới nhất được ghi vào store. */
let seq = 0;
/** Hẹn giờ gửi số lượng theo từng sách (gõ vào ô số lượng không gửi mỗi phím một request). */
const qtyTimers = new Map<string, ReturnType<typeof setTimeout>>();

function errorMessage(err: any) {
  const data = err?.response?.data;
  const field = data?.fields && Object.values(data.fields as Record<string, string[]>)[0]?.[0];
  return field || data?.msg || err?.message || 'Error';
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => {
      /** Giỏ đang là bản sao giỏ server của user đang đăng nhập. */
      const isServerCart = () => {
        const { owner } = get();
        return !!owner && useAuth.getState().auth?.id === owner;
      };

      const apply = (cart: ServerCart, owner: string) => set({ items: fromServer(cart), owner });

      /** Gọi API giỏ; lỗi thì báo và tải lại giỏ server để bỏ thay đổi tạm. */
      const sync = (request: () => Promise<ServerCart>) => {
        const owner = get().owner!;
        const mine = ++seq;
        request()
          .then((cart) => {
            if (mine === seq && get().owner === owner) apply(cart, owner);
          })
          .catch((err) => {
            toast.error(errorMessage(err));
            get().reload();
          });
      };

      return {
        items: [],
        owner: null,

        add: (item, quantity = 1) => {
          const { items } = get();
          const found = items.find((i) => i.bookId === item.bookId || i.slug === item.slug);
          if (!found && items.length >= CART_MAX_ITEMS) return false;
          const added = found
            ? Math.min(quantity, CART_MAX_QTY - found.quantity)
            : clampQty(quantity);
          if (found) {
            set({
              items: items.map((i) =>
                i === found ? { ...i, ...item, quantity: clampQty(i.quantity + quantity) } : i
              ),
            });
          } else {
            set({ items: [...items, { ...item, quantity: added, addedAt: Date.now() }] });
          }
          if (isServerCart() && added > 0) sync(() => CartApi.add(item.bookId, added));
          return true;
        },

        setQuantity: (bookId, quantity) => {
          const qty = clampQty(quantity);
          set((s) => ({
            items: s.items.map((i) => (i.bookId === bookId ? { ...i, quantity: qty } : i)),
          }));
          if (!isServerCart()) return;
          clearTimeout(qtyTimers.get(bookId));
          qtyTimers.set(
            bookId,
            setTimeout(() => {
              qtyTimers.delete(bookId);
              sync(() => CartApi.setQuantity(bookId, qty));
            }, 400)
          );
        },

        remove: (bookId) => {
          clearTimeout(qtyTimers.get(bookId));
          set((s) => ({ items: s.items.filter((i) => i.bookId !== bookId) }));
          if (isServerCart()) sync(() => CartApi.remove(bookId));
        },

        clear: () => {
          set({ items: [] });
          if (isServerCart()) sync(() => CartApi.clear());
        },

        afterOrder: (bookIds) => {
          set((s) => ({ items: s.items.filter((i) => !bookIds.includes(i.bookId)) }));
          get().reload();
        },

        reload: async () => {
          const userId = useAuth.getState().auth?.id;
          if (!userId) return;
          const mine = ++seq;
          try {
            const cart = await CartApi.get();
            if (mine === seq && useAuth.getState().auth?.id === userId) apply(cart, userId);
          } catch {
            // giữ bản sao hiện tại khi không gọi được server
          }
        },
      };
    },
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, owner: s.owner }),
    }
  )
);

/**
 * Đồng bộ giỏ khi trạng thái đăng nhập đổi:
 * - đăng nhập (hoặc mở lại trang khi đã đăng nhập) → giỏ khách được gộp vào giỏ server, rồi dùng giỏ server;
 * - đăng xuất / phiên hết hạn (đã kiểm tra `/me`) → xoá bản sao giỏ server khỏi trình duyệt.
 */
/** id user đang được gộp giỏ khách. Đăng nhập đặt `auth` rồi `checked` liền nhau → không gộp hai lần. */
let mergingFor: string | null = null;

async function syncWithUser(userId: string | null, checked: boolean) {
  const cart = useCart.getState();
  if (!userId) {
    if (checked && cart.owner) useCart.setState({ items: [], owner: null });
    return;
  }
  if (cart.owner === userId) {
    await cart.reload();
    return;
  }
  const guestItems = cart.owner === null ? cart.items : [];
  if (guestItems.length === 0) {
    useCart.setState({ items: [], owner: userId });
    await cart.reload();
    return;
  }
  if (mergingFor === userId) return;
  mergingFor = userId;
  const mine = ++seq;
  try {
    const res = await CartApi.merge(
      guestItems.map((i) => ({ bookId: i.bookId, quantity: clampQty(i.quantity) }))
    );
    if (mine === seq && useAuth.getState().auth?.id === userId) {
      useCart.setState({ items: fromServer(res.cart), owner: userId });
    }
    // Sách không gộp được (không còn / hết hàng / giỏ đầy): báo theo tên sách, lý do là message của server
    res.skipped.forEach((s) => {
      const name = guestItems.find((i) => i.bookId === s.bookId || i.slug === s.bookId)?.name;
      toast.warning(`${name ?? s.bookId}: ${s.reason}`);
    });
  } catch {
    // Gộp lỗi (mất mạng) thì giữ giỏ khách, lần sau đăng nhập / tải trang sẽ gộp lại
  } finally {
    mergingFor = null;
  }
}

// Trang đăng nhập có thể đã đặt auth trước khi module này được nạp
const initialAuth = useAuth.getState();
if (initialAuth.auth || initialAuth.checked) {
  syncWithUser(initialAuth.auth?.id ?? null, initialAuth.checked);
}

useAuth.subscribe((state, prev) => {
  const id = state.auth?.id ?? null;
  const prevId = prev.auth?.id ?? null;
  if (id !== prevId || (state.checked && !prev.checked)) syncWithUser(id, state.checked);
});

/** Tổng số cuốn trong giỏ (cộng số lượng). */
export const useCartCount = () => useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
