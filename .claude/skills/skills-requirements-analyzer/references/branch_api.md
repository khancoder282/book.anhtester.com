### 3.4. Nhánh API Spec Analysis — phân tích đặc tả API

Dùng cho: hệ thống **chỉ có API**, hoặc **mặt API** của hệ thống đã có web/app (khi đó REQ vào chung module theo 2.2). Workflow dùng nhánh này: `/discover-system` (tầng khám phá — 3.4.1 → 3.4.4), `/generate-requirements-from-api` (tầng module — cả 3.4), `/generate-testcases-api` (đọc lại 3.4.1 → 3.4.4 khi chưa có bản đồ API), `/generate-automation-api` (quy tắc dữ liệu 3.4.4).

> **Nguyên tắc gốc:** spec khai `403` không có nghĩa hệ thống **trả** `403`; spec khai `required` không có nghĩa server **chặn**. Spec là *lời khai*, response thật là *sự thật* — đúng quan hệ giữa tài liệu và UI ở mục 3.3.

#### 3.4.1. Lấy nguồn — phải là bản gốc, không phải bản đã qua xử lý

| Nguồn | Cách lấy spec gốc | Bẫy hay gặp |
|---|---|---|
| **URL spec trực tiếp** (`.json` / `.yaml`) | Tải thô bằng `curl -sSL -o <file>` vào `_discovery/sources/`, rồi `Read` file đó | ❌ **KHÔNG dùng `WebFetch`** — công cụ này trả nội dung đã chuyển đổi/tóm tắt, spec lớn bị cắt mà không báo lỗi, mà snapshot lại là nguồn sự thật bất biến |
| **Swagger UI** | Đọc cấu hình thật: `swagger-initializer.js` · `swagger-config` · request phát sinh khi trang load → lấy `url` hoặc `urls[]`. Chỉ thử đường mặc định (`/v3/api-docs`, `/v2/api-docs`, `/swagger.json`) khi không đọc được cấu hình | **Nhiều spec** trong dropdown `urls` (theo phiên bản hoặc theo dịch vụ) → liệt kê hết, **hỏi user phạm vi**, snapshot từng spec một. Chỉ lấy spec đang hiển thị mặc định là sót cả dịch vụ |
| **Scalar** | Thuộc tính `data-url` / `data-configuration` của thẻ `#api-reference` → URL spec. **Hoặc spec nhúng inline**: khối `<script id="api-reference" type="application/json">…</script>` hay `configuration.content` → trích nguyên khối JSON đó ra file | Trang Scalar là **renderer**, không phải spec — snapshot HTML của trang là snapshot sai |
| **Redoc** | `<redoc spec-url="…">` hoặc `Redoc.init('<url>')`. Bản standalone nhúng spec trong biến `__redoc_state` | |
| **Stoplight Elements / RapiDoc** | Thuộc tính `apiDescriptionUrl` / `spec-url` | |
| **Postman collection** (`.json` v2.x) | `Read` trực tiếp. Endpoint = `item[].request` (đệ quy qua folder) · ví dụ response ở `response[]` · auth khai ở `auth` cấp collection / folder / request — **cấp dưới đè cấp trên**, giống `security` của OpenAPI · biến `{{base_url}}` tra ở `variable[]` hoặc file environment | Collection **không có schema** — ràng buộc field chỉ thấy qua ví dụ. Không có ví dụ lỗi thì ràng buộc là `❔` |
| **Tài liệu API dạng văn bản** (`.docx` / `.pdf` / trang Confluence export) | Ủy quyền skill `docx` / `pdf` như 3.2 Bước 0 → xử lý theo **3.4.6** | Không máy đọc được — mọi dữ kiện phải trích dẫn nguyên văn kèm vị trí |
| **Trang tài liệu phải đăng nhập mới xem** | **Hỏi user** file export, hoặc tài khoản xem tài liệu (lưu `.env`) | ❌ Không tự đăng ký tài khoản hay dò đường vòng để vào |

**Sau khi lấy — kiểm trước khi dùng:**
- Snapshot đặt tên `openapi_<YYYY-MM-DD>.json` / `postman_<YYYY-MM-DD>.json`; tài liệu văn bản giữ **tên gốc**. Ghi URL nguồn + ngày tải ở bản đồ API (5.8.2)
- **Đếm số operation** (`paths` × method) trong file, so với số hiển thị trên trang tài liệu. Lệch → snapshot sai hoặc thiếu, chưa được đi tiếp
- Ghi **phiên bản đặc tả** (`swagger: 2.0` / `openapi: 3.x`) và `info.version`. Khi trích field phải **resolve `$ref`** — `$ref` không có nghĩa là "không có schema"
- Lần chạy sau: tải lại spec, so `sha256` với snapshot cũ. Khác → snapshot mới (giữ bản cũ), liệt kê operation thêm/bỏ/đổi vào Nhật ký khám phá

