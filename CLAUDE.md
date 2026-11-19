# CLAUDE.md

> **Bộ nhớ làm việc ở [`memory/`](memory/README.md).** Đọc `memory/README.md` trước khi làm. Chi tiết từng tính năng ở `memory/features/`, những điều cần lưu ý (setup, build, bảo mật, browser/MCP, git) ở `memory/notes/`. Khi phát hiện điều gì mới mà không đọc ra được từ code thì cập nhật vào đó.

Ứng dụng Quản lý sách (CRUD sách, user, category, promotion, file, address) dùng để thực hành kiểm thử API/UI. Monorepo gồm 2 phần độc lập:

- `backend/`: Bun + Elysia + Prisma (MySQL). Phục vụ API `/api/*`, Swagger (Scalar) ở `/swagger`, và trên nhánh `deploy-vps` phục vụ luôn frontend đã build từ `backend/public/`.
- `frontend/`: React 19 + Vite 6 + MUI 7 + zustand + react-hook-form, dựa trên template "minimal".

Runtime là **Bun** cho cả hai phần (backend dùng `Bun.env`, `Bun.password`, ...). Không chạy bằng Node.

## Ghi nhớ quy tắc đã chốt

- Quy tắc nào user đã xác nhận thì ghi **ngay** vào cả hai nơi: `CLAUDE.md` (mục phù hợp) và bộ nhớ (`memory/` trong repo + auto-memory của Claude). Không chỉ làm theo trong phiên rồi để mất.
- **Hướng dẫn cho người dùng repo** (cài đặt, chạy, `.env`, dữ liệu mẫu, tài khoản, build/deploy) ghi vào [`README.md`](README.md). Đổi cách cài/chạy thì cập nhật README cùng lúc. `CLAUDE.md` và `memory/` chỉ giữ ghi chú cho Claude.
- **Mỗi lần chỉnh tính năng / UI / API** (chốt 2026-11-20), làm cùng lúc:
  1. Cập nhật tài liệu API: Swagger (`body`, `response`, `detail` trong controller; tag mới thì khai ở `regis.ts`) và `memory/features/<tính-năng>.md`. **Build Swagger** (chốt 2026-11-20): backend đang chạy thì `cd backend && bun run swagger:export` để xuất lại [`docs/api/openapi.json`](docs/api/openapi.json), kiểm tra diff rồi commit cùng code. Swagger được sinh lúc chạy từ schema trong controller, nên không có bước build nào khác.
  2. Cập nhật kế hoạch ở [`plans/roadmap.md`](plans/roadmap.md) (trạng thái + ngày).
  3. Thêm mục vào [`plans/mobile-sync.md`](plans/mobile-sync.md): API đổi gì, UI đổi gì, locator mới, file tương ứng bên repo `../mobile-book.anhtester.com`, mobile cần làm gì, có cần deploy backend không (app mobile gọi API production).

## Báo cáo tiến độ

- Việc dài (nhiều bước, có agent chạy nền) thì **chủ động báo tiến độ định kỳ** (chốt 2026-11-20), không chờ user hỏi: mỗi khi xong một mốc (một agent / một nhóm việc xong) và trong lúc chờ lâu. Báo dạng bảng ngắn: đã xong / đang làm / còn lại, kèm con số (vd 12/30 bug), và nói rõ phần nào chưa kiểm chứng.

## Quy tắc git

- Làm việc, commit và push trên nhánh **`deploy-vps`** (`git push origin deploy-vps`). Không commit hay push lên `main`.
- Đang ở nhánh khác thì chuyển về `deploy-vps` trước khi commit.

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
cd backend && bun run seed --yes   # dữ liệu mẫu, XOÁ hết trừ admin
cd frontend && bun install
```

Dữ liệu mẫu: `backend/prisma/seed/` (`data.json`, ảnh trong `assets/`, script `seed.ts`). Chi tiết ở [memory/notes/seed-data.md](memory/notes/seed-data.md).

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
- `src/pages/<feature>-mgt/`: từng màn quản lý (book, user, category, file, promotions, db). Mỗi màn có thư mục `api/` riêng.
- `src/routes/`, `src/layouts/`, `src/theme/`, `src/store/` (zustand).
- `src/locales/`: đa ngôn ngữ vi/en (chốt 2026-11-20). **Mọi chữ hiển thị mới phải qua `t()`** của `useTranslate()`, thêm khoá ở `en/<ns>.ts` rồi `vi/<ns>.ts`. Mặc định `en`. Không dịch message từ backend. Chi tiết: [memory/features/i18n.md](memory/features/i18n.md).
- Link Swagger trên trang chủ là `/swagger` (tương đối), nên Vite cần proxy `/swagger` khi dev.

## MCP để test (`.mcp.json`)

- `playwright`: Chrome phóng to toàn màn hình, chạy `--isolated` (mỗi lần chạy phải đăng nhập lại), output ghi ra `%LOCALAPPDATA%\playwright-mcp-output\book-anhtester\`. Nên dùng `mcp__playwright__*` thay cho `mcp__playwright-desktop__*`, vì bản desktop hay bị lỗi "Browser is already in use".
- `appium`: `appium-mcp`, dùng `ANDROID_HOME` và `JAVA_HOME` của máy, capability lấy từ `capabilities.json` (emulator `Medium_Phone`, app `com.anhtester.book`). Cần bật emulator trước. ⚠️ App mobile (source ở `../mobile-book.anhtester.com`) **gọi API production** `https://book.anhtester.com`, không gọi backend local.
- Chi tiết: [memory/notes/browser-tooling.md](memory/notes/browser-tooling.md).

## Lưu ý khi test

- **Bug đã biết:** xem [`docs/bugs/README.md`](docs/bugs/README.md) (30 bug, đợt 2026-11-20) trước khi báo bug mới, để tránh trùng.
- Test có tiếng Việt thì gọi API bằng script Bun, không dùng curl trong Git Bash (bị đổi ký tự có dấu thành `?`). Xem [memory/notes/testing-pitfalls.md](memory/notes/testing-pitfalls.md).

- Server mặc định của Swagger (2026-11-20): chạy `bun run dev` thì là `http://localhost:4566`, chạy `bun run start` (production) thì là `https://book.anhtester.com`; cả hai luôn có trong ô Server. Backend bật CORS cho `/api/*` từ 2026-11-20 (`Allow-Origin: *`, **không** credentials vì refresh token ở cookie), nên Swagger khác origin (VD `localhost:3039/swagger`) gọi được; production cần deploy mới có. Nhóm *File Management* và *Database* ẩn khỏi Swagger (`exclude.tags` trong `regis.ts`), API vẫn chạy. Không dùng URL server tương đối: `/` sinh `//api/...` (404), `""` làm code mẫu mất host.
- Tài khoản test local: `admin@example.com` / `123456`. Sau khi seed có thêm 8 user `*@example.com` cùng mật khẩu `123456` (2 user bị khoá).
