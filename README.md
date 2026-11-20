# book.anhtester.com

Ứng dụng Quản lý sách dùng để thực hành kiểm thử API, web và mobile. Có các module:

| Module | Chức năng |
|---|---|
| Auth | Đăng ký, đăng nhập, refresh token, profile, đổi mật khẩu |
| User | Quản lý người dùng, khoá / mở khoá tài khoản |
| Book | Thêm, sửa, xoá, tìm kiếm, lọc sách; ảnh bìa; lượt xem |
| Category | Thể loại sách |
| Promotion | Mã khuyến mãi theo %, theo số tiền, miễn phí vận chuyển |
| File | Upload, duyệt, đổi tên, sao chép, di chuyển, xoá file |
| Address | Danh sách tỉnh/thành và phường/xã |
| Order | Báo giá giỏ hàng, đặt đơn (giao hàng tới tỉnh/phường), xem và huỷ đơn của mình |

Bản chạy thật: <https://book.anhtester.com> · tài liệu API: <https://book.anhtester.com/swagger>

## Công nghệ

- **Backend** (`backend/`): Bun + Elysia + Prisma, MySQL. API ở `/api/*`, Swagger (Scalar) ở `/swagger`.
- **Frontend** (`frontend/`): React 19 + Vite 6 + MUI 7.
- Cả hai chạy bằng **Bun**, không chạy bằng Node.

## Yêu cầu

