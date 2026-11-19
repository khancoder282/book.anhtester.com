## 5. Quy Mô Tài Liệu & Quy Tắc Tách File (Scaling Rule)

Module lớn sinh ra tài liệu dài, khó review và khó chia việc. Ngược lại, tách quá sớm sẽ **làm vỡ các hạng mục cắt ngang** (ma trận phân quyền, ma trận trạng thái, AMB/RISK liên module). Quy tắc dưới đây quyết định dựa trên **số REQ**, không dựa trên dung lượng file.

### 5.1. Bảng ngưỡng (BẮT BUỘC áp dụng)

Đếm số REQ **sau khi hoàn tất recon**, trước khi ghi file — **đếm theo từng file nền tảng** (tầng nền tảng luôn có, mục 5.3; ngưỡng dưới đây chỉ quyết định file nền tảng có phải chia tiếp thành Story hay không):

| Số REQ trong file nền tảng | Cấu trúc đầu ra | Mục Phân rã Epic/Story |
|---|---|---|
| **< 25** | 1 file `<nền-tảng>/requirements_<module>_<nền-tảng>.md` | ❌ Không cần |
| **25 – 80** | 1 file nền tảng | ✅ **BẮT BUỘC** (mục 6.8) — bảng Story đặt ở index |
| **> 80** hoặc thoả điều kiện tại 5.2 | Chia tiếp vào `<nền-tảng>/stories/` theo cấu trúc 5.3 | ✅ **BẮT BUỘC** ở file index |

### 5.2. Điều kiện tách bắt buộc (kể cả khi < 80 REQ)

Tách ngay nếu gặp **bất kỳ** dấu hiệu nào sau:

- Module chứa **≥ 2 entity nghiệp vụ độc lập** có vòng đời riêng (VD: `Customer` và `Contact`, `Project` và `Task`)
- Phạm vi khảo sát mở rộng sang **sub-module/tab con** có nghiệp vụ riêng (VD: phân tích cả 17 tab của Project)
- Có **≥ 2 ma trận trạng thái** khác nhau trong cùng tài liệu
- Người dùng nêu rõ team làm việc theo Jira và cần chia việc theo Story

### 5.3. Cấu trúc thư mục (áp dụng cho MỌI module, tách hay không tách)

**Mỗi module một thư mục riêng, bên trong luôn chia tầng nền tảng.** Layout chuẩn của repo:

```
docs/requirements/
├── README.md                              ← DANH MỤC toàn hệ thống (mục 5.7)
├── <module>/
│   ├── REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md           ← INDEX — TÊN FILE BẤT BIẾN · phần dùng chung + Bản đồ tài liệu
│   ├── web/                               ← TẦNG NỀN TẢNG — chỉ nhận 3 tên: web · mobile · api
│   │   ├── requirements_<module>_web.md   ← REQ chỉ áp web · Field Spec · Validation · Trình duyệt khảo sát
│   │   ├── evidence/*.png                 ← bằng chứng khảo sát web
│   │   └── stories/story_NN_<slug>.md     ← CHỈ khi file nền tảng vượt ngưỡng (mục 5.1)
│   ├── mobile/
│   │   ├── requirements_<module>_mobile.md ← REQ Android/iOS · Yêu cầu riêng mobile · Thiết bị khảo sát
│   │   └── evidence/android_*.png · ios_*.png
│   ├── api/
│   │   └── requirements_<module>_api.md   ← Endpoint Catalog · REQ chỉ API · Field Spec JSON · Nguồn spec
│   ├── analysis/                          ← phân tích ticket — CẤP MODULE (ticket thường cắt ngang nền tảng)
│   │   └── analysis_<TICKET-ID>.md
│   └── impact/                            ← Impact Report của /update-requirements-from-ticket · /generate-requirements-from-api
│       └── impact_<TICKET-ID>.md          ← input BẮT BUỘC cho /update-testcases-from-impact
```

**Quy tắc thư mục — bất biến:**

