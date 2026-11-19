### 3.3.1. Tài liệu bán phần — chia vùng trước khi recon

Tình huống thực tế phổ biến nhất: QA đưa được **một phần** tài liệu (spec của 2/8 màn hình, file Excel chỉ có danh sách field, mockup cũ 6 tháng trước), phần còn lại phải tự khám phá.

Sai lầm hay gặp là xử lý cả module theo **một** cách: hoặc tin tài liệu rồi recon qua loa, hoặc bỏ tài liệu rồi recon lại từ đầu. Cả hai đều tốn công và đều sai.

**Bước 1 — Lập Bản đồ phủ tài liệu cho module, TRƯỚC khi mở browser:**

| Vùng chức năng | Tài liệu phủ | Mức phủ | Chiến lược recon |
|---|---|---|---|
| Form tạo mới | `field_spec.xlsx` sheet "Customer" dòng 3–28 | 🟩 Đầy đủ | **Đối chiếu** — mở form kiểm từng dòng spec, tìm lệch |
| Danh sách & lọc | Mockup `list_v1.png` (2026-02) | ⚠️ Nghi lỗi thời | **UI thắng** — recon đầy đủ, mọi lệch ghi `AMB` |
| Phân quyền | — | ⬜ Trắng | **Recon đầy đủ** như mode UI thuần |
| Import Excel | Ticket ABC-12 mô tả 3 dòng | 🟨 Một phần | **Bổ khuyết** — tài liệu cho luồng chính, recon lấy validation + error |

**Bước 2 — Recon theo đúng chiến lược từng vùng:**

| Mức phủ | Việc phải làm | Việc được rút gọn |
|---|---|---|
| 🟩 **Đầy đủ** | Mở màn hình, kiểm **từng** rule tài liệu nêu có đúng trên UI không. Lệch → `AMB` | Không cần dò lại từ đầu những rule đã ghi rõ và đã khớp |
| 🟨 **Một phần** | Recon **đầy đủ** phần tài liệu không nói (thường là: validation message, edge case, phân quyền) | Phần tài liệu đã nêu rõ và khớp UI → trích dẫn, không mô tả lại |
| ⬜ **Trắng** | Recon đầy đủ 9 bước mục 3.1 | Không rút gọn gì |
| ⚠️ **Nghi lỗi thời** | Recon đầy đủ như ⬜. Tài liệu chỉ dùng làm **danh sách câu hỏi**: "chỗ này tài liệu nói X, thực tế thế nào?" | Không rút gọn gì |

**Bước 3 — Ghi nguồn phân biệt được 4 mức** (cột `Nguồn` của mỗi REQ):

| Giá trị cột `Nguồn` | Nghĩa |
|---|---|
| `Tài liệu · <file> · <vị trí>` | Chỉ có trong tài liệu, **chưa** mở UI kiểm |
| `Tài liệu + kiểm chứng thực tế` | Tài liệu nêu, đã mở UI xác nhận khớp — **mức tin cậy cao nhất** |
| `UI thực tế` / `Kiểm chứng thực tế` | Chỉ có ở UI, tài liệu không nói |
| `API · <method> <endpoint>` | Lấy từ tầng network (mục 3.1.1) |

**Luật cứng của nhánh này:**
- ❌ **Không** dùng tài liệu bán phần để suy ra vùng nó không phủ. Spec form tạo mới **không** nói gì về form sửa — dù hai form nhìn giống nhau
- ❌ Vùng ⬜ Trắng **không** được rút gọn recon với lý do "module này chắc giống module kia"
- ✅ **Bản đồ phủ tài liệu phải nằm trong tài liệu đầu ra** (một mục ngay sau Tổng quan) — người đọc cần biết phần nào tin được từ spec, phần nào do agent quan sát
- ✅ Tài liệu ⚠️ nghi lỗi thời mà **khớp** UI → nâng lên `Tài liệu + kiểm chứng thực tế`; **lệch** → `AMB-<MODULE>-XX` kèm nguyên văn cả hai bên
- ✅ Khi `/discover-system` đã chạy: đọc `docs/requirements/_discovery/doc_inventory.md` — Bản đồ phủ tài liệu cấp hệ thống đã có sẵn ở đó, chỉ cần chi tiết hoá xuống cấp vùng chức năng