#### 3.4.2. Ranh giới module & prefix

| Tình huống | Cách chia module |
|---|---|
| Hệ thống **chỉ có API** | Mỗi `tag` của spec (folder của Postman, chương của tài liệu) = 1 module |
| API của hệ thống **đã có web/app** | **Ghép `tag` vào module đã có** theo nghiệp vụ — tag `Customers` ↔ module `CUST` → **cùng prefix** (2.2). Tag không khớp module nào → module mới, chốt ở checkpoint |
| Tag đặt theo kỹ thuật (`customer-controller`, `v2-internal`) | Suy nghiệp vụ từ tiền tố path (`/api/customers/...`) và entity trong schema, ghi tên tag vào cột bí danh |
| Operation **không có tag** | Nhóm theo segment đầu của path, đánh dấu `⚠️ không tag` |
| Endpoint nội bộ / tiện ích (health, metrics, seed dữ liệu test) | Gom vào một module tiện ích (`SYS`), không đẻ prefix riêng cho từng cái |

#### 3.4.3. Ma trận auth theo TỪNG operation (dễ bỏ sót nhất)

`security` khai ở cấp gốc chỉ là mặc định — **mỗi operation được ghi đè**. Operation có `security: []` là **công khai**, dù spec gốc khai `BearerAuth`. Swagger UI và Scalar đều **không** làm nổi bật khác biệt này.

```js
const congKhai = Array.isArray(op.security) && op.security.length === 0;
const theoMacDinh = op.security === undefined;   // kế thừa security cấp gốc
```

| Nguồn | Đọc auth ở đâu |
|---|---|
| OpenAPI | `op.security` → nếu `undefined` thì `security` cấp gốc |
| Postman | `auth` của request → folder → collection. `"type": "noauth"` = công khai |
| Tài liệu văn bản | Chỉ khi tài liệu nói rõ từng endpoint. Nói chung chung *"mọi API cần token"* → mỗi endpoint ghi `❔ theo mô tả chung` + kiểm chứng ở 3.4.4 |

Soi ngay: endpoint **công khai** mà trả **dữ liệu cá nhân** (user, đơn hàng, hồ sơ) → đánh 🔴, là phát hiện giá trị nhất và rẻ nhất.

Spec hầu như **không** khai role (admin/staff). Có vendor extension (`x-roles`, `x-permissions`) hoặc mô tả *"Admin only"* thì dùng, ghi nguồn. Không có → cột role của ma trận là `❔` + `AMB-<MODULE>-XX` 🔴, **không** suy từ tên endpoint.

#### 3.4.4. Kiểm chứng bằng gọi thật — luật RIÊNG của nhánh API

Khác nhánh UI (3.1.1 **cấm** gọi API trực tiếp vì UI là nguồn sự thật): ở nhánh này **không có UI**, nên gọi thật là **bắt buộc** — nhưng có kiểm soát.

**Điều kiện trước request đầu tiên:**
- Dòng **Năng lực kiểm thử của QA** ở `docs/requirements/README.md` ghi `Gọi API: ✅`. Chưa có hoặc ❌ → **không gọi**, mọi REQ dừng ở mức `Spec` (3.4.5), báo rõ ở bàn giao
- Đã chốt **môi trường** và **có dùng chung không**. Base URL + tài khoản ở `.env`

**🚨 Quy tắc dữ liệu — vi phạm đã từng xoá mất tài khoản gốc của một hệ thống demo:**

| Quy tắc | Chi tiết |
|---|---|
| **TUYỆT ĐỐI KHÔNG lấy bản ghi có sẵn làm mục tiêu ghi/xoá** | Kiểm BOLA/IDOR **phải** tự tạo **2 tài khoản của riêng mình** (`userA`, `userB`) rồi dùng token của A nhắm vào tài nguyên của B. **CẤM** lấy `id` từ API danh sách rồi `PATCH`/`DELETE` — đó là dữ liệu thật của người khác |
| **Chỉ ghi/xoá trên bản ghi do chính phiên này tạo ra** | Áp cho mọi method ghi (`POST`/`PUT`/`PATCH`/`DELETE`), kể cả khi user nói "được xoá thoải mái" |
| **Đặt tên traceable** | `auto_<module>_<timestamp>` cho mọi bản ghi sinh ra |
| **Dọn ngay sau khi xong** | Xoá hết bản ghi đã tạo trong phiên; báo cáo số tạo / số dọn / còn sót |
| **Lỡ tay đụng dữ liệu thật** | Báo user **ngay**, khôi phục tối đa, ghi mục **Sự cố** của bản đồ API: khôi phục được gì, **không** khôi phục được gì. Tạo lại y hệt **không** bằng chưa từng xoá — ID mới, bản ghi liên quan mất liên kết |