| Quy tắc | Lý do |
|---|---|
| Tên file index **luôn** `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` — chữ IN HOA, `<TÊN_MODULE>` = tên thư mục module viết HOA, `-` đổi thành `_` (VD `login` → `LOGIN`, `customers` → `CUSTOMERS`) — **không phải** prefix REQ (`CUST`) | Mọi workflow phía sau đọc theo `docs/requirements/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md`. IN HOA để index **khác hẳn** file nền tảng `requirements_<module>_<nền-tảng>.md` — nhìn là biết file tổng, không nhầm với file web/mobile/api. Đổi tên là vỡ chuỗi (mục 5.5) |
| Tên thư mục = tên module, chữ thường, không dấu | Tra cứu bằng glob `docs/requirements/*/REQUIREMENTS_*_SUMMARY.md` |
| Evidence nằm **trong** thư mục nền tảng của module (`<module>/<nền-tảng>/evidence/`) | Tài liệu và bằng chứng đi cùng nhau; ảnh web và ảnh app không lẫn vào nhau |
| **Tầng nền tảng luôn có**, kể cả module mới chỉ có một nền tảng; chỉ nhận `web` · `mobile` · `api` | Thêm nền tảng thứ hai về sau không phải di chuyển file — di chuyển là gãy link evidence. Android và iOS chung `mobile/` — tách đôi là nhân đôi tài liệu của cùng một màn hình |
| Tên file nền tảng mang hậu tố nền tảng: `requirements_<module>_<nền-tảng>.md` | Glob `docs/requirements/*/REQUIREMENTS_*_SUMMARY.md` chỉ bắt index, `docs/requirements/*/*/requirements_*.md` chỉ bắt file nền tảng; tên riêng giúp mở nhầm file cũng biết ngay đang ở nền tảng nào |
| Tài liệu cũ còn index tên `requirements_<module>.md` / `test_cases_<module>.md` (quy ước trước 21-09-2026) | Workflow đọc **nhận cả hai tên**. Lần đầu một workflow sinh/cập nhật chạm lại module → đổi tên **một lần** sang `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` / `TEST_CASES_<TÊN_MODULE>_SUMMARY.md`, sửa mọi link trỏ tới nó, ghi Nhật ký loại `✏️ Biên tập` |
| Tài liệu cũ chưa có tầng nền tảng | Không bắt buộc sửa ngay. Lần đầu một workflow sinh/cập nhật chạm lại module → chuyển **một lần**: REQ chỉ áp một nền tảng sang file nền tảng, evidence sang `<nền-tảng>/evidence/` và sửa link, mã REQ giữ nguyên, ghi Nhật ký loại `✏️ Biên tập` |
| Phân tích ticket nằm ở `<module>/analysis/` | Giữ liên kết ticket ↔ module. **KHÔNG** đặt ở thư mục toàn cục |
| Thêm module = thêm thư mục + 1 dòng ở danh mục | Không đụng gì khác trong repo |

**Phân chia nội dung giữa index và file nền tảng — quy tắc cứng:**

| Nội dung | Đặt ở đâu | Lý do |
|---|---|---|
| Metadata cấp module (dải mã, mã kế tiếp, dòng `Nền tảng`), Tổng quan, Phạm vi | **Index** | Điểm vào duy nhất |
| `## Bản đồ tài liệu` — mọi file nền tảng + file story kèm dải REQ | **Index** | Hợp đồng đọc (5.5) |
| REQ áp **≥ 2 nền tảng** (cột `Nền tảng` bắt buộc) | **Index** | Một rule một REQ — đặt ở file của một nền tảng là giấu nó khỏi nền tảng kia |
| Ma trận phân quyền, ma trận trạng thái | **Index** | Cắt ngang mọi nền tảng. Hành động chỉ có ở một nền tảng thì ghi nền tảng ngay trong tên hành động |
| Bảng Ambiguity & Risk | **Index** | Đánh số toàn module |
| Phân rã Epic/Story · Nhật ký thay đổi · NFR chung | **Index** | Cắt ngang |
| Metadata khảo sát: `Trình duyệt khảo sát` / `Thiết bị khảo sát` + `Tầng network` / `Nguồn spec` + `Môi trường gọi thử` | **File nền tảng** | Chỉ đúng cho nền tảng đó |
| Bản đồ phủ tài liệu (6.5.1) của lượt khảo sát | **File nền tảng** | Mỗi nền tảng một mức phủ tài liệu khác nhau |
| REQ chỉ áp nền tảng đó · Field Spec · Validation Messages · User Flow | **File nền tảng** | Gắn với giao diện / giao thức của nền tảng |
| Endpoint Catalog | **File `api/`** | Mục riêng nhánh API (3.4.7) |
| Yêu cầu riêng của mobile (8 nhóm — 3.5.3) | **File `mobile/`** | Mục riêng nhánh Mobile |
| Danh mục Evidence | **File nền tảng** | Ảnh nằm ở `<nền-tảng>/evidence/` |

