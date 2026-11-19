# [BUG] CATEGORY — Đổi tên category trùng tên hoặc không tồn tại đều chỉ báo "Invalid data."

## Thông tin chung
- **ID:** BUG_category_1795111394_EXP03
- **Severity:** 🟡 Minor
- **Priority:** P3
- **Nền tảng:** `api`
- **Môi trường:** Local | `http://localhost:4566/api` (Bun 1.4.5 + Elysia, MySQL 8.4.13) | Windows 11 | —
- **Build / Version:** `deploy-vps` @ `5fcd241` (code backend từ `64d41c0`, frontend build từ cùng commit)
- **Test case liên quan:** — (exploratory testing `EXP03`, chưa có bộ TC)
- **REQ ID liên quan:** — (chưa có tài liệu requirements)
- **Test data đã dùng:** `admin@example.com`
- **Ngày phát hiện:** 20-11-2026

## Steps to Reproduce
1. `PUT /api/category-book` `{"name":"Novel","newName":"Testing"}` (Testing đã có).
2. `PUT /api/category-book` `{"name":"KhongCo","newName":"Moi"}`.

## Expected Result
Trùng tên: 422 "Category already exists."; không tồn tại: 404 "Category not found." (giống DELETE).

## Actual Result
Cả hai đều trả 400 `{"msg":"Invalid data."}`.

## Evidence
```
PUT đổi tên Novel -> Testing (trùng)  400 {"msg":"Invalid data."}
PUT đổi tên category không tồn tại    400 {"msg":"Invalid data."}
```

## Ghi chú thêm
- **Tần suất tái hiện:** Luôn luôn
- **Workaround (nếu có):** Không có
- **Nghi ngờ root cause (nếu phân tích được):** Nhánh catch của `PUT` trong `category-controller.ts` không phân biệt mã lỗi Prisma P2002 và P2025.

## Lịch sử retest
<!-- Do /retest-fixed-bugs ghi. Dòng mới thêm LÊN ĐẦU bảng. Bảng rỗng = chưa retest lần nào -->

| Ngày | Build | Kết quả | Retest report | Ghi chú |
|---|---|---|---|---|
| 20-11-2026 | deploy-vps (chưa commit) | ✅ FIXED | — | Nhánh catch của `PUT` phân biệt mã Prisma: P2025 → **404** `Category not found.`, P2002 → **409** `Category already exists.` (POST trùng cũng đổi 400 → 409). Retest: `PUT {name:auto_cat_A,newName:auto_cat_B}` (B đã có) → 409; `PUT {name:KhongCo_*,newName:Moi}` → 404; `newName` rỗng hoặc có `/` → 422 |
