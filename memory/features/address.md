# Địa chỉ (tỉnh/phường Việt Nam)

Code: `backend/src/routers/address-controller.ts`. Prefix: `/api/address`. Chỉ có trên nhánh `deploy-vps`.

| Method | Path | Cần token | Ghi chú |
|---|---|---|---|
| GET | `/api/address` | Không | Danh sách tỉnh/thành (`div`, lấy bằng groupBy) |
| GET | `/api/address/{divname}` | Không | Danh sách phường/xã (`wards`) thuộc tỉnh đó |

Model `Address`: `id` (BigInt autoincrement), `wards`, `div`.

## Lưu ý

- **Bảng `Address` ở local đang trống** (2026-11-20), nên `GET /api/address` trả `[]`. Repo không có script hay file SQL để nạp dữ liệu này. Muốn có dữ liệu thì phải lấy dump từ server.