**Phân chia nội dung khi file nền tảng bị chia tiếp thành Story — quy tắc cứng:**

| Nội dung | Đặt ở đâu | Lý do |
|---|---|---|
| Bảng metadata, Tổng quan, Phạm vi | **Index** | Điểm vào duy nhất |
| Bảng phân rã Epic/Story + ánh xạ REQ | **Index** | Bản đồ điều hướng toàn module |
| Ma trận phân quyền | **Index** | Cắt ngang mọi Story |
| Ma trận trạng thái | **Index** | Cắt ngang mọi Story |
| Bảng Ambiguity & Risk | **Index** | Đánh số theo **toàn module**, không đánh lại theo từng file |
| Yêu cầu phi chức năng | **Index** | Áp cho toàn module |
| Bảng REQ chi tiết của từng Story | **File story** | Đơn vị chia việc |
| Đặc tả trường dữ liệu (Field Spec) | **File story** tương ứng | Đi kèm form/màn hình của Story đó |
| Validation messages | **File story** tương ứng | Gắn trực tiếp với REQ trong Story |
| User Flow | **File story** tương ứng | Mỗi flow thuộc đúng 1 Story |

### 5.4. Bất biến khi tách (Invariants — kiểm tra trước khi bàn giao)

- [ ] **REQ ID giữ nguyên tuyệt đối** — không đánh lại số, không đổi prefix, kể cả khi dòng REQ chuyển giữa file nền tảng và index
- [ ] **Mỗi REQ nằm ở đúng 1 file** — index (khi áp ≥ 2 nền tảng) **hoặc** một file nền tảng (khi chỉ áp nền tảng đó), không nằm ở cả hai
- [ ] REQ ở index có cột `Nền tảng` ghi ≥ 2 nền tảng; REQ ở file `web/` / `api/` chỉ áp đúng nền tảng đó
- [ ] **Mỗi REQ thuộc đúng 1 Story** — không REQ mồ côi, không REQ nằm ở 2 Story
- [ ] **Tổng REQ trong các Story = tổng REQ đã sinh** — nêu rõ con số trong index để tự kiểm chứng
- [ ] **AMB/RISK đánh số toàn module**, chỉ đặt ở index; file story chỉ *tham chiếu*, không nhân bản nội dung
- [ ] **Hạng mục cắt ngang không bị nhân bản** vào file story
- [ ] Mỗi file story có link ngược về index; index có link tới mọi file story

### 5.5. Hợp đồng đọc cho các workflow phía sau (Consumer Contract)

Tách file **không được** làm vỡ chuỗi `/generate-testcases-manual-rbt` → `/generate-traceability-matrix` → `/generate-automation-from-testcases`. Vì vậy:

- **Đường dẫn index LUÔN là:**
  ```
  docs/requirements/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md
  ```
  Bất kể tài liệu có tách hay không. Mọi workflow phía sau chỉ cần biết đúng một mẫu đường dẫn này — tra được bằng glob `docs/requirements/*/REQUIREMENTS_*_SUMMARY.md`.
