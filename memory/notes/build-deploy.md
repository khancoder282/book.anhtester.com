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

## Cập nhật production (2026-11-21)

- Không có Prisma migrations: DB production đồng bộ bằng `bunx prisma db push`. Các bước cho devops viết ở README mục *Cập nhật server production (VPS)* (sao lưu DB + `upload/` → `git pull` → `bun run build` trong `backend/` → `db push` → khởi động lại).
- Trước khi deploy thay đổi schema: dựng DB tạm theo schema của bản đang chạy production, thêm dữ liệu, rồi `prisma migrate diff --from-schema-datasource ... --to-schema-datamodel ... --script` để xem SQL. Chỉ có `ADD COLUMN` nullable / có default và `CREATE TABLE` thì an toàn; có `DROP`, `MODIFY` thu hẹp, thêm `UNIQUE` hay cột bắt buộc không default thì phải viết bước chuyển dữ liệu riêng. Cách dựng DB tạm trên WAMP: `setup-local.md`.
- Lần soát 2026-11-21 (schema `ba42c0e` → `HEAD`): chỉ thêm, không mất dữ liệu. Sửa thêm `OrderItem.picture` thành `TEXT`.
- Server tự xoá ảnh mồ côi trong `upload/$book-image/` lúc khởi động, nên luôn sao lưu `upload/` trước lần chạy đầu của bản mới.

## Production: route có guard `auth` trả 500 (phát hiện 2026-11-22, chưa rõ nguyên nhân)

- `curl https://book.anhtester.com/api/me` (không token / token sai) → **500** `{"msg":"Internal server error."}`; `/api/cart`, `/api/order` cũng vậy. Local cùng code (Elysia 1.4.32, Bun 1.4.5, kể cả `NODE_ENV=production`) trả **401** đúng.
- `GET /api/file` (gọi `verifyAccessToken` trong handler, không qua `onBeforeHandle`) trên production vẫn 401 đúng → lỗi nằm ở đường guard `auth` (`plugins/auth.ts`, `app.onBeforeHandle`) hoặc môi trường server (phiên bản Bun / `node_modules` trên VPS).
- Swagger production khớp 25/25 endpoint với `docs/api/openapi.json` → server đang chạy đúng code mới nhất.
- Hệ quả: đăng nhập báo thành công nhưng `/me` lỗi → web ở trạng thái khách. Cần log server (`console.error` trong `onError` của `src/index.ts` in `code` + message) để biết lỗi gốc.

## CORS: nginx và backend cùng thêm header (sửa 2026-11-23)

- nginx trên VPS (không nằm trong repo) có cấu hình CORS riêng cho origin `https://localhost` (app Android Capacitor): trả lời preflight `OPTIONS` 204 và thêm `Allow-Origin: https://localhost` + `Allow-Credentials: true`. Backend (`corsHeaders`, 2026-11-20) lại thêm `*` ⇒ 2 dòng `Allow-Origin` ⇒ WebView chặn, app release toàn số 0.
- Sửa: `PROXY_CORS_ORIGINS` trong `src/index.ts` (env, mặc định `https://localhost`): backend bỏ header CORS cho các origin này. Bỏ CORS trong nginx thì đặt `PROXY_CORS_ORIGINS=""`. Chi tiết: `plans/mobile-sync.md` mục 2026-11-23-01.
- **2026-11-25, app iOS**: origin `capacitor://localhost` không nằm trong cấu hình nginx, backend trả `*` ⇒ request `withCredentials` (đăng nhập) bị WKWebView chặn. Sửa: `APP_CORS_ORIGINS` (env, mặc định `capacitor://localhost`): backend trả đúng origin + `Allow-Credentials: true`. Kiểm production: `curl -s -D - -o /dev/null -H "Origin: capacitor://localhost" https://book.anhtester.com/api/book?limit=1 | grep -i -E "allow-(origin|credentials)"` phải ra `capacitor://localhost` + `true`, đúng 1 dòng `Allow-Origin`.
- Còn lại (chưa sửa, 2026-11-25): nginx cũng thêm CORS cho `http://localhost:3039` trong khi backend thêm `*` ⇒ 2 dòng `Allow-Origin`, trình duyệt ở `localhost:3039` gọi production bị chặn. Không thêm vào `PROXY_CORS_ORIGINS` mặc định được vì ở local (không nginx) Swagger `localhost:3039` gọi `localhost:4566` cần header của backend; muốn sửa thì đặt `PROXY_CORS_ORIGINS="https://localhost,http://localhost:3039"` trong `.env` **trên VPS**.
- Kiểm production: `curl -s -D - -o /dev/null -H "Origin: https://localhost" https://book.anhtester.com/api/book?limit=1 | grep -i allow-origin` phải ra 1 dòng. Trình duyệt ở origin khác (VD `localhost:3040`) gọi production vẫn được **dù lỗi còn**, nên đừng dùng trình duyệt để kết luận app mobile ổn.
