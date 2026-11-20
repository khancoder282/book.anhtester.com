# Đơn hàng (order) — backend

Làm ngày 2026-11-21. Code: `backend/src/routers/order-controller.ts`, prefix `/api/order`, tag Swagger **Order Management** (khai ở `regis.ts`).
Giỏ hàng: khách giữ ở **trình duyệt**, user đã đăng nhập dùng giỏ trên server `/api/cart` (xem [cart.md](cart.md), từ 2026-11-21). Server báo giá và lưu đơn đã đặt.

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| POST | `/api/order/quote` | **Không** | Body `{ items: [{ bookId, quantity }] }`. Trả từng dòng (`available`, `error`) + `subtotal`, `discount`, `shippingFee`, `freeShipping`, `freeShipThreshold`, `total`, `canCheckout` |
| POST | `/api/order` | Có | **201** `{ msg: "Order placed successfully.", order }`. Body: `items`, `recipientName`, `phone`, `province`, `ward`, `street`, `note?`, `paymentMethod?` (`COD` mặc định / `BANK_TRANSFER`) |
| GET | `/api/order` | Có | Chỉ đơn của user hiện tại, mới nhất trước. `page` (1), `limit` (10, tối đa 100), `status?`. Trả `{ list, pagination: { total, totalPage, currentPage, lengthData } }` |
| GET | `/api/order/{id}` | Có | `{id}` nhận **id hoặc code**. Đơn của người khác / không có → 404 `Order not found.` (không lộ đơn tồn tại) |
| PATCH | `/api/order/{id}/cancel` | Có | Chỉ đơn của mình. `PENDING` → `CANCELLED`, 200 `{ msg: "Order cancelled.", order }`. Đã huỷ → **409** `Order is already cancelled.` |

## Model (`schema.prisma`)

- `enum OrderStatus { PENDING CANCELLED }` — `PENDING` = đặt thành công; app chỉ cho huỷ. Chưa có PAID/SHIPPED.
- `enum PaymentMethod { COD BANK_TRANSFER }`.
- `Order`: `code` unique (`BK` + yyMMdd **giờ Việt Nam** + 4 ký tự A-Z0-9, VD `BK261121A7K2`; sinh lại nếu trùng), `userId` → User (**Cascade**), địa chỉ nhận (`recipientName`, `phone`, `province`, `ward`, `street`, `note`), `paymentMethod`, `subtotal`, `discount`, `shippingFee`, `total` (Int, VND). Index `[userId, createdAt]`.
- `OrderItem`: `orderId` → Order (Cascade), `bookId` → Book **SetNull** (xoá sách / chạy lại seed không lỗi, đơn vẫn đọc được), snapshot `name`, `slug`, `picture` (ảnh đầu tiên còn tồn tại), `price` (giá gốc), `unitPrice` (giá bán lúc đặt), `quantity`, `lineTotal`. Dòng sắp theo `id` tăng dần (= thứ tự tạo).

## Quy tắc giá (server tính, không tin giá client)

- Gọi `syncStaleBookPrices` (utils/pricing.ts) cho các sách trong giỏ trước khi đọc; `unitPrice = book.currentPrice`.
- `subtotal = Σ unitPrice×qty`; `discount = Σ (price − unitPrice)×qty` (chỉ để hiển thị, đã nằm trong `unitPrice`).
- `shippingFee = 0` nếu có sách (còn bán) gắn KM **FREE_SHIPPING đang hiệu lực** (`isActive`, `startDate ≤ now ≤ endDate`) hoặc `subtotal ≥ FREE_SHIP_THRESHOLD` (500.000); ngược lại `SHIPPING_FEE` (30.000). Không có dòng hợp lệ nào → phí 0, `freeShipping = false`.
- `total = subtotal + shippingFee`. Hằng số export từ controller: `FREE_SHIP_THRESHOLD`, `SHIPPING_FEE`, `MAX_ORDER_ITEMS` (50), `MAX_ITEM_QUANTITY` (99), `MAX_ORDER_TOTAL` (2 tỷ, cột Int).

## Validate

