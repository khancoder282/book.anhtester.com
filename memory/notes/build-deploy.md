# Build và deploy (nhánh `deploy-vps`)

Mô hình: frontend được build thành file tĩnh vào `backend/public/`, rồi backend Elysia phục vụ cả API lẫn giao diện trên cùng một cổng.

## Build frontend

```
cd frontend && bun run build
```

- Output ra `../backend/public` (`emptyOutDir: true`, `manifest: true`). `backend/public` nằm trong `backend/.gitignore`.
- **Chưa build thì mở `http://localhost:4566/` sẽ lỗi** `ENOENT ... backend\public\index.html` (do route catch-all `/*`). Gặp 2026-11-20.
- Bản build không tự cập nhật khi sửa code frontend. Khi dev nên dùng cổng 3039; muốn xem ở 4566 thì phải build lại.
- Build chạy kèm `vite-plugin-checker` (TypeScript + ESLint), nên **chỉ một lỗi ESLint cũng làm build fail**. Ngày 2026-11-20 build fail vì `@typescript-eslint/no-shadow` trong `src/components/fields/password-field.tsx` (hàm bên trong `forwardRef` trùng tên `PasswordField`). Đã sửa bằng cách đổi tên hàm bên trong thành `PasswordFieldInner`.
- Có cảnh báo chunk lớn hơn 500 kB (`index-*.js` khoảng 842 kB). Chỉ là cảnh báo, không làm fail.

## Script trong `backend/package.json`

- `build` = `build:client` + `build:server`.
- ⚠️ **`build:client` chạy `rm -rf node_modules` trong `frontend` sau khi build.** Chạy nó trên máy dev sẽ làm hỏng dev server ở 3039, phải `bun install` lại. Khi dev chỉ nên chạy `bun run build` trong `frontend`.
- `build:server` = `bun i && bunx prisma generate`.
- `start` = `bun run src/index.ts` (không có `--watch`).
- `build:client` dùng `rm -rf`, nên trên Windows phải chạy trong Git Bash; PowerShell không có lệnh này.