- **Điểm vào cấp hệ thống là `docs/requirements/README.md`** — khi không biết module nào tồn tại hoặc prefix nào đã dùng, đọc file này trước (mục 5.7).
- Index **BẮT BUỘC** có mục `## Bản đồ tài liệu` liệt kê đầy đủ file nền tảng (và file story nếu có) kèm dải REQ mà file đó chứa:
  ```markdown
  ## Bản đồ tài liệu
  | Nền tảng | File | Story | REQ bao phủ |
  |---|---|---|---|
  | Chung ≥ 2 nền tảng | chính file này — mục 6.2 | — | REQ-PRJ-01 → 05 |
  | Web | [web/requirements_projects_web.md](web/requirements_projects_web.md) | — | REQ-PRJ-06 → 40 |
  | Web | [web/stories/story_01_danh_sach.md](web/stories/story_01_danh_sach.md) | STORY-PRJ-01 | REQ-PRJ-41 → 53 |
  | Mobile | [mobile/requirements_projects_mobile.md](mobile/requirements_projects_mobile.md) | — | REQ-PRJ-54 → 66 |
  | API | [api/requirements_projects_api.md](api/requirements_projects_api.md) | — | REQ-PRJ-67 → 88 |
  ```
- Workflow phía sau đọc index trước, rồi theo bản đồ đọc **file của nền tảng đang làm** (sinh TC web → chỉ cần index + `web/`). Index không có bản đồ → tài liệu cũ một file, chưa có tầng nền tảng (xem luật chuyển đổi ở 5.3).

### 5.6. Ưu tiên convention sẵn có

Trước khi quyết định tách, **đọc `docs/requirements/README.md` và xem các module đã có**. Nếu repo đang theo một convention khác với mục 5.3, **giữ nguyên convention đó** và chỉ bổ sung mục Phân rã Epic/Story — trừ khi người dùng yêu cầu đổi. Nhất quán trong repo quan trọng hơn ngưỡng lý thuyết.

### 5.7. Danh mục toàn hệ thống — `docs/requirements/README.md`

#### 5.7.1. Khởi tạo khi chưa tồn tại (BẮT BUỘC — dự án mới)

> ⚠️ **Đây là bước dễ bị bỏ sót nhất khi bắt đầu một dự án mới.** Không có file danh mục thì bước 1 của mục 2.1 (đọc prefix đã chiếm + mã kế tiếp) **im lặng không chạy** — cơ chế chống trùng mã và nối tiếp REQ mất tác dụng mà không có cảnh báo nào.

**Trước khi ghi tài liệu module ĐẦU TIÊN của một dự án:**

1. Kiểm tra `docs/requirements/README.md` có tồn tại không
2. **Nếu CHƯA có** → tạo ngay từ template ở mục 5.7.2, với bảng danh mục **rỗng** (chỉ có dòng tiêu đề)
3. Ghi tài liệu module
4. Bổ sung dòng đầu tiên vào bảng danh mục

Áp dụng y hệt cho `docs/testcases/README.md` ở nhánh test case (xem skill `skills-rbt-manual-testing`).

#### 5.7.2. Nội dung bắt buộc

File danh mục là **điểm vào cấp hệ thống**, phải được cập nhật mỗi khi có module mới hoặc REQ mới. Nội dung bắt buộc:

| Mục | Nội dung |
|---|---|
| **1. Bảng danh mục module** | `Module · Prefix · Nền tảng · Trạng thái recon · Mức phủ tài liệu · Tài liệu · REQ đã dùng · Mã kế tiếp · AMB treo · Story · Cập nhật` |
| **Nền tảng** | Nền tảng module **đã có** (`Web · Android · iOS · API`), kèm dấu trạng thái recon riêng khi chúng lệch nhau: `Web ✅ · Android ⬜`. Danh mục cũ chưa có cột này → hiểu là chỉ có một nền tảng; bổ sung cột ở lần đầu thêm nền tảng thứ hai (mục 2.2) |
| **Trạng thái recon** | `⬜ Chưa khảo sát` · `🟨 Đang khảo sát` · `✅ Đã có tài liệu` · `⏸️ Hoãn` · `⚪ Chưa implement` — module do `/discover-system` phát hiện vào danh mục ngay ở mức ⬜, chưa cần có tài liệu |
| **Danh sách prefix đã chiếm** | Module mới **phải** chọn prefix chưa có trong danh sách — chống trùng mã giữa các module |
| **2. Trạng thái REQ toàn hệ thống** | Tổng hợp 🟢/🟡/🔴/⚪ theo từng module |
| **3. Ambiguity 🔴 High còn treo** | Danh sách chặn tiến độ, gom từ mọi module — để đưa PO một lần thay vì hỏi lẻ tẻ |
| **4. Cấu trúc thư mục chuẩn** | Copy từ mục 5.3 |
| **5. Quy trình sử dụng** | Bảng: tình huống → workflow → ghi vào đâu |
| **6. Nhật ký danh mục** | Thay đổi cấp cấu trúc (thêm module, đổi layout) |