- `items`: 1 – 50 dòng, `quantity` nguyên 1 – 99 (lỗi schema → 422 `fields.items` hoặc `fields["items/0/quantity"]`). `bookId` nhận id hoặc slug; dòng trùng sách (kể cả một dòng gửi id, một dòng gửi slug) được **gộp**, tổng sau gộp > 99 → 422 `fields.items` (cả `/quote`).
- Quote: sách không có → dòng `available: false`, `error: "Book not found."`, `name`/`slug` rỗng, giá 0, `bookId` = giá trị đã gửi; UNAVAILABLE → `error: "Book is unavailable."`. Dòng không hợp lệ không tính vào tổng. `bookId` trả về luôn là **id** sách (kể cả khi gửi slug).
- Tạo đơn (422 `{ msg: "Invalid data.", fields }`): `recipientName` trim 1 – 191; `phone` bỏ khoảng trắng / `.` / `-`, khớp `^(0|\+84)(3|5|7|8|9)\d{8}$`, lưu dạng `0xxxxxxxxx`; `province` phải có trong bảng Address (`div`), `ward` phải thuộc tỉnh đó (lưu đúng tên trong DB); `street` trim 1 – 255; `note` ≤ 1000, trống → `null`; sách không có / UNAVAILABLE → `fields.items` mỗi sách một câu (`Book "<id>" not found.`, `Book "<tên>" is unavailable.`). Lỗi schema (thiếu trường, quá dài, `paymentMethod` sai) do Elysia trả trước, nên lỗi schema và lỗi nghiệp vụ không gộp chung một lần.
- Tạo đơn + dòng đơn trong **một transaction**; báo giá được tính lại trong transaction đó. Cùng transaction đó bỏ các sách trong đơn khỏi giỏ server (`CartItem`) của user.

## Lưu ý

- Huỷ dùng `updateMany where status = PENDING` nên hai request huỷ cùng lúc chỉ một cái thành công, cái kia 409.
- Seed (`bun run seed`) xoá user → đơn của user bị xoá theo (Cascade); xoá sách → `OrderItem.bookId = null`.
- Chưa có: tồn kho, áp mã KM khi đặt, trạng thái PAID/SHIPPED, màn admin xem đơn của mọi user (roadmap 3.1).
- ⚠️ Local (WAMP) `db push` tạo `Order`, `OrderItem` bằng **MyISAM** (engine mặc định của MySQL WAMP) → không có khoá ngoại, xoá đơn để lại `OrderItem` mồ côi. Đã `ALTER TABLE ... ENGINE=InnoDB` + `db push` lại ngày 2026-11-21. Deploy lên VPS cũng phải kiểm engine (xem [notes/setup-local.md](../notes/setup-local.md)).
- Smoke test 2026-11-21 bằng script Bun (không commit), 42/42 đạt: quote (gộp dòng, sách không có, UNAVAILABLE, ngưỡng 500k, KM FREE_SHIPPING, 422 items rỗng / qty 100 / gộp > 99 / 51 dòng), tạo đơn (201, mã, chuẩn hoá phone `+84`, ghi chú trống → null, BANK_TRANSFER), 422 (phone, ward khác tỉnh, tỉnh không có, items rỗng, sách hết bán + không có, tên / đường trống, paymentMethod sai), list / phân trang / `limit=101` → 422 / lọc status, get theo code và id, huỷ 200 rồi 409, user khác get / cancel → 404, không token → 401.

## UI web (2026-11-21)

- Code: `frontend/src/pages/shop/` (`cart-page`, `checkout-page`, `orders-page`, `order-detail-page`, `api/order.ts`, `hooks/use-quote.ts`, `components/`), giỏ `frontend/src/store/cart.ts`, nút header `layouts/components/cart-button.tsx`. Route: `/cart`, `/checkout`, `/orders`, `/orders/:code`. Chữ ở namespace i18n `shop`.
- Giỏ lưu `localStorage` khoá `book-anhtester:cart` (id + slug + tên + ảnh + số lượng); khi đã đăng nhập đó là bản sao của `/api/cart` (xem [cart.md](cart.md)). Mọi giá hiển thị lấy từ `POST /api/order/quote` (gọi lại trễ 300ms mỗi khi giỏ đổi). Ghép dòng giỏ với dòng báo giá theo `bookId` **hoặc** `slug` (quote luôn trả id thật).
- Checkout 4 bước, chỉ bước địa chỉ cần đăng nhập (nút Đăng nhập dẫn `/sign-in?redirect=/checkout`). Địa chỉ điền sẵn từ hồ sơ: chỉ nhận phần cuối là tỉnh khi bắt đầu bằng "Thành phố/Tỉnh", phần trước đó là phường khi bắt đầu bằng "Phường/Xã/Đặc khu" (hồ sơ admin chỉ có tên tỉnh, trước đây bị điền nhầm vào ô số nhà).
- Đặt xong: `afterOrder` bỏ sách vừa đặt khỏi giỏ rồi tải lại giỏ server, hiện bước Hoàn tất với mã đơn. 422 → gán lỗi vào ô; `fields.items` → quay về bước giỏ + cảnh báo.
- "Mua ngay" ở trang chi tiết sách = thêm vào giỏ rồi mở `/checkout`.
- Đã chạy thử trọn luồng trên trình duyệt 2026-11-21 (đăng nhập admin → mua ngay → địa chỉ Hà Nội → đặt → xem đơn): đúng giá 71.100 + ship 30.000, giỏ được xoá.
