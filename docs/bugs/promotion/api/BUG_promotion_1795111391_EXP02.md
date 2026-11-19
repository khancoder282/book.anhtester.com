# [BUG] PROMOTION — Tắt khuyến mãi (isActive=false) không tính lại giá bán của các sách đang gắn

## Thông tin chung
- **ID:** BUG_promotion_1795111391_EXP02
- **Severity:** 🟠 Major
- **Priority:** P2
- **Nền tảng:** `api`
- **Môi trường:** Local | `http://localhost:4566/api` (Bun 1.4.5 + Elysia, MySQL 8.4.13) | Windows 11 | —
- **Build / Version:** `deploy-vps` @ `5fcd241` (code backend từ `64d41c0`, frontend build từ cùng commit)
- **Test case liên quan:** — (exploratory testing `EXP02`, chưa có bộ TC)
- **REQ ID liên quan:** — (chưa có tài liệu requirements)
- **Test data đã dùng:** `admin@example.com`; KM `FIX1M`, sách `Sach KM Fixed`
- **Ngày phát hiện:** 20-11-2026

## Steps to Reproduce
1. Sách `Sach KM Fixed` gắn KM `FIX1M`, có `currentPrice = -900000`.
2. `PATCH /api/promotion-book/{id FIX1M}` với `isActive: false` → 200.
3. Xem `currentPrice` của sách.
4. Đối chứng: `DELETE /api/promotion-book/{id PCT150}`, rồi xem `Sach KM 150`.

## Expected Result
KM bị tắt thì giá bán của sách được tính lại, giống như khi xoá KM.

## Actual Result
Sau khi tắt KM, giá vẫn là **-900000**. Xoá KM thì giá được tính lại đúng (100000), nên hai thao tác xử lý không nhất quán.

## Evidence
```
Tắt KM FIX1M (isActive=false)        200 {"msg":"Updated promotion successfully."}
  sau khi tắt KM -> currentPrice     -900000
DELETE KM đang gắn sách              200 {"msg":"Deleted promotion successfully."}
  sách sau khi xoá KM -> currentPrice 100000
```

## Ghi chú thêm
- **Tần suất tái hiện:** Luôn luôn
- **Workaround (nếu có):** Không có
- **Nghi ngờ root cause (nếu phân tích được):** `promotion-controller.ts` PATCH không tính lại `currentPrice` cho các sách liên quan, trong khi DELETE có làm.

## Lịch sử retest
<!-- Do /retest-fixed-bugs ghi. Dòng mới thêm LÊN ĐẦU bảng. Bảng rỗng = chưa retest lần nào -->

| Ngày | Build | Kết quả | Retest report | Ghi chú |
|---|---|---|---|---|