> Đây là **nguồn duy nhất** của bộ luật. `/generate-testcases-api` và `/generate-automation-api` chỉ tóm tắt 3 luật cứng rồi trỏ về đây — sửa luật thì sửa ở mục này, không chép thêm bản thứ hai.

**Nhóm probe — đọc trước, ghi sau:**

| Nhóm probe | Kiểm cái gì | Vì sao |
|---|---|---|
| GET công khai **không token** | Ma trận auth 3.4.3 có đúng không | Bắt rò rỉ dữ liệu cá nhân |
| Endpoint cần token, **không gửi token** | Có thật trả `401` không | Xác nhận hàng rào auth tồn tại |
| Tài khoản mới tự đăng ký → endpoint nhạy cảm | User quyền thấp nhất làm được gì | Lộ ra hệ thống **có** mô hình phân quyền hay không |
| Bỏ từng field `required` · bơm giá trị ngoài ràng buộc (âm, ngoài enum, quá dài, khoá ngoại không tồn tại) | Server validate thật hay chỉ khai trên giấy | Phân biệt ràng buộc **thật** với ràng buộc **trên giấy** |
| Đọc response header + `Set-Cookie` | `HttpOnly`/`Secure`/`SameSite`, header lộ phiên bản | Chỉ thấy khi gọi thật |
| Status code thực tế vs spec | `200` vs `201`, `400` vs `422` | Kỳ vọng sai là nguồn FAIL giả số 1 ở tầng TC |

Mỗi sai lệch ở tầng khám phá ghi thành **phát hiện `F-nn`** kèm bằng chứng nguyên văn (request + status + trích body, **đã che token và dữ liệu cá nhân**). Chỗ hệ thống làm **đúng** cũng ghi — đó là REQ/TC chống hồi quy.

#### 3.4.5. Trích REQ từ spec

| Dữ kiện trong spec | Thành REQ gì | Ghi chú |
|---|---|---|
| Mỗi operation — response thành công | 1 REQ: điều kiện gọi · status · **hình dạng** body chính | Status thật lệch spec → AC theo spec **và** `AMB-<MODULE>-XX` ghi cả hai nguyên văn (xem luật lệch pha dưới) |
| Mỗi field `required` (body / path / query / header) | 1 REQ mỗi field: *thiếu field → `<status>` + body lỗi* | Không gộp nhiều field vào một REQ (4.3.4) |
| Ràng buộc: `minLength` · `maxLength` · `pattern` · `enum` · `minimum` · `maximum` · `format` | 1 REQ mỗi ràng buộc; liệt kê đủ ở Field Spec (3.4.7) | Field Spec là nơi liệt kê, REQ trỏ tới dòng — không chép ràng buộc hai lần |
| Auth của operation | REQ *"không token → 401"* cho operation 🔒 · REQ *"truy cập không cần token"* cho operation 🌐 | Công khai mà trả dữ liệu cá nhân → REQ vẫn ghi đúng spec **và** mở `RISK-<MODULE>-XX` + `AMB-<MODULE>-XX` 🔴 |
| Tham số phân trang / sắp xếp / lọc | 1 REQ mỗi tham số | Giá trị mặc định chỉ ghi khi spec khai `default` |
| Schema lỗi dùng chung (error envelope) | 1 REQ cấp module về hình dạng body lỗi | |
| `enum` trạng thái + operation đổi trạng thái | Ma trận Trạng thái (6.6) | Chuyển trạng thái nào được phép — spec thường **không** nói → `AMB-<MODULE>-XX` |
| `deprecated: true` | REQ vẫn 🟢 (tính năng còn chạy) + ghi chú *"spec đánh deprecated"* + `AMB-<MODULE>-XX` hỏi lịch gỡ | Không nhầm với trạng thái 🔴 Deprecated của REQ |
| Thứ spec **không** nói: tính duy nhất · ràng buộc liên field · rule nghiệp vụ · rate limit | ❌ Không bịa REQ | `AMB-<MODULE>-XX` kèm Assumption tạm |

**Thang nguồn 4 mức cho cột `Nguồn`** (thay thang ở 3.3.1 Bước 3 khi nguồn là API):

| Giá trị | Nghĩa |
|---|---|
| `Spec · <METHOD> <path>` | Chỉ có trong spec, **chưa** gọi thật |
| `Spec + kiểm chứng thực tế · <METHOD> <path> → <status>` | Spec khai, đã gọi thật và khớp — **mức tin cậy cao nhất** |
| `Thực tế — spec không nói · <METHOD> <path> → <status>` | Chỉ quan sát được khi gọi, spec im lặng |
| `Tài liệu · <file> · <vị trí>` | Từ tài liệu API dạng văn bản (3.4.6) |

