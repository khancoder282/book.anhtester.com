### Bước 6: Ghi file đầu ra

Sau khi user chốt, ghi đúng 3 nhóm file:

```
docs/requirements/
├── README.md                          ← DANH MỤC — tạo mới hoặc BỔ SUNG dòng
└── _discovery/
    ├── system_map.md                  ← INDEX — TÊN FILE BẤT BIẾN (mặt web + mobile)
    ├── api_map.md                     ← INDEX mặt API — TÊN FILE BẤT BIẾN, mẫu ở skill 5.8.2
    ├── modules/                        ← chỉ khi tách (ngưỡng 6.2)
    │   ├── module_01_dang_nhap_phan_quyen.md
    │   └── module_02_khach_hang.md
    ├── doc_inventory.md               ← chỉ mode HYBRID/DOC — bản đồ phủ tài liệu
    ├── sources/                       ← bản gốc tài liệu QA cung cấp · openapi_<ngày>.json · postman_<ngày>.json
    └── evidence/
        ├── <module>_overview_fullpage.png          ← web
        └── <android|ios>_<module>_overview.png     ← mobile
```

| Hệ thống có | Ghi file nào |
|---|---|
| Chỉ web / web + mobile | `system_map.md` |
| Chỉ API | `api_map.md` — là **điểm vào duy nhất**, không tạo `system_map.md` rỗng |
| UI (web/mobile) + API | **Cả hai**. Bảng module của `system_map.md` là nơi **duy nhất** ghi ghép prefix ↔ tag API (cột `Nền tảng`); `api_map.md` tham chiếu ngược, không nhân bản |

**6.1 — Ngưỡng tách file bản đồ** (đếm số module **sau khi** user chốt ở Bước 5):

| Số module | Cấu trúc |
|---|---|
| **≤ 8** | 1 file `system_map.md` — đủ ngắn để đọc một lượt |
| **> 8** | Tách: `system_map.md` (index) + `modules/module_NN_<slug>.md` |

Tách ngay kể cả khi ≤ 8 module, nếu gặp **bất kỳ** dấu hiệu:
- Có module ≥ 5 tab con hoặc ≥ 30 field — mô tả riêng nó đã dài hơn cả phần còn lại
- Hệ thống chia theo **phân hệ** rõ rệt (Bán hàng · Kho · Kế toán) — tách theo phân hệ đọc dễ hơn hẳn
- Nhiều người cùng khảo sát song song — mỗi người một file, tránh đụng nhau khi commit

**6.2 — `docs/requirements/README.md`** theo schema skill mục 5.7.2, bảng danh mục **thêm 2 cột** phục vụ khám phá:

| Module | Prefix | Nền tảng | Trạng thái recon | Mức phủ tài liệu | Tài liệu | REQ đã dùng | Mã kế tiếp | AMB treo | Cập nhật |
|---|---|---|---|---|---|---|---|---|---|
| Khách hàng | `CUST` | Web ⬜ · Android ⬜ · API ⬜ | ⬜ Chưa khảo sát | 🟨 Một phần | — | — | `REQ-CUST-01` | — | 10-08-2026 |
| Đăng nhập | `LOGIN` | Web ✅ · Android ⬜ | 🟨 Đang khảo sát | 🟩 Đầy đủ | `login/REQUIREMENTS_LOGIN_SUMMARY.md` | 01 → 14 | `REQ-LOGIN-15` | AMB-LOGIN-02 | 11-08-2026 |

Cột `Nền tảng` mang dấu trạng thái **riêng từng mặt** — `Trạng thái recon` tổng chỉ ✅ khi **mọi** mặt đã ✅ (hoặc ⏸️ hoãn có lý do). Hệ thống chỉ một mặt → có thể bỏ cột (skill 5.7.2).

**Bảng mã trạng thái recon:**

