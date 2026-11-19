# CLAUDE.md

> **Bộ nhớ làm việc ở [`memory/`](memory/README.md).** Đọc `memory/README.md` trước khi làm. Chi tiết từng tính năng ở `memory/features/`, những điều cần lưu ý (setup, build, bảo mật, browser/MCP, git) ở `memory/notes/`. Khi phát hiện điều gì mới mà không đọc ra được từ code thì cập nhật vào đó.

Ứng dụng Quản lý sách (CRUD sách, user, category, promotion, file, address) dùng để thực hành kiểm thử API/UI. Monorepo gồm 2 phần độc lập:

- `backend/`: Bun + Elysia + Prisma (MySQL). Phục vụ API `/api/*`, Swagger (Scalar) ở `/swagger`, và trên nhánh `deploy-vps` phục vụ luôn frontend đã build từ `backend/public/`.
- `frontend/`: React 19 + Vite 6 + MUI 7 + zustand + react-hook-form, dựa trên template "minimal".

Runtime là **Bun** cho cả hai phần (backend dùng `Bun.env`, `Bun.password`, ...). Không chạy bằng Node.

## Chạy local

Yêu cầu: Bun, MySQL ở `127.0.0.1:3306`. Trên máy dev hiện tại MySQL đến từ WAMP, user `root`, không mật khẩu.

`backend/.env` (đã gitignore, phải tự tạo):

```
PORT="4566"
JWT_SECRET="<chuỗi bí mật>"
DATABASE_URL="mysql://root:@127.0.0.1:3306/book_anhtester"
EXPTOKEN="6d"
FILEDIR="upload"
```

- Biến JWT là `JWT_SECRET`, không phải `SECRET`. Nếu thiếu, code tự lấy giá trị mặc định "secret-key".
- `PORT` phải khớp với target proxy trong `frontend/vite.config.ts`: **4566** trên nhánh `deploy-vps`, 4544 trên `main`.
- `schema.prisma` khai báo `provider = "mysql"`. `DATABASE_URL="file:./dev.db"` trong `.env.example` cũ của `main` là sai.

Lần đầu:

```
cd backend && bun install && bunx prisma generate && bunx prisma db push
cd frontend && bun install
```

Dev (2 terminal):

```
cd backend && bun run dev     # http://localhost:4566, Swagger: /swagger
cd frontend && bun run dev    # http://localhost:3039, proxy /api và /swagger sang backend
```

Prisma client được generate vào `backend/src/prisma/`, không phải `node_modules`. Sau khi sửa `schema.prisma` thì chạy lại `bunx prisma generate && bunx prisma db push`.

## Build / deploy (nhánh `deploy-vps`)

- `cd frontend && bun run build` build ra `../backend/public` (`emptyOutDir`). Backend serve `public/index.html` cho mọi route không khớp. Nếu chưa build thì mở `localhost:4566/` sẽ lỗi ENOENT `public/index.html`.
- `backend`: `bun run build` = `build:client` + `build:server`. **Lưu ý:** `build:client` xoá `frontend/node_modules` sau khi build, nên chạy nó sẽ làm hỏng dev server frontend.
- Chạy production: `cd backend && bun run start`.
- Vite build chạy kèm `vite-plugin-checker` (TypeScript + ESLint). Có lỗi ESLint là build fail, kể cả lỗi kiểu `no-shadow`.

## Cấu trúc backend

- `src/index.ts`: khởi tạo Elysia, log request `/api`, xử lý lỗi VALIDATION (trả `{ msg, fields }`), mount các controller trong group `/api`, route `/view-file/*`, `/assets/*`, catch-all `/*` trả `public/index.html`.
- `src/regis.ts`: cấu hình OpenAPI/Swagger (`path: "/swagger"`), PrismaClient, plugin JWT.
- `src/routers/*-controller.ts`: mỗi file là một nhóm API (auth, user, book, category, promotion, file, address, database).
- `src/plugins/`: `auth.ts` (guard), `jwt-app.ts`, `black-list-token.ts`, `filterTable.ts` (phân trang, sort, search), `logging-file.ts`, `middle-prisma.ts`.
- Auth: `POST /api/register`, `POST /api/login` (trả access token, refresh token lưu hash trong `UserRefreshToken`), `POST /api/refetch-token`, `GET /api/me`.
- Không có phân quyền role: mọi user đều như nhau.

## Cấu trúc frontend

- `src/api/axios.ts`: axios với `baseURL: '/api'`, nên khi dev luôn đi qua proxy của Vite.
- `src/pages/<feature>-mgt/`: từng màn quản lý (book, user, file, promotions, db). Mỗi màn có thư mục `api/` riêng.
- `src/routes/`, `src/layouts/`, `src/theme/`, `src/store/` (zustand).
- Link Swagger trên trang chủ là `/swagger` (tương đối), nên Vite cần proxy `/swagger` khi dev.

## MCP để test (`.mcp.json`)

- `playwright`: Chrome phóng to toàn màn hình, chạy `--isolated` (mỗi lần chạy phải đăng nhập lại), output ghi ra `%LOCALAPPDATA%\playwright-mcp-output\book-anhtester\`. Nên dùng `mcp__playwright__*` thay cho `mcp__playwright-desktop__*`, vì bản desktop hay bị lỗi "Browser is already in use".
- `appium`: `appium-mcp`, dùng `ANDROID_HOME` và `JAVA_HOME` của máy, capability lấy từ `capabilities.json` (emulator `Medium_Phone`, app `com.anhtester.book`). Cần bật emulator trước. ⚠️ App mobile (source ở `../mobile-book.anhtester.com`) **gọi API production** `https://book.anhtester.com`, không gọi backend local.
- Chi tiết: [memory/notes/browser-tooling.md](memory/notes/browser-tooling.md).

## Lưu ý khi test

- Swagger mặc định chọn Server `https://book.anhtester.com` (production). Muốn thử API trên máy thì đổi Server sang `http://localhost:4566`.
- Tài khoản test local: `admin@example.com` / `123456` (tạo qua `POST /api/register`).
