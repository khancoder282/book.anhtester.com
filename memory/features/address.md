# Địa chỉ (tỉnh/phường Việt Nam)

Code: `backend/src/routers/address-controller.ts`. Prefix: `/api/address`. Chỉ có trên nhánh `deploy-vps`.

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/address` | Không | 34 tỉnh/thành (`div`), thứ tự theo mã hành chính: Thành phố Hà Nội → Tỉnh Cà Mau |
| GET | `/api/address/{divname}` | Không | Phường/xã/đặc khu (`wards`) của tỉnh đó, thứ tự theo mã hành chính. Tên tỉnh không có (VD tỉnh cũ `Tỉnh Hà Giang`) → `[]` |

Model `Address`: `id` (BigInt autoincrement), `wards`, `div`. Mỗi phường/xã một dòng. Thứ tự trả về dựa vào `id` tăng dần, nên phải nạp đúng thứ tự trong file dữ liệu.

## Dữ liệu (cập nhật 2026-11-20)

- Theo hệ thống hành chính **2 cấp** hiệu lực từ 2025-07-01 (Nghị quyết 202/2025/QH15 + các nghị quyết UBTVQH sắp xếp cấp xã): **34 tỉnh/thành phố, 3321 đơn vị cấp xã** (687 phường, 2621 xã, 13 đặc khu). Không còn cấp quận/huyện.
- File: `backend/prisma/seed/vn-address.json` (`provinces`: `{ "<tên tỉnh>": ["<tên phường/xã>", ...] }`). Lấy từ `https://provinces.open-api.vn/api/v2/?depth=2` ngày 2026-11-20, đã đối chiếu tổng số với số liệu chính thức.
- Nạp: `bun run seed:address --yes` (chỉ thay bảng Address, script `prisma/seed/address.ts`), hoặc `bun run seed --yes` (dựng lại toàn bộ, dùng chung `addressRows()`).
- Tên lưu đầy đủ kèm loại: `Thành phố Hồ Chí Minh`, `Tỉnh Quảng Ninh`, `Phường Bến Thành`, `Xã ...`, `Đặc khu Phú Quốc`. Không tên nào chứa `, ` nên chuỗi địa chỉ user `"<số nhà>, <phường>, <tỉnh>"` vẫn tách được.
- TP HCM sau sáp nhập gồm cả Bình Dương, Bà Rịa - Vũng Tàu cũ, nên danh sách phường của HCM bắt đầu bằng `Phường Thủ Dầu Một` (mã nhỏ nhất), không phải `Phường Sài Gòn`.
- **Production** (`book.anhtester.com`) chưa chắc đã có dữ liệu này: phải chạy `seed:address --yes --allow-remote` trên VPS và deploy backend (thứ tự trả về).
