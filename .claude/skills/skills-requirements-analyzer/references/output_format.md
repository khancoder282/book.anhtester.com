## 6. Cấu trúc Tài liệu Yêu cầu Đầu ra (Output Format)

> ### ⚠️ Phạm vi áp dụng — đọc trước khi dùng mục này
>
> Skill có **3 template đầu ra khác nhau** tuỳ workflow. Chọn đúng một cái, không trộn:
>
> | Workflow | Template dùng | Ghi chú |
> |---|---|---|
> | `/generate-requirements-from-website` | **Mục 6 này** — tài liệu đặc tả module | Đầu ra là `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` |
> | `/generate-requirements-from-mobile` | **Mục 6 này** + khác biệt ở **3.5** (metadata `Thiết bị khảo sát`, mục Yêu cầu riêng của mobile) | Đầu ra là `mobile/requirements_<module>_mobile.md` + index `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` — cùng thư mục module với web/API (2.2, 5.3) |
> | `/generate-requirements-from-api` | **Mục 6 này** + bảng thay đổi ở **3.4.7** | Đầu ra là `api/requirements_<module>_api.md` + index `REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` — cùng thư mục module với web/mobile (2.2, 5.3) |
> | `/analyze-requirement-document` | **Template 10 mục của chính workflow đó** | Đầu ra là `analysis_<TICKET-ID>.md` — tài liệu phân tích ticket, KHÁC tài liệu đặc tả module |
> | `/discover-system` | **Template của chính workflow đó** (Bước 6) + `api_map.md` theo **5.8.2** | Đầu ra là `_discovery/system_map.md` / `api_map.md` + `README.md` — cấp hệ thống, **KHÔNG có mã REQ**. Xem mục **5.8** |
>
> Nhánh `/analyze-requirement-document` chỉ **mượn** từ skill các mục: **2 + 2.1** (đánh mã), **3.2** (quy trình trích xuất), **4 + 4.3** (AMB/RISK + Cổng Tự Soát REQ), **5** (scaling), **7.1 + 7.3** (strict rules) — **KHÔNG** dùng cấu trúc mục 6.
>
> ⚠️ **Mục 4.3 áp cho MỌI nhánh sinh REQ, không có ngoại lệ.** REQ sinh từ tài liệu cũng lệch tên/AC, cũng gộp nhiều rule vào một mã, cũng chép giá trị biến thiên — y hệt REQ sinh từ UI.
>
> Nhánh `/discover-system` mượn: **2 + 2.2** (quy ước prefix, chung prefix đa nền tảng), **3.1 + 3.1.1** (crawl UI web + network), **3.1.2** (phân quyền sơ bộ), **3.4.1 → 3.4.4** (mặt API), **3.5.1 + 3.5.2** (mặt mobile), **5.3 + 5.7 + 5.8** (thư mục, danh mục, tầng khám phá), **7.1 + 7.2 + 7.2.1** (và 7.4 / 7.5 theo mặt đang khám phá) — **KHÔNG** dùng mục 6 và **KHÔNG** cấp số REQ. Không sinh REQ nên không chạy 4.3, nhưng **vẫn phải** theo luật evidence (7.2.1) và luật cấm ghi giá trị bí mật (7.1).
>
> Riêng 2 dòng metadata `Dải mã đã dùng` / `Mã kế tiếp` ở mục 6.1 là **bắt buộc với cả hai template**, vì quy tắc nối tiếp mã (2.1) cần chúng để hoạt động.

Tài liệu format Markdown, lưu artifact (`REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md`). **Nội dung bắt buộc:**

### 6.1. Bảng metadata + Tổng quan (Overview)

Mở đầu tài liệu bằng bảng metadata, trong đó **BẮT BUỘC** có 2 dòng phục vụ quy tắc nối tiếp mã (mục 2.1):

```markdown
| **Dải mã đã dùng** | `REQ-PRJ-01` → `REQ-PRJ-65` · `AMB-PRJ-01` → `AMB-PRJ-12` · `RISK-PRJ-01` → `RISK-PRJ-12` |
| **Mã kế tiếp**     | Đợt phân tích sau bắt đầu từ `REQ-PRJ-66` · `AMB-PRJ-13` · `RISK-PRJ-13` — **KHÔNG đánh lại từ 01** |
```

Với **nhánh UI Recon**, bảng metadata còn **BẮT BUỘC** thêm một dòng nữa:

```markdown
| **Trình duyệt khảo sát** | Google Chrome (Playwright MCP), viewport `1600×750`. Mọi AC dựa trên thông báo mặc định của trình duyệt **chỉ đúng với trình duyệt này** |
```