| Ký hiệu | Nghĩa | Hành động tiếp theo |
|---|---|---|
| ⬜ | **Chưa khảo sát** — mới chỉ phát hiện tên | Chạy `/generate-requirements-from-website` |
| 🟨 | **Đang khảo sát** — recon dở dang | Tiếp tục, nêu rõ đang dở ở đâu |
| ✅ | **Đã có tài liệu** — `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` đã phát hành | Sẵn sàng sinh test case |
| ⏸️ | **Hoãn** — user chốt ngoài phạm vi đợt này | Ghi lý do, giữ prefix |
| ⚪ | **Chưa implement** — phát hiện qua tài liệu/API, UI chưa có | Không recon được; viết TC trước, đánh `skip` |

**6.3 — Phân chia nội dung giữa index và file module (quy tắc cứng)**

Nguyên tắc: **cái gì cắt ngang nhiều module thì ở index, cái gì thuộc riêng một module thì ra file module.** Nhân bản nội dung cắt ngang vào từng file là lỗi — sửa một chỗ quên chỗ kia.

| Mục | Đặt ở đâu | Lý do |
|---|---|---|
| 1. Bối cảnh khảo sát — ngày · mode · URL · role đã dùng · môi trường dùng chung · phạm vi crawl | **Index** | Áp cho cả đợt khảo sát |
| 2. Sơ đồ điều hướng toàn hệ thống — cây menu nguyên trạng kèm route | **Index** | Chỉ có nghĩa khi nhìn tổng thể |
| 3. **Bảng module tổng** — tên UI · bí danh (kể cả tên trên app, tên tag API) · prefix · **nền tảng** · file khám phá · loại màn hình · risk · ước REQ | **Index** | Bản đồ điều hướng, thay cho việc mở từng file |
| 2b. Sơ đồ điều hướng **app mobile** — cây tab/drawer kèm đường đi, deep link, mỗi nền tảng một cây | **Index** | Cùng lý do mục 2 |
| 4. Bản đồ entity & phụ thuộc | **Index** | Bản chất là quan hệ **giữa** các module |
| 5. Ma trận phân quyền **sơ bộ** cấp module | **Index** | Cắt ngang mọi module |
| 6. Thứ tự khảo sát đã chốt + module `BLOCKED` | **Index** | Kế hoạch cấp đợt |
| 7. Nhật ký khám phá | **Index** | Một dòng cho mỗi lần chạy `/discover-system` |
| **Bản đồ tài liệu** (khi tách) | **Index** | Xem 6.3 — bắt buộc |
| Chi tiết từng module — route · loại màn hình · CRUD · status flow · số tab · số field ước lượng · risk kèm lý do | **File module** | Đơn vị chia việc |
| Phát hiện tầng network **của riêng module** — endpoint · field ẩn · enum trạng thái | **File module** | Gắn với module đó |
| Vùng chưa xác minh **của riêng module** | **File module** | Người nhận module đó cần biết |
| Link evidence của module | **File module** | Đi cùng mô tả |

> Phát hiện network **cấp hệ thống** (endpoint không thuộc module nào, ranh giới entity) vẫn ở **index** mục 4.

**6.4 — Hợp đồng đọc: index bất biến + Bản đồ tài liệu**

Giống nguyên tắc `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` ở skill mục 5.5 — workflow phía sau chỉ cần biết **một** đường dẫn:

```
docs/requirements/_discovery/system_map.md
```

Bất kể có tách hay không. Khi tách, index **BẮT BUỘC** có mục:

```markdown
## Bản đồ tài liệu
| File | Module bao phủ | Prefix | Trạng thái recon |
|---|---|---|---|
| [modules/module_01_dang_nhap_phan_quyen.md](modules/module_01_dang_nhap_phan_quyen.md) | Đăng nhập · Người dùng · Vai trò | `LOGIN` · `USER` · `ROLE` | ⬜ ⬜ ⬜ |
| [modules/module_02_khach_hang.md](modules/module_02_khach_hang.md) | Khách hàng | `CUST` | ✅ |
```

Không có mục này → workflow sau hiểu là bản đồ 1 file và **sẽ không bao giờ mở thư mục `modules/`**.