**Ba việc file này làm được mà thư mục không làm được:**
1. Đọc **một file** là nắm toàn cảnh, không phải quét thư mục rồi mở từng tài liệu
2. **Chống trùng prefix** giữa các module
3. Gom ambiguity 🔴 High của mọi module về một chỗ — thấy ngay vấn đề lặp lại (VD: cả 3 module đều thiếu tài khoản role thấp)

### 5.8. Tầng khám phá — `docs/requirements/_discovery/`

Skill này làm việc ở **cấp module**: đã biết module tên gì, ở đâu, thì recon và sinh REQ. Nhưng với hệ thống **không có tài liệu**, câu hỏi đầu tiên lại là *"hệ thống này có những module nào?"* — đó là việc của tầng khám phá, do workflow `/discover-system` đảm nhiệm.

```
docs/requirements/
├── README.md              ← danh mục (5.7) — do /discover-system khởi tạo
├── _discovery/            ← TẦNG KHÁM PHÁ — cấp hệ thống
│   ├── system_map.md      ← INDEX BẤT BIẾN — bản đồ module · entity · phụ thuộc · risk (web + mobile)
│   ├── api_map.md         ← INDEX BẤT BIẾN của mặt API — khi hệ thống có spec API (xem 5.8.2)
│   ├── modules/           ← chỉ khi > 8 module (xem 5.8.1)
│   │   └── module_NN_<slug>.md
│   ├── doc_inventory.md   ← bản đồ phủ tài liệu (khi QA có đưa tài liệu)
│   ├── sources/           ← bản gốc tài liệu QA cung cấp · snapshot spec API
│   └── evidence/          ← 1 ảnh tổng quan mỗi module (mỗi nền tảng)
└── <module>/              ← TẦNG MODULE — skill này làm việc ở đây
```

> Hệ thống **chỉ có API** → không có `system_map.md`, điểm vào tầng khám phá là `api_map.md`. Hệ thống có cả UI lẫn API → **cả hai file**, và bảng module của `system_map.md` là nơi duy nhất ghép prefix ↔ tag API (cột `Nền tảng`).

**Phân vai — không được lấn:**

| | Tầng khám phá (`/discover-system`) | Tầng module (skill này) |
|---|---|---|
| Đơn vị làm việc | Cả hệ thống | Một module |
| Cấp mã | **Prefix** (`CUST`) | **Số REQ** (`REQ-CUST-01`) |
| Độ sâu | Module tồn tại · loại màn hình · có CRUD không | Từng field · từng rule · từng message |
| Evidence | 1 ảnh/module, chứng minh module có thật | Chuẩn đầy đủ mục 7.2.1 |
| Đầu ra | `_discovery/` + `README.md` | `<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` |

> ❌ Tầng khám phá **không được** sinh mã `REQ-XXX-NN`. Mã REQ là bất biến (mục 2); cấp mã khi chưa mở form, chưa trigger validation thì chắc chắn phải đánh lại số — đúng thứ mục 2.1 cấm.

**Cách skill này dùng tầng khám phá — làm ở đầu mỗi lần recon module:**

1. Có `_discovery/system_map.md` → đọc phần của module sắp recon: route (web) · đường đi màn hình (mobile) · loại màn hình · số tab · risk · vùng chưa xác minh. Tiết kiệm được toàn bộ bước dò đường
2. Có `_discovery/doc_inventory.md` → lấy Bản đồ phủ tài liệu của module, chi tiết hoá xuống cấp vùng chức năng theo mục **3.3.1**
2b. Có `_discovery/api_map.md` → lấy danh mục operation, ma trận auth, phát hiện `F-nn` của module; đường dẫn snapshot spec để trích schema
3. Prefix **lấy từ danh mục**, không tự đặt lại — kể cả khi thấy prefix cũ đặt chưa hay
4. Recon xong → cập nhật cột `Trạng thái recon` trong `README.md` sang ✅, và ghi 1 dòng vào Nhật ký khám phá của `system_map.md` nếu phát hiện lệch so với bản đồ