Thiếu dòng này thì không ai biết AC nào phụ thuộc trình duyệt, và mọi kết luận về hiển thị/responsive mất ngữ cảnh viewport — xem mục **4.3.6** và **4.3.5**.

Nhánh khác thay dòng này bằng: **Mobile** → `Thiết bị khảo sát` + `Tầng network` (3.5.1) · **API** → `Nguồn spec` + `Môi trường gọi thử` (3.4.7). Các dòng khảo sát này nằm ở **file nền tảng** (5.3); index chỉ giữ dòng `Nền tảng` liệt kê nền tảng module có kèm trạng thái khảo sát từng nền tảng (2.2).

Sau bảng metadata: mô tả tóm tắt tính năng, mục đích, phạm vi module (trong phạm vi / ngoài phạm vi).

### 6.2. Yêu cầu Chức năng (Functional Requirements) — CÓ MÃ REQ
Chia thành User Stories / Use Cases, **mỗi yêu cầu 1 dòng trong bảng có mã**:

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-01 | Đăng nhập bằng email | Là người dùng, tôi muốn... | Nhập đúng email+password → vào Dashboard | 🟢 | — | UI thực tế / AC#1 |
| REQ-LOGIN-02 | Khóa account sau 5 lần sai | ... | ... | 🟡 | 10-08-2026 · ABC-123 | AC#3 |

**Bảng mã trạng thái REQ:**

| Ký hiệu | Nghĩa | Hệ quả với test case |
|---|---|---|
| 🟢 | **Active** — đang hiệu lực, chưa từng sửa | TC giữ nguyên |
| 🟡 | **Changed** — đã bị ticket sau sửa nội dung | ⚠️ TC map vào REQ này **phải review lại** |
| 🔴 | **Deprecated** — tính năng đã bị gỡ bỏ | TC map vào REQ này **đổi sang 🗑️ Deprecated** (không xoá dòng TC). KHÔNG xoá dòng REQ, chỉ đổi trạng thái |
| ⚪ | **Chưa implement** — tài liệu có, hệ thống chưa build | TC viết trước, đánh dấu `skip` cho tới khi build xong |

**Quy tắc:**
- Cột **`Nền tảng`** đặt ngay sau `Tên yêu cầu` — **bắt buộc** ở bảng REQ của index và của file `mobile/` (mục 2.2, 5.3). Message khác nhau giữa nền tảng thì mỗi nền tảng ghi ở file của nó, **nguyên văn**, kèm `AMB-<MODULE>-XX` nếu khác biệt không rõ chủ đích
- Mặc định mọi REQ mới là 🟢, cột `Cập nhật lần cuối` để `—`
- Trạng thái ≠ 🟢 thì **BẮT BUỘC** có dòng tương ứng trong Nhật ký thay đổi (mục 6.9) — hai nơi này phải khớp nhau
- **KHÔNG BAO GIỜ xoá dòng REQ** khỏi tài liệu, kể cả khi tính năng bị gỡ. Xoá dòng là mất dấu vết, và mã REQ đó cũng không được tái sử dụng (mục 2.1)
- Với tài liệu **đã phát hành trước khi có schema này**: không cần sửa lại toàn bộ dòng. Ghi một dòng quy ước dưới bảng — *"REQ không ghi trạng thái = 🟢 Active"* — rồi chỉ đánh dấu những REQ thực sự thay đổi về sau

### 6.3. Đặc tả Trường Dữ liệu (Field Specifications)
Bảng chi tiết từng field — phần cốt lõi cho Tester:

| Field (Label) | Loại UI | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|

### 6.4. Business Rules & Validation Messages
| REQ ID | Rule / Trigger | Thông báo lỗi mong đợi (nguyên văn) |
|---|---|---|

### 6.5. Ma trận Phân quyền (nếu có nhiều role)

| Hành động | Admin | Manager | Staff | Guest |
|---|---|---|---|---|
| Xem danh sách | ✅ | ✅ | ⚠️✅ | ❌ |
| Xóa bản ghi | ✅ | ⚠️❌ | ❔ | ❌ |

**Ký hiệu mức bằng chứng** (mục 3.1.2) — bắt buộc dùng khi không đủ account cho mọi role:

| Ký hiệu | Nghĩa |
|---|---|
| `✅` / `❌` | **Đã kiểm chứng** — đăng nhập đúng role và thử thật |
| `⚠️✅` / `⚠️❌` | **Suy từ cấu hình** — đọc từ màn hình phân quyền của hệ thống, chưa đăng nhập thử |
| `❔` | **Chưa có căn cứ** — bắt buộc kèm `AMB-<MODULE>-XX` 🔴 |

