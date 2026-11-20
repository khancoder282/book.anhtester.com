import { axios } from './axios';

// API giỏ hàng trên server: backend/src/routers/cart-controller.ts (2026-11-21). Cần đăng nhập.

export type ServerCartLine = {
  bookId: string;
  name: string;
  slug: string;
  picture: string | null;
  price: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  error: string | null;
  addedAt: string;
};

export type ServerCart = {
  items: ServerCartLine[];
  totalQuantity: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  freeShipping: boolean;
  freeShipThreshold: number;
  total: number;
  canCheckout: boolean;
};

type CartRes = { msg: string; cart: ServerCart };

export const CartApi = {
  get: () => axios.get('/cart').then((res) => res.data as ServerCart),
  add: (bookId: string, quantity: number) =>
    axios.post('/cart/items', { bookId, quantity }).then((res) => (res.data as CartRes).cart),
  setQuantity: (bookId: string, quantity: number) =>
    axios
      .put(`/cart/items/${encodeURIComponent(bookId)}`, { quantity })
      .then((res) => (res.data as CartRes).cart),
  remove: (bookId: string) =>
    axios
      .delete(`/cart/items/${encodeURIComponent(bookId)}`)
      .then((res) => (res.data as CartRes).cart),
  clear: () => axios.delete('/cart').then((res) => (res.data as CartRes).cart),
  merge: (items: { bookId: string; quantity: number }[]) =>
    axios
      .post('/cart/merge', { items })
      .then((res) => res.data as CartRes & { skipped: { bookId: string; reason: string }[] }),
};
