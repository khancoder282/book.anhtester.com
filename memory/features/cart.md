# Giỏ hàng (cart) — backend + đồng bộ web

Làm ngày 2026-11-21. Code: `backend/src/routers/cart-controller.ts`, prefix `/api/cart`, tag Swagger **Cart Management** (khai ở `regis.ts`). Mọi endpoint **cần token**; chỉ thao tác giỏ của chính user.

Trước 2026-11-21 giỏ chỉ nằm ở trình duyệt. Nay: **khách** (chưa đăng nhập) vẫn giữ giỏ ở `localStorage`; **đã đăng nhập** thì giỏ nằm ở server, store của web chỉ là bản sao.

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/cart` | Giỏ + báo giá hiện tại: `{ items, totalQuantity, subtotal, discount, shippingFee, freeShipping, freeShipThreshold, total, canCheckout }`. Giỏ rỗng → `items: []`, tổng 0 |
| POST | `/api/cart/items` | Body `{ bookId, quantity? = 1 }`. Sách mới → **201**, đã có → cộng dồn, **200**. `{ msg: "Added to cart.", cart }` |
| PUT | `/api/cart/items/{bookId}` | Body `{ quantity }` — **đặt** số lượng (không cộng). `{ msg: "Cart updated.", cart }` |
| DELETE | `/api/cart/items/{bookId}` | `{ msg: "Removed from cart.", cart }` |
| DELETE | `/api/cart` | Xoá hết, giỏ rỗng cũng 200. `{ msg: "Cart cleared.", cart }` |
| POST | `/api/cart/merge` | Body `{ items: [{ bookId, quantity }] }` (0 – 50 dòng). Gộp giỏ khách sau khi đăng nhập. `{ msg: "Cart merged.", cart, skipped: [{ bookId, reason }] }` |

- `bookId` (body và path) nhận **id hoặc slug**; response luôn trả id.
- Dòng giỏ (`items[]`) = dòng của `/api/order/quote` (`bookId`, `name`, `slug`, `picture`, `price`, `unitPrice`, `quantity`, `lineTotal`, `available`, `error`) + `addedAt` (thời điểm thêm lần đầu). Sắp theo `addedAt` tăng dần. Giá tính lại mỗi lần đọc bằng `buildQuote` (export từ `order-controller.ts`), cùng quy tắc giá / phí ship với đơn hàng. `totalQuantity` cộng cả dòng hết hàng.

## Quy tắc

- Mỗi sách một dòng (`@@unique([userId, bookId])`), số lượng nguyên 1 – 99, tối đa 50 đầu sách (dùng lại `MAX_ITEM_QUANTITY`, `MAX_ORDER_ITEMS`).
- POST items: sách không có → **404** `Book not found.`; UNAVAILABLE → **422** `fields.bookId`; cộng dồn > 99 → **422** `fields.quantity` (không đổi gì); đủ 50 đầu sách mà thêm sách mới → **422** `fields.bookId`; `quantity` 0 / 1.5 / 100 → 422 (schema).
- PUT / DELETE một dòng: sách không có trong giỏ (kể cả sách không tồn tại, hoặc nằm trong giỏ người khác) → **404** `Book is not in the cart.`. PUT vẫn được khi sách đã thành UNAVAILABLE (để giảm / giữ); muốn bỏ thì DELETE, `quantity: 0` → 422.
- Sách thành UNAVAILABLE sau khi đã vào giỏ: vẫn nằm trong giỏ, `available: false`, không tính vào tổng, `canCheckout = false`.
- Merge: cộng dồn với giỏ server, **vượt 99 thì cắt còn 99** (không báo lỗi); sách không có / UNAVAILABLE / vượt 50 đầu sách → bỏ qua, liệt kê trong `skipped` (reason: `Book not found.`, `Book is unavailable.`, `The cart can hold at most 50 different books.`); dòng trùng trong body cũng cộng dồn. `items: []` = chỉ đọc giỏ; thiếu `items` → 422.
- **Đặt đơn** (`POST /api/order`) bỏ các sách trong đơn khỏi giỏ server trong cùng transaction; sách khác vẫn ở lại. Body đặt đơn không đổi (vẫn gửi `items`).
- Xoá user / sách → dòng giỏ bị xoá theo (Cascade). Seed xoá sách / user nên giỏ cũng mất.
- Thêm cùng lúc một sách mới (2 request) → P2002, `retryOnConflict` chạy lại một lần thành cộng dồn.

## Model

`CartItem { id, userId → User (Cascade), bookId → Book (Cascade), quantity, createdAt, updatedAt }`, unique `[userId, bookId]`, index `[bookId]`. Không lưu giá.

⚠️ Local WAMP: `prisma db push` tạo bảng `CartItem` lỗi `Specified key was too long; max key length is 1000 bytes` (engine mặc định MyISAM, khoá unique 2 cột VARCHAR(191) utf8mb4 = 1528 byte). Đã tạo bằng `prisma migrate diff ... --script`, thêm `ENGINE=InnoDB`, chạy `prisma db execute`, rồi `db push` báo đã đồng bộ (2026-11-21). Production dùng InnoDB mặc định thì `db push` chạy thẳng.

## Web (frontend)

- `src/api/cart.ts` (`CartApi`), `src/store/cart.ts`. Store giữ `items` + `owner` (id user mà `items` là bản sao giỏ server; `null` = giỏ khách), lưu `localStorage` khoá `book-anhtester:cart`.
- Đã đăng nhập (`owner === auth.id`): `add` / `remove` / `clear` sửa bản sao trước rồi gọi API, kết quả server ghi đè bản sao; `setQuantity` gửi PUT sau 400ms (gõ ô số lượng không gửi từng phím). Chỉ kết quả của lần gọi mới nhất (`seq`) được ghi. Lỗi → toast message của server + tải lại giỏ server.
- Đồng bộ theo `useAuth.subscribe`: đăng nhập khi đang có giỏ khách → `POST /cart/merge` rồi dùng giỏ server (sách bị bỏ qua → toast cảnh báo theo tên); mở lại trang khi đã đăng nhập → GET `/cart`; đăng xuất / phiên hết hạn (`checked` + `auth = null`) → xoá bản sao (giỏ vẫn còn trên server, đăng nhập lại thì về).
- ⚠️ Đăng nhập đặt `auth` rồi `checked` liền nhau → đồng bộ bị gọi 2 lần; lần đầu chạy thử đã **gộp giỏ 2 lần** (×3 thành ×5). Chặn bằng cờ `mergingFor`.
- Giá trên trang giỏ / thanh toán vẫn lấy từ `POST /api/order/quote` (`use-quote.ts`) cho cả khách lẫn user.
- Đặt đơn xong: `afterOrder(bookIds)` bỏ các sách vừa đặt khỏi bản sao rồi GET `/cart` (thay cho `clear()` trước đây, để không xoá sách thêm từ tab khác).

## Đã kiểm (2026-11-21)

- Script Bun (không commit) 32/32 đạt: 401 không token, giỏ rỗng, thêm mới 201 / cộng dồn bằng slug 200, > 99 → 422, qty 0 / 1.5 → 422, sách không có 404, thiếu bookId 422, UNAVAILABLE 422, tổng khớp `/order/quote`, PUT theo slug, PUT 100 → 422, PUT sách không có trong giỏ 404, user khác không thấy / không xoá được, DELETE rồi DELETE lại 404, merge (cắt 99, cộng dòng trùng, skipped), merge rỗng / thiếu items, đặt đơn bỏ đúng sách đã mua, clear 2 lần.
- Trình duyệt: đăng xuất → bản sao bị xoá; thêm 2 sách khi là khách; đăng nhập (giỏ server có sẵn 1 cuốn) → gộp đúng ×3 / ×1, huy hiệu 4; tăng số lượng + xoá dòng trên `/cart` → giỏ server khớp bản sao.
- Chưa chạy trọn đặt đơn trên UI sau khi đổi sang `afterOrder` (đã kiểm phía API).