**6.5 — Quy tắc đặt tên & gộp module vào chung file**

**Đặt tên:** `module_NN_<slug>.md`
- `NN` — số thứ tự **theo thứ tự khảo sát đã chốt** ở Bước 5, không theo alphabet
- `<slug>` — tiếng Việt **không dấu**, gạch dưới, mô tả nghiệp vụ: `khach_hang`, `du_an_cong_viec`
- File gộp nhiều module → tên phải **nêu được cả nhóm**, không lấy tên module lớn nhất rồi giấu phần còn lại:

| ✅ Đúng | ❌ Sai | Vì sao |
|---|---|---|
| `module_01_dang_nhap_phan_quyen.md` | `module_01_login.md` | File còn chứa Người dùng + Vai trò, tên phải nói ra |
| `module_03_du_an_cong_viec.md` | `module_03_project.md` | Ưu tiên tiếng Việt, và Task bị giấu |
| `module_05_danh_muc_he_thong.md` | `module_05_misc.md` | "misc" không cho biết bên trong có gì |

**Khi nào được gộp** — thoả **ít nhất một**:

| Điều kiện | Ví dụ |
|---|---|
| Quan hệ **cha–con chặt**, con không tồn tại độc lập | `Dự án` ↔ `Công việc` — task luôn thuộc một project |
| **Luôn được khảo sát cùng nhau**, dùng chung màn hình cấu hình | `Đăng nhập` ↔ `Người dùng` ↔ `Vai trò` |
| Nhiều module **nhỏ cùng loại** (mỗi cái 1–2 màn hình tra cứu/cấu hình) | Các trang danh mục: Đơn vị tính · Khu vực · Nguồn khách |
| Cùng **một phân hệ** và số module trong phân hệ ≤ 3 | Kho: `Nhập kho` · `Xuất kho` · `Tồn kho` |

**Khi nào KHÔNG được gộp:**
- ❌ Chỉ vì "nằm cùng menu" — menu là cách trình bày, không phải quan hệ nghiệp vụ
- ❌ Hai module đều 🔴 risk cao — mỗi cái xứng đáng một file để soi kỹ
- ❌ Gộp **quá 3 module** vào một file — quá 3 thì file dài bằng bản đồ chưa tách, tách vô nghĩa
- ❌ Gộp module ⬜ chưa khảo sát với module ✅ đã có tài liệu — hai trạng thái tiến độ khác nhau, khó theo dõi

**Bất biến khi tách/gộp — kiểm trước khi bàn giao:**

- [ ] **Prefix giữ nguyên tuyệt đối** — gộp file **KHÔNG** gộp prefix. 3 module chung một file vẫn là 3 prefix `LOGIN` · `USER` · `ROLE`, và về sau vẫn sinh ra 3 file `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` riêng
- [ ] **Mỗi module thuộc đúng 1 file** — không mồ côi, không nằm ở 2 file
- [ ] **Tổng module trong các file = tổng module ở bảng index** — ghi rõ con số ở index để tự kiểm chứng
- [ ] **Cột `Trạng thái recon` chỉ có ở một nơi** — file `README.md` danh mục. File module ở `_discovery/` **tham chiếu**, không nhân bản (nhân bản là chắc chắn lệch nhau sau vài lần cập nhật)
- [ ] Mỗi file module có link ngược về index; index có link tới mọi file module
- [ ] Nội dung cắt ngang (mục 2 · 4 · 5 · 6) **không** bị chép vào file module

> **Tách/gộp lại về sau là an toàn** — bản đồ khám phá không mang mã REQ (Bước 0), nên chuyển module sang file khác không phá vỡ traceability. Đây chính là lý do tầng khám phá không được cấp số REQ.

**6.6 — `_discovery/doc_inventory.md`** (mode HYBRID/DOC): Bản đồ phủ tài liệu (Bước 2.3) + danh mục file gốc + bảng lệch pha tài liệu ↔ UI (Bước 4.1).