**Dòng tổng bắt buộc đặt ngay dưới bảng:**
```
Tổng 21 ô = Đã kiểm chứng 13 · Suy diễn 0 · Chưa rõ 7 · Không áp dụng 1
Ô "không áp dụng" là [<hành động> × <role>] — <lý do>. Role Staff/Guest chưa có account (AMB-PRJ-07)
```

Không có dòng tổng thì người đọc không biết ma trận này tin được bao nhiêu phần. Ô `❔` **không được** làm tròn thành `❌`.

⚠️ **Các nhóm phải cộng lại đúng bằng `số hàng × số cột`.** Ô đánh `—` (không áp dụng) cũng là một nhóm phải đếm và **phải giải thích lý do** — bỏ nó ra ngoài khiến tổng không khớp, và người đọc không phân biệt được "đã cân nhắc, không liên quan" với "quên mất".

### 6.5.1. Bản đồ phủ tài liệu — bắt buộc khi có tài liệu bán phần (mục 3.3.1)

Đặt ngay sau Tổng quan (6.1). Người đọc phải biết phần nào tin được từ spec, phần nào do agent quan sát:

| Vùng chức năng | Tài liệu phủ | Mức phủ | REQ liên quan |
|---|---|---|---|
| Form tạo mới | `field_spec.xlsx` sheet "Customer" dòng 3–28 | 🟩 Đầy đủ | REQ-CUST-01 → 14 |
| Phân quyền | — | ⬜ Trắng | REQ-CUST-30 → 33 |

Module không có tài liệu nào → ghi một dòng: *"Không có tài liệu — toàn bộ REQ sinh từ khảo sát UI thực tế"*. **KHÔNG** bỏ hẳn mục.

### 6.6. Ma trận Trạng thái (nếu entity có status flow)
| Trạng thái hiện tại | Hành động cho phép | Trạng thái kế tiếp | Ai được thực hiện |
|---|---|---|---|

### 6.7. Điểm Mơ Hồ & Rủi Ro

**Bảng Ambiguities** — có vòng đời, không phải danh sách tĩnh:

| Mã | Câu hỏi | Nguy cơ | Mức độ | Assumption tạm | Trạng thái | Kết luận |
|---|---|---|---|---|---|---|
| AMB-PRJ-04 | Visible Tabs vs quyền khách hàng, cái nào ưu tiên? | ... | 🔴 | Visible Tabs thắng | ❓ Chờ trả lời | — |
| AMB-PRJ-02 | Deadline có được sớm hơn Start Date? | ... | 🔴 | Không validate | ✅ Đã trả lời 10-08-2026 | PO xác nhận là lỗi → sinh REQ-PRJ-79 |

**Bảng mã trạng thái AMB:**

| Ký hiệu | Nghĩa | Hành động tiếp theo |
|---|---|---|
| ❓ | **Chờ trả lời** — đã gửi PO/BA, chưa có phản hồi | Test theo Assumption tạm, gắn nhãn `assumption-based` |
| ✅ | **Đã trả lời** — ghi ngày + kết luận | Nếu kết luận sinh yêu cầu mới → cấp REQ mới và ghi Nhật ký. Nếu khác Assumption tạm → **TC đang dựa trên giả định phải sửa** |
| ⏭️ | **Bỏ qua** — PO xác nhận không cần làm rõ ở giai đoạn này | Ghi rõ lý do; test theo Assumption tạm và chấp nhận rủi ro |

> AMB đã ✅ hoặc ⏭️ **không được xoá khỏi bảng** — giữ lại để biết quyết định đến từ đâu.

**Bảng Risks:** `RISK-<MODULE>-XX | Rủi ro | Mô tả | Mitigation`

### 6.8. Phân rã Epic / Story (Backlog View) — bắt buộc khi ≥ 25 REQ

Chiếu toàn bộ REQ sang cấu trúc backlog để chia việc, **không thay thế** các mục trên:

| Story ID | Tên Story | REQ bao phủ | Số REQ | AMB / RISK liên quan | Ghi chú phạm vi |
|---|---|---|---|---|---|
| STORY-PRJ-01 | Danh sách & lọc | REQ-PRJ-01 → REQ-PRJ-13 | 13 | RISK-PRJ-05 | ... |