**Không có `_discovery/` thì sao?** Vẫn recon module bình thường — tầng khám phá là bước tăng tốc, không phải điều kiện bắt buộc. Nhưng nếu user hỏi *"hệ thống có gì"* thay vì *"module X có gì"* → **route sang `/discover-system`**, đừng tự crawl rồi sinh REQ lẫn lộn hai tầng.

#### 5.8.1. Bản đồ khám phá bị tách file — cách đọc

Hệ thống > 8 module thì `/discover-system` tách bản đồ thành nhiều file. Quy tắc đọc **giống hệt** hợp đồng ở mục 5.5:

- **Điểm vào luôn là `docs/requirements/_discovery/system_map.md`** — tên bất biến, dù tách hay không
- Index có mục `## Bản đồ tài liệu` → đọc tiếp file trong `modules/` để lấy chi tiết module cần recon. Không có mục đó → hiểu là bản đồ 1 file
- **Một file `modules/module_NN_<slug>.md` có thể chứa nhiều module** khi chúng quan hệ chặt (VD `module_01_dang_nhap_phan_quyen.md` chứa cả `LOGIN` · `USER` · `ROLE`)

⚠️ **Gộp file KHÔNG gộp prefix, cũng KHÔNG gộp tài liệu requirements.** Ba module nằm chung một file khám phá vẫn sinh ra **ba** thư mục và **ba** file `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` riêng ở tầng module. Bản đồ khám phá gộp là để **đọc cho gọn**; ranh giới truy vết vẫn là **prefix**, không phải file.

| | Tầng khám phá | Tầng module |
|---|---|---|
| `LOGIN` · `USER` · `ROLE` | 1 file `module_01_dang_nhap_phan_quyen.md` | 3 file `login/REQUIREMENTS_LOGIN_SUMMARY.md` · `user/…` · `role/…` |

Bản đồ khám phá **không mang mã REQ** (mục 5.8), nên tách/gộp lại về sau là thao tác an toàn — khác hẳn tài liệu requirements, nơi REQ ID bất biến ràng buộc mọi thứ.

#### 5.8.2. `api_map.md` — bản đồ mặt API

**Nguồn duy nhất** cho nội dung file này — `/discover-system` (nhánh API) và `/generate-testcases-api` (khi chưa có bản đồ) đều ghi theo đúng mẫu dưới. Tên file **bất biến**, cùng thư mục với `system_map.md`.

| # | Mục | Nội dung |
|---|---|---|
| 0 | Bảng metadata | Tên hệ thống · loại (`chỉ API` / `mặt API của hệ thống có UI`) · phiên bản đặc tả + `info.version` · **URL nguồn spec** + ngày tải + đường dẫn snapshot · môi trường đã gọi thử · tổng số operation · phương pháp (`chỉ đọc spec` / `spec + N request gọi thật`) |
| 1 | Bảng module & prefix | Prefix · tag/folder nguồn · số operation · số 🌐 công khai · số 🔒 cần token · module UI tương ứng (nếu có — 2.2) · dải REQ · dải TC ID |
| 2 | Danh mục operation | Theo từng module: `Method · Path · Auth (theo từng operation — 3.4.3) · Status khai trong spec · Mô tả` |
| 3 | Kết quả kiểm chứng | Phát hiện `F-nn` mức 🔴/🟠/🟡 kèm request + status + trích body **đã che** — và cả những chỗ hệ thống làm đúng |
| 4 | Ambiguity | Thứ spec không trả lời được: mô hình phân quyền · ràng buộc nghiệp vụ · rate limit · giới hạn upload |
| 5 | Ghi chú kỹ thuật cho automation | Schema rỗng · nhiều content-type · token ở cookie hay header · dữ liệu rác có sẵn trên môi trường |
| 6 | Nhật ký khám phá + **Sự cố** | Một dòng mỗi lần chạy (kèm `sha256` snapshot); mục Sự cố nếu lỡ đụng dữ liệu thật (3.4.4) |

❌ **Không mã `REQ-XXX-NN` nào** trong file này — cùng luật tầng khám phá ở 5.8.
