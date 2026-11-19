# [BUG] PROMOTION — Khuyến mãi không được kiểm tra giá trị, làm giá bán của sách bị âm hoặc tăng lên

## Thông tin chung
- **ID:** BUG_promotion_1795111390_EXP01
- **Severity:** 🔴 Critical
- **Priority:** P1
- **Nền tảng:** `api`. Cũng tái hiện trên: web: trang Book Management hiển thị "Sach KM Fixed" giá **-900.000 ₫**.
- **Môi trường:** Local | `http://localhost:4566/api` (Bun 1.4.5 + Elysia, MySQL 8.4.13) | Windows 11 | —
- **Build / Version:** `deploy-vps` @ `5fcd241` (code backend từ `64d41c0`, frontend build từ cùng commit)
- **Test case liên quan:** — (exploratory testing `EXP01`, chưa có bộ TC)
- **REQ ID liên quan:** — (chưa có tài liệu requirements)
- **Test data đã dùng:** `admin@example.com`; KM `PCT150` (150%), `PCTNEG` (-20%), `FIX1M` (FIXED 1.000.000), `BADDATE`, code rỗng
- **Ngày phát hiện:** 20-11-2026

## Steps to Reproduce
1. `POST /api/promotion-book` lần lượt với: `type PERCENTAGE value 150`; `PERCENTAGE value -20`; `FIXED_AMOUNT value 1000000`; `endDate` trước `startDate`; `code: ""`.
2. `POST /api/book` giá 100000 gắn từng KM `PCT150`, `FIX1M`, `PCTNEG`.
3. Xem `currentPrice` qua API và trên trang `/book-management`.

## Expected Result
Từ chối % ngoài khoảng (0, 100], giá trị âm, `endDate < startDate`, `code` rỗng. Giá bán không bao giờ âm (tối thiểu 0) và không cao hơn giá gốc.

## Actual Result
Mọi KM đều tạo được (201). Giá bán: 150% → **-50.000**; FIXED 1 triệu → **-900.000**; -20% → **120.000** (cao hơn giá gốc 100.000). UI hiển thị nguyên các giá âm này.

## Evidence
```
POST % = 150 / % âm / FIXED 1.000.000 / endDate < startDate / code rỗng  -> 201 cả 5
Sach KM 150:   price/currentPrice [100000,-50000]
Sach KM Fixed: price/currentPrice [100000,-900000]
Sach KM Am:    price/currentPrice [100000,120000]
```

- Screenshot: [book_list_gia_am.jpg](../../../executions/book/web/run_1795111046/evidence/book_list_gia_am.jpg) ("Sach KM Fixed" -900.000 ₫, "Sach KM Am" 120.000 ₫ so với 100.000 ₫)

## Ghi chú thêm
- **Tần suất tái hiện:** Luôn luôn
- **Workaround (nếu có):** Không có
- **Nghi ngờ root cause (nếu phân tích được):** Schema KM trong `promotion-controller.ts` không ràng buộc `value`, ngày hay `code`. `handlePrice()` trong `book-controller.ts` cộng dồn mức giảm và trả `price - pricePromotion` mà không chặn ở `[0, price]`.

## Lịch sử retest
<!-- Do /retest-fixed-bugs ghi. Dòng mới thêm LÊN ĐẦU bảng. Bảng rỗng = chưa retest lần nào -->

| Ngày | Build | Kết quả | Retest report | Ghi chú |
|---|---|---|---|---|
| 20-11-2026 | deploy-vps (chưa commit) | ✅ FIXED | — | Validate KM (POST + PATCH, 422 `{msg, fields}`) và chặn giá bán trong `[0, price]`. % 150 / -20 / 0, FIXED -5, endDate < startDate, code `""`/`"   "` → 422; % 100 → 201; FREE_SHIPPING value 999 → lưu 0. Sách 100000 gắn FIXED 1.000.000 → currentPrice 0; 60% + 50% → 0 |