Kèm theo bảng trên, **BẮT BUỘC** có đủ 4 phần:
1. **Dòng tổng kiểm chứng:** `Tổng: N Story / M REQ — mọi REQ thuộc đúng một Story, không mồ côi, không trùng`, kèm phép cộng hiện rõ (`7+5+7+6+6+9 = 40 ✔`)
2. **Bảng đối chiếu AMB/RISK:** **mọi** mã AMB và RISK phải xuất hiện ở đúng một trong hai chỗ — gắn vào một Story, hoặc nằm trong Hạng mục cấp Epic. Trình bày thành bảng để tự kiểm:

   | Nhóm | Mã | Nằm ở đâu |
   |---|---|---|
   | AMB thuộc Story | AMB-PRJ-02…17 | phân bổ ở bảng Story |
   | AMB cấp Epic | AMB-PRJ-01 | Ma trận Phân quyền |
   | RISK thuộc Story | RISK-PRJ-01…05, 07 | phân bổ ở bảng Story |
   | RISK cấp Epic | RISK-PRJ-06 | rủi ro mức module |

   Mã không xuất hiện ở đâu cả = **không ai chịu trách nhiệm xử lý**. Đây là lỗi hay bị bỏ sót vì bảng Story chỉ được kiểm tổng REQ, không kiểm tổng AMB/RISK.
3. **Hạng mục cấp Epic:** liệt kê những phần cắt ngang cố ý không gán vào Story nào (ma trận phân quyền, ma trận trạng thái, NFR, RISK mức module…) **kèm lý do**
4. **Thứ tự triển khai đề xuất:** xếp theo phụ thuộc và rủi ro, **không** theo thứ tự đánh số. Đánh dấu rõ Story nào đang `BLOCKED` bởi AMB nào

### 6.9. Nhật ký Thay đổi (Changelog) — BẮT BUỘC ở mọi tài liệu module

Đây là **bộ nhớ liền mạch** của tài liệu. Module đang phát triển thì ticket sẽ liên tục sửa/bổ sung yêu cầu; mục này ghi lại toàn bộ đường đi để bất kỳ ai (hoặc AI ở phiên làm việc mới) đọc một lần là nắm đủ bối cảnh.

Đặt ở **cuối tài liệu**, thứ tự **mới nhất lên trên**:

| Ngày | Nguồn | REQ ảnh hưởng | Loại | Tóm tắt thay đổi | TC cần xử lý |
|---|---|---|---|---|---|
| 15-08-2026 | ABC-140 | REQ-PRJ-58 → 62 | 🔴 Bỏ | Gỡ chức năng Copy Project khỏi phạm vi | TC-PRJ-31 → 🗑️ Deprecated |
| 10-08-2026 | ABC-123 | REQ-PRJ-42 | 🟡 Sửa | Deadline chuyển thành bắt buộc phải sau Start Date | TC-PRJ-18, TC-PRJ-19 → review |
| 10-08-2026 | ABC-123 | REQ-PRJ-79 | 🟢 Thêm | Bổ sung field Priority cho dự án | — (viết TC mới) |
| 02-08-2026 | UI recon | REQ-PRJ-01 → 65 | 🟢 Thêm | Khởi tạo tài liệu từ khảo sát UI thực tế | — |

**Quy tắc ghi Nhật ký:**
- **Mọi** thay đổi đều phải có dòng — kể cả khi chỉ sửa câu chữ mà không đổi hành vi (ghi loại `✏️ Biên tập`)
- Cột `Nguồn` ghi ticket ID hoặc `UI recon` — phải truy được về đợt phân tích nào
- Cột `TC cần xử lý` là **mắt xích cảnh báo** cho tester: `review` / `deprecated` / `viết mới`. Không biết TC nào bị ảnh hưởng thì ghi `⚠️ chưa rà soát`
- Dòng đầu tiên luôn là dòng khởi tạo tài liệu
- Nhật ký **chỉ nằm ở file index** khi tài liệu bị tách nhiều file (mục 5.3)

**Đồng bộ 3 nơi — kiểm tra trước khi bàn giao:**

```
Nhật ký (6.9)  ←→  Trạng thái REQ (6.2)  ←→  Dải mã metadata (6.1)
```
- REQ nào có trạng thái 🟡/🔴 thì phải có dòng Nhật ký tương ứng, và ngược lại
- REQ mới thêm phải nằm trong dải `Mã kế tiếp` đã công bố, và dòng `Dải mã đã dùng` phải được cập nhật

> Mục 6.5 / 6.6 ghi "Không áp dụng" nếu module không có phân quyền/trạng thái — KHÔNG được bỏ hẳn mục, để người đọc biết đã cân nhắc.