**Luật lệch pha spec ↔ thực tế:** REQ ghi theo **ý định đã công bố** (spec/tài liệu), cột `Nguồn` ghi `Spec — ❌ lệch thực tế (F-nn)`, kèm `AMB-<MODULE>-XX` 🔴 nguyên văn cả hai bên. **Không** tự hạ REQ theo hành vi thật (là che bug), cũng **không** giấu lệch pha (là để TC FAIL giả). PO trả lời AMB mới quyết định bên nào đúng.

#### 3.4.6. Tài liệu API dạng văn bản (.docx / .pdf)

Hay gặp ở dự án outsource hoặc tích hợp đối tác: không có OpenAPI, chỉ có một file Word mô tả endpoint.

1. **Đọc** bằng skill `docx` / `pdf` — không `Read` thẳng file nhị phân
2. **Tìm 4 loại nội dung:** bảng danh sách endpoint · request/response mẫu · bảng mã lỗi · mô tả xác thực
3. **Dựng Endpoint Catalog** với vị trí nguồn cụ thể: `api_spec_v3.docx · mục 4.2 · bảng 7`
4. **JSON mẫu là VÍ DỤ, không phải SCHEMA.** Field xuất hiện trong ví dụ ≠ field bắt buộc; giá trị mẫu ≠ kiểu dữ liệu duy nhất. **Không** suy `required` / kiểu / độ dài từ ví dụ → `❔` + `AMB-<MODULE>-XX`
5. **Bảng mã lỗi** trong tài liệu → Validation Messages (3.4.7), trích nguyên văn mã + message
6. ❌ **Không** sinh file OpenAPI từ tài liệu rồi đặt vào `sources/` như thể là spec gốc. Bản phác thảo để hỗ trợ automation (nếu cần) đặt ngoài `sources/` và ghi rõ *"suy từ tài liệu, không phải spec của hệ thống"*
7. Có cả tài liệu **và** spec → đối chiếu theo 3.3: tài liệu = ý định nghiệp vụ, spec = lời khai kỹ thuật, response thật = sự thật. Ba nguồn lệch nhau → `AMB-<MODULE>-XX` ghi cả ba
8. Gọi thật được (3.4.4) → kiểm chứng như spec. Không gọi được → mọi REQ dừng ở `Tài liệu · …`, **không** nâng lên mức kiểm chứng

#### 3.4.7. Mục 6 áp cho API — thay đổi so với nhánh UI

Tài liệu đầu ra theo mục 6, ghi vào **`api/requirements_<module>_api.md`** (REQ chỉ áp API) và **index** `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` (REQ dùng chung với web/mobile — mục 5.3). Khác nhánh UI ở các mục sau:

| Mục | Nhánh UI | Nhánh API |
|---|---|---|
| **6.1** metadata | Dòng `Trình duyệt khảo sát` | Thay bằng 2 dòng: **`Nguồn spec`** (URL · ngày snapshot · `openapi`/`info.version` · đường dẫn file snapshot) và **`Môi trường gọi thử`** (tên môi trường · dùng chung hay không · `Gọi API: ✅/❌`) — **không** ghi base URL có token hay tài khoản |
| **6.2** REQ | như cũ | Như cũ; module nhiều nền tảng thì có cột `Nền tảng` (2.2) |
| **6.3** Field Spec | `Field (Label) · Loại UI · Required · Ràng buộc` | **`Field (JSON path) · Vị trí (path/query/header/body) · Kiểu · Required · Ràng buộc · Operation dùng · REQ liên quan`**. Field dùng ở nhiều operation với ràng buộc khác nhau → mỗi operation một dòng |
| **6.4** Validation | Message nguyên văn từ UI | **`REQ · Điều kiện · Status · Body lỗi nguyên văn`** — trích dẫn, che dữ liệu nhạy cảm |
| **6.5** Phân quyền | Hành động × role | **Operation × (`Không token` · từng role)** — 🌐/🔒 từ spec, `✅`/`❌` khi đã gọi thật, `❔` khi chưa |
| **Mới — Endpoint Catalog** (đặt ngay sau 6.1) | — | `Method · Path · Auth · Status khai trong spec · Status thực tế · REQ bao phủ`. **Mọi operation trong phạm vi phải có ≥ 1 REQ**, hoặc ghi lý do loại khỏi phạm vi |
| **7.2.1** Evidence | Ảnh chụp | **Request/response nguyên văn** chép trong tài liệu (đã che token, cookie, dữ liệu cá nhân) — không cần ảnh |