- [Bun](https://bun.sh) 1.2 trở lên
- MySQL 8 ở `127.0.0.1:3306` (ví dụ MySQL của WAMP/XAMPP, user `root` không mật khẩu)

## Cài đặt và chạy local

### 1. Tạo file `backend/.env`

Copy từ `backend/.env.example` rồi điền `JWT_SECRET`:

```env
PORT="4566"
JWT_SECRET="<chuỗi ngẫu nhiên dài, tự sinh>"
DATABASE_URL="mysql://root:@127.0.0.1:3306/book_anhtester"
EXPTOKEN="6d"
FILEDIR="upload"
```

| Biến | Ý nghĩa |
|---|---|
| `PORT` | Cổng backend. Phải khớp với proxy trong `frontend/vite.config.ts` (đang là `4566`) |
| `JWT_SECRET` | Khoá ký access token. Thiếu thì code dùng mặc định `secret-key`, **không an toàn** |
| `DATABASE_URL` | Chuỗi kết nối MySQL. Database chưa có thì Prisma tự tạo |
| `EXPTOKEN` | Thời hạn access token, ví dụ `15m`, `1d`, `6d` |
| `FILEDIR` | Thư mục lưu file upload, tính từ `backend/` |

Sinh `JWT_SECRET` nhanh:

```bash
bun -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

### 2. Cài thư viện và tạo bảng

```bash
cd backend
bun install
bunx prisma generate
bunx prisma db push

cd ../frontend
bun install
```

Prisma client được sinh vào `backend/src/prisma/`. Mỗi lần sửa `backend/prisma/schema.prisma` thì chạy lại `bunx prisma generate && bunx prisma db push`.

### 3. Nạp dữ liệu mẫu

```bash
cd backend
bun run seed --yes
```

Xem mục [Dữ liệu mẫu](#dữ-liệu-mẫu).

### 4. Chạy dev (2 terminal)

```bash
cd backend && bun run dev      # http://localhost:4566
cd frontend && bun run dev     # http://localhost:3039
```

- Web: <http://localhost:3039>. Vite chuyển tiếp `/api` và `/swagger` sang backend.
- Swagger: <http://localhost:4566/swagger>. Khi chạy `bun run dev`, ô Server mặc định là `http://localhost:4566` (gọi API trên máy); bản production (`bun run start`) mặc định `https://book.anhtester.com`. Nếu bấm Send mà báo "Failed to fetch" thì kiểm tra ô Server có cùng host với trang Swagger đang mở không.
- Xuất Swagger ra file (khi backend đang chạy): `cd backend && bun run swagger:export` ghi [`docs/api/openapi.json`](docs/api/openapi.json). File này được commit cùng code, nên xem diff là biết API đổi gì. Import được vào Postman.
- Vite cần khoảng 10 giây để khởi động lần đầu; mở trình duyệt sớm quá thì tải lại trang.

## Dữ liệu mẫu

Lệnh `bun run seed --yes` (trong `backend/`) dựng lại toàn bộ bộ dữ liệu mẫu.

> ⚠️ Lệnh này **xoá toàn bộ dữ liệu** (user, sách, khuyến mãi, category, địa chỉ, file trong thư mục upload), chỉ giữ tài khoản `admin@example.com`. Chưa có admin thì tạo mới.

- Không có `--yes` thì lệnh không chạy.
- `DATABASE_URL` không trỏ vào localhost thì lệnh từ chối, trừ khi thêm `--allow-remote`. Kiểm tra kỹ trước khi chạy trên server.

### Tài khoản

| Email | Mật khẩu | Ghi chú |
|---|---|---|
| `admin@example.com` | `123456` | Tài khoản chính |
| `an.nguyen@example.com`, `binh.tran@example.com`, `cuong.le@example.com`, `dung.pham@example.com`, `duc.hoang@example.com`, `ha.vu@example.com` | `123456` | Đang hoạt động |
| `huy.dang@example.com`, `huong.bui@example.com` | `123456` | Bị khoá, đăng nhập trả 403. `huong.bui` không có avatar, số điện thoại, địa chỉ |

App không phân quyền theo vai trò: mọi tài khoản đăng nhập đều có cùng quyền.

### Nội dung

| Module | Dữ liệu |
|---|---|
| Category | 9 thể loại; `Ngoại ngữ` không có sách |
| Book | 40 sách (đủ để web có nút "load more"), mỗi sách 4 ảnh (bìa trước, bìa sau, 2 trang đọc thử); đủ tác giả, nhà xuất bản, năm, số trang, ISBN, ngôn ngữ và đoạn đọc thử. 5 sách `UNAVAILABLE`, 5 sách mới tạo trong 7 ngày (nhãn "New"). Có sách không có đọc thử, sách không có nhà xuất bản/ISBN, sách tên rất dài. 20 sách sau là sách hư cấu; đoạn đọc thử của mọi sách là văn bản viết riêng để test, không phải nội dung sách thật |
| Promotion | `SALE10` giảm 10% · `GIAM20K` giảm 20.000đ · `THIEUNHI15` giảm 15% · `FREESHIP` miễn phí vận chuyển · `BLACKFRIDAY30` sắp diễn ra · `TET2026` đã hết hạn · `SUMMER25` đang tắt |
| File | `tai-lieu/` (txt, md, csv), `hinh-anh/` (banner), `thu-muc-trong/` |
| Address | Đơn vị hành chính hiện hành (từ 01/07/2025, bỏ cấp huyện): **34 tỉnh/thành phố, 3.321 phường/xã/đặc khu**. File `backend/prisma/seed/vn-address.json` |

Ngày khuyến mãi tính theo thời điểm chạy seed, nên lúc nào chạy lại cũng có đủ các trạng thái trên.

### Sửa dữ liệu mẫu

- Dữ liệu nằm trong `backend/prisma/seed/data.json`, địa chỉ trong `backend/prisma/seed/vn-address.json`, ảnh trong `backend/prisma/seed/assets/`.
- Chỉ nạp lại bảng Address (không đụng user, sách, file): `bun run seed:address --yes` trong `backend/`. Chạy trên server thì thêm `--allow-remote`.
- Thêm, đổi tên sách hoặc đổi đoạn đọc thử thì vẽ lại ảnh (bìa + trang đọc thử) trước khi seed (cần Python 3 + Pillow, font của Windows):

  ```bash
  python backend/prisma/seed/tools/make_images.py
  ```

## Build và chạy production

```bash
cd frontend && bun run build   # build ra backend/public
cd ../backend && bun run start # phục vụ cả API và web ở cổng PORT
```

- Backend trả `public/index.html` cho mọi đường dẫn không phải API. Chưa build frontend mà mở trang gốc thì lỗi `ENOENT ... public/index.html`.
- Build có kiểm tra TypeScript và ESLint; có lỗi lint là build dừng.
- `bun run build` trong `backend/` build cả frontend lẫn backend, nhưng **xoá `frontend/node_modules`** sau khi build. Đang chạy dev frontend thì đừng dùng lệnh này.

### Cập nhật server production (VPS)

Repo không dùng Prisma migrations: cấu trúc DB được đồng bộ bằng `bunx prisma db push` theo `backend/prisma/schema.prisma`.

```bash
# 0. Sao lưu trước khi cập nhật
mysqldump -u <user> -p <tên_db> > backup_$(date +%F).sql
tar czf upload_$(date +%F).tgz -C backend upload   # thư mục FILEDIR

# 1. Lấy code mới (nhánh deploy-vps, main trùng nội dung)
git pull origin deploy-vps

# 2. Build frontend + cài thư viện backend + sinh Prisma client
cd backend
bun run build

# 3. Đồng bộ cấu trúc DB
bunx prisma db push

# 4. Khởi động lại backend (pm2 / systemd / cách đang dùng)
bun run start
```

- **Không** chạy `bun run seed` trên production: lệnh này xoá toàn bộ dữ liệu.
- `prisma db push` ở bước 3 không được hỏi *"data loss"*. Nếu nó hỏi thì **dừng lại**, không thêm `--accept-data-loss`, báo lại cho dev.
- Đợt cập nhật 2026-11-20 → 2026-11-21 chỉ **thêm**, không xoá hay đổi kiểu cột nào (đã chạy thử trên bản sao DB cũ có dữ liệu): sách thêm 8 cột không bắt buộc (`author`, `publisher`, `publishYear`, `pageCount`, `isbn`, `language`, `previewTitle`, `previewContent`), category thêm `isActive` (mặc định bật), thêm 2 bảng `Order`, `OrderItem` và 2 enum `OrderStatus`, `PaymentMethod`.
- Bảng Address: production còn dữ liệu cũ (có cấp huyện, khác 34 tỉnh/thành) thì nạp lại: `bun run seed:address --yes --allow-remote`. Lệnh chỉ thay bảng Address, không đụng user, sách, đơn hàng.
- Lần khởi động đầu, server tự **xoá ảnh không sách nào dùng** trong `upload/$book-image/` (cũ hơn 24 giờ), sau đó lặp lại mỗi giờ. Vì thế cần sao lưu `upload/` ở bước 0.
- MySQL nên chạy chế độ strict (mặc định của MySQL 8) và engine mặc định **InnoDB**. Tạo DB mới mà `db push` báo `Specified key was too long; max key length is 1000 bytes` là do engine mặc định đang là MyISAM (hay gặp ở WAMP): đặt `default_storage_engine=InnoDB` trong `my.ini` / `my.cnf`, khởi động lại MySQL rồi chạy lại.

## Cấu trúc thư mục

```text
backend/
  prisma/schema.prisma     # schema database
  prisma/seed/             # dữ liệu mẫu, ảnh, script seed
  src/index.ts             # khởi tạo server, route tĩnh
  src/routers/             # API theo module (*-controller.ts)
  src/plugins/             # auth, JWT, phân trang/tìm kiếm, log
  upload/                  # file upload (không commit)
frontend/
  src/pages/<module>-mgt/  # màn hình từng module
  src/api/axios.ts         # axios, baseURL /api
docs/bugs/                 # bug report
plans/                     # kế hoạch phát triển + thay đổi cần đồng bộ sang app mobile
memory/                    # ghi chú làm việc
```

## Kế hoạch và đồng bộ với app mobile

- Lộ trình tính năng và trạng thái: [`plans/roadmap.md`](plans/roadmap.md).
- Mỗi thay đổi trên web (API, UI) được ghi ở [`plans/mobile-sync.md`](plans/mobile-sync.md), kèm file tương ứng bên repo `mobile-book.anhtester.com` và việc mobile cần làm.
- App mobile gọi API **production**, nên API mới chỉ dùng được trên mobile sau khi deploy backend.

## Kiểm thử

- Bug đã biết: [`docs/bugs/README.md`](docs/bugs/README.md). Xem trước khi báo bug mới để tránh trùng.
- Giao diện có hai ngôn ngữ, đổi bằng nút **EN / VI** trên header (`#btn-language`), mặc định tiếng Anh. Mở thẳng tiếng Việt bằng `?lang=vi` (vd `http://localhost:3039/book-management?lang=vi`); lựa chọn được nhớ trong `localStorage` (khoá `lang`). Thông báo trả về từ API luôn là tiếng Anh.
- Gọi API có tiếng Việt thì dùng script Bun (`fetch`) hoặc Postman. `curl` trong Git Bash trên Windows đổi chữ có dấu thành `?` trước khi gửi.
- App mobile (repo `mobile-book.anhtester.com`) mặc định gọi API production `https://book.anhtester.com`, không gọi backend local.

## Giấy phép

Xem [LICENSE](LICENSE).
