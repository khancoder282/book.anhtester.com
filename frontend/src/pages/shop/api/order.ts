import { axios } from 'src/api/axios';

// API đơn hàng: backend/src/routers/order-controller.ts (2026-11-21)

export type PaymentMethod = 'COD' | 'BANK_TRANSFER';
export type OrderStatus = 'PENDING' | 'CANCELLED';

export type QuoteLine = {
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
};

export type Quote = {
  items: QuoteLine[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  freeShipping: boolean;
  freeShipThreshold: number;
  total: number;
  canCheckout: boolean;
};

export type OrderItem = {
  id: string;
  bookId: string | null;
  name: string;
  slug: string;
  picture: string | null;
  price: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  recipientName: string;
  phone: string;
  province: string;
  ward: string;
  street: string;
  note: string | null;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type PlaceOrderBody = {
  items: { bookId: string; quantity: number }[];
  recipientName: string;
  phone: string;
  province: string;
  ward: string;
  street: string;
  note?: string | null;
  paymentMethod: PaymentMethod;
};

export const OrderApi = {
  quote: (items: { bookId: string; quantity: number }[]) =>
    axios.post('/order/quote', { items }).then((res) => res.data as Quote),
  place: (body: PlaceOrderBody) =>
    axios.post('/order', body).then((res) => res.data as { msg: string; order: Order }),
  list: (params: { page?: number; limit?: number; status?: OrderStatus }) =>
    axios.get('/order', { params }).then(
      (res) =>
        res.data as {
          list: Order[];
          pagination: { total: number; totalPage: number; currentPage: number; lengthData: number };
        }
    ),
  get: (idOrCode: string) => axios.get(`/order/${idOrCode}`).then((res) => res.data as Order),
  cancel: (idOrCode: string) =>
    axios
      .patch(`/order/${idOrCode}/cancel`)
      .then((res) => res.data as { msg: string; order: Order }),
};

export const getAddressProvinces = () => axios.get('/address').then((res) => res.data as string[]);
export const getAddressWards = (province: string) =>
  axios.get(`/address/${encodeURIComponent(province)}`).then((res) => res.data as string[]);
