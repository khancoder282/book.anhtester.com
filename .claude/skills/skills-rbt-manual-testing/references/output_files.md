## Quy Tắc Xuất File & Theo Dõi Tiến Độ (BẮT BUỘC — áp dụng cả 4 modes)

Bộ TC thường dài 70–100+ dòng bảng. In toàn bộ ra chat khiến user phải chờ render lâu và không thấy được tiến độ. Agent **BẮT BUỘC** tuân thủ quy tắc sau.

### 1. Write-first — KHÔNG render bảng TC ra chat

- Agent ghi TC **thẳng vào file** bằng công cụ Write/Edit sau mỗi batch
- **NGHIÊM CẤM** in toàn bộ bảng TC ra chat rồi mới ghi file (user phải chờ 2 lần cho cùng một nội dung)
- Chat **chỉ** hiển thị:
  - Dòng tiến độ ngắn sau mỗi batch: `✅ Batch 2/4 — Validation form (18 TC) → parts/part_01_danh_sach.md`
  - **Bảng Đối Soát Coverage** (tiêu chí 6) ở cuối
  - Tóm tắt: tổng số TC · số file · đường dẫn file · điểm cần user review
- Muốn xem nội dung → user tự mở file. Chỉ trích dẫn tối đa **3–5 dòng TC mẫu** ra chat khi cần minh họa

### 2. Cấu trúc thư mục & ngưỡng tách file

**Test cases tổ chức theo thư mục từng module, bên trong chia tầng nền tảng** (đối xứng với `docs/requirements/` — CLAUDE.md mục 6b):

```
docs/testcases/
├── README.md                                        ← DANH MỤC toàn hệ thống
└── <module>/
    ├── TEST_CASES_<TÊN_MODULE>_SUMMARY.md                       ← INDEX — TÊN FILE BẤT BIẾN · KHÔNG chứa dòng TC
    ├── web/test_cases_<module>_web.md               ← TC chạy trên web
    ├── mobile/test_cases_<module>_mobile.md         ← TC chạy trên app — tag @Android / @iOS
    ├── api/test_cases_<module>_api.md               ← TC gọi API
    ├── <nền-tảng>/parts/part_NN_<nền-tảng>_<slug>.md ← khi file nền tảng vượt ngưỡng
    ├── impact/impact_plan_<TICKET-ID>.md            ← Mode DELTA: kế hoạch sửa theo từng ticket (cấp module)
    ├── impact/delta_tc_<TICKET-ID>.md               ← Mode DELTA: TC đã sửa xong theo nền tảng — input của /update-automation-from-impact
    ├── impact/automation_plan_<TICKET-ID>.md        ← do /update-automation-from-impact ghi — script đã sửa theo ticket
```

**Tầng nền tảng — luật cứng:**

| Quy tắc | Lý do |
|---|---|
| Chỉ 3 thư mục `web/` · `mobile/` · `api/`; Android và iOS chung `mobile/`, phân biệt bằng tag `@Android` / `@iOS` | Thêm thư mục `android/`, `ios/` là tách đôi dải TC của cùng một màn hình |
| **Luôn có tầng nền tảng**, kể cả module chỉ có một nền tảng | Thêm nền tảng thứ hai về sau không phải di chuyển file — di chuyển là gãy link từ execution report và bug |
| Mỗi TC nằm ở **đúng một** file nền tảng — TC là thứ được **chạy**, và mỗi lần chạy thuộc một nền tảng | Không có "TC dùng chung"; REQ dùng chung thì mỗi nền tảng một TC, cùng `REQ ID` |
| **Dải TC ID chung toàn module**, đánh tiếp qua mọi file nền tảng | `CRM_CUST_TC_041` là duy nhất trong module dù nằm ở `web/` hay `mobile/` — RTM và `testId` của automation không phải biết đường dẫn |
| Tên file nền tảng **mang hậu tố nền tảng** (`test_cases_<module>_web.md`, `part_NN_web_<slug>.md`) | `scripts/testcases-viewer` phân biệt tài liệu theo **tên file** — hai file trùng tên thì file nạp sau ghi đè file trước |
| Bộ TC cũ chưa có tầng nền tảng | Không di chuyển cho tới khi Mode DELTA / sinh thêm chạm lại module → chuyển **một lần** vào file nền tảng, TC ID giữ nguyên, ghi **mốc git** của bản cũ vào Nhật ký |

> ⚠️ **Dự án mới — BẮT BUỘC kiểm tra trước khi ghi bộ TC đầu tiên:** `docs/testcases/README.md` chưa tồn tại thì **tạo ngay** với bảng danh mục rỗng, rồi mới ghi TC và bổ sung dòng đầu tiên. Thiếu file này thì không ai biết prefix TC ID nào đã bị chiếm, và độ phủ REQ↔TC không có chỗ theo dõi.
>
> Nội dung file danh mục gồm 6 mục: bảng danh mục module (kèm **prefix TC ID đã chiếm** và cột `Nền tảng` — số TC từng nền tảng, VD `Web 52 · Mobile 24 · API 18`) · độ phủ so với requirements · cấu trúc thư mục chuẩn · kết quả thực thi (`docs/executions/`) · quy trình sử dụng · nhật ký danh mục.

| Quy tắc | Lý do |
|---|---|
| Tên index **luôn** `TEST_CASES_<TÊN_MODULE>_SUMMARY.md` — chữ IN HOA, `<TÊN_MODULE>` = tên thư mục module viết HOA, `-` đổi thành `_` (VD `login` → `LOGIN`, `customers` → `CUSTOMERS`) — **không phải** prefix REQ (`CUST`) | Mọi workflow phía sau (`/execute-test-cases`, `/review-testcases`, `/generate-automation-from-testcases`, `/generate-traceability-matrix`) đọc theo mẫu `docs/testcases/<module>/TEST_CASES_<TÊN_MODULE>_SUMMARY.md`. IN HOA để file tổng **khác hẳn** file nền tảng `test_cases_<module>_<nền-tảng>.md`. Đổi tên là vỡ chuỗi |
| Tài liệu cũ còn index `test_cases_<module>.md` (quy ước trước 21-09-2026) | Đọc **nhận cả hai tên**. Lần đầu sinh/cập nhật chạm lại module → đổi tên **một lần** sang `TEST_CASES_<TÊN_MODULE>_SUMMARY.md`, sửa link trỏ tới, ghi Nhật ký |
| **KHÔNG** nhét số phiên bản vào tên index (`_v2`, `_new`…) | Phiên bản mới **thay thế** index tại chỗ; bản cũ tra bằng **lịch sử git** |
| Part đặt trong `<nền-tảng>/parts/`, đặt tên `part_NN_<nền-tảng>_<slug>.md` | `NN` có số 0 đứng đầu để sắp xếp đúng; slug mô tả nhóm chức năng; hậu tố nền tảng chống trùng tên file |
| Mode DELTA sửa **tại chỗ** file nền tảng/part, ghi **mốc git** của bản trước khi sửa. **KHÔNG** có thư mục `archive/`, **KHÔNG** chép bản cũ ra file nào | Giữ đúng một nguồn sự thật. Bản sao `_v2` / `archive/` là bộ TC thứ hai nằm cạnh bộ đang dùng — grep TC ID ra hai kết quả, viewer nạp nhầm, lệnh dọn dự án bỏ sót. Git đã giữ mọi phiên bản |

**Ngưỡng tách:**

| Điều kiện | Xử lý |
|---|---|
| ≤ 40 TC ở độ hạt TÁCH · ≤ 50 TC ở độ hạt GỘP — **đếm theo từng nền tảng** | 1 file `<nền-tảng>/test_cases_<module>_<nền-tảng>.md`, không cần `parts/` |
| File nền tảng vượt ngưỡng trên | Tách vào `<nền-tảng>/parts/part_01_<nền-tảng>_<slug>.md`, `part_02_...` — mỗi part dưới ngưỡng, **cắt tại ranh giới nhóm chức năng**, không cắt giữa nhóm |
| Nhiều module | Mỗi module một thư mục riêng, KHÔNG gộp chung |
| Mọi trường hợp | File `TEST_CASES_<TÊN_MODULE>_SUMMARY.md` **luôn là index** (xem mục 4) — TC chi tiết nằm hết trong file nền tảng / part |

> Ngưỡng đếm theo **số TC**, không theo dung lượng — người review đọc lần lượt từng TC, nên số TC mới là thứ quyết định một lượt review có kham nổi không.
>
> Tham khảo dung lượng thực tế với kiểu TC của repo này (steps đánh số + expected khớp 1-1): **~1 KB / TC ở độ hạt TÁCH**, **~1,8 KB / TC ở độ hạt GỘP** (dày hơn vì có Bảng biến thể, nhưng bù lại chỉ còn một nửa số TC). Đừng dùng dung lượng làm ngưỡng tách — file 70 KB gồm 41 TC gộp vẫn dễ review hơn file 40 KB gồm 40 TC vụn.

### 3. Chạy theo batch — không dừng hỏi giữa chừng

- Chia theo **VÒNG** của [Bản Đồ Loại Kiểm Thử — 4 Vòng](#bản-đồ-loại-kiểm-thử--4-vòng-bắt-buộc--khung-sinh-tc-cho-quick--full-rbt--delta): `V1 Smoke` → `V2 Functional` → `V3 Technical` → `V4 Non-functional`. Mỗi batch 15–25 TC
- Vòng 2 thường đông TC → chia con **bên trong vòng** theo nhóm chức năng (validation form / data table / CRUD / status flow). KHÔNG trộn TC của hai vòng khác nhau vào một batch
- Agent **chạy thẳng hết mọi batch trong 1 lượt**, KHÔNG dừng hỏi "có tiếp tục không" sau mỗi batch
- Trước khi sinh, agent công bố kế hoạch batch để user biết tổng khối lượng:
  ```
  Kế hoạch: 5 batch · ~46 TC · 1 file · độ hạt GỘP (mặc định)
  V1 Smoke        (≈9 TC)   — UI cơ bản, mở form, hiển thị, nhập hợp lệ, lưu, đối chiếu
  V2a Validation  (≈14 TC)  — required + 15 loại field
  V2b CRUD & luồng(≈11 TC)  — sửa, xoá, phụ thuộc, đoán lỗi
  V3 Technical    (≈8 TC)   — phân quyền, bảo mật cơ bản  [@TechCheck]
  V4 Non-func     (≈4 TC)   — responsive, bàn phím
  ```
  Dòng kế hoạch **BẮT BUỘC** nêu độ hạt đang dùng — user đọc một dòng là biết sẽ nhận ~46 TC hay ~85 TC và chặn lại được ngay nếu không hợp ý.
- Ngoại lệ được phép dừng: phát hiện requirement mâu thuẫn nghiêm trọng làm sai hàng loạt TC phía sau

### 4. File index (luôn có)

File `docs/testcases/<module>/TEST_CASES_<TÊN_MODULE>_SUMMARY.md` **là index** — giữ nguyên tên, không đổi thành `*_index.md`, **không** chứa dòng TC:

```markdown
# Test Cases — <Module> (tổng <N> TC · <K> nền tảng)

| Thông tin | Nội dung |
|---|---|
| Nguồn requirement | [REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md](../../requirements/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md) |
| Dải TC ID đã dùng | `CRM_CUST_TC_001` → `CRM_CUST_TC_094` — chung mọi nền tảng |

## Bản đồ tài liệu
| Nền tảng | File | Nhóm chức năng | Số TC | TC ID | REQ bao phủ |
|---|---|---|---|---|---|
| Web | [web/test_cases_customers_web.md](web/test_cases_customers_web.md) | Danh sách · tạo/sửa · validation | 52 | 001–052 | REQ-CUST-01 → 26 |
| Mobile | [mobile/test_cases_customers_mobile.md](mobile/test_cases_customers_mobile.md) | Danh sách · tạo nhanh · quyền camera | 24 | 053–076 | REQ-CUST-01 → 08 · 27 → 33 |
| API | [api/parts/part_01_api_customers.md](api/parts/part_01_api_customers.md) | `/api/customers` | 18 | 077–094 | REQ-CUST-01 · 34 → 45 |

## Bảng Đối Soát Coverage (toàn module)
<gộp coverage của mọi file nền tảng — có cột theo nền tảng: REQ khai áp N nền tảng thì phải có ≥ 1 TC ở **mỗi** nền tảng đó>
```

- Mỗi file nền tảng / part **BẮT BUỘC** có link ngược về index, link tới file requirements của **cùng nền tảng** (`../../../requirements/<module>/<nền-tảng>/requirements_<module>_<nền-tảng>.md`) và link tới part liền kề
- Bảng Đối Soát Coverage **chỉ nằm ở index**, không nhân bản vào từng file nền tảng
- REQ dùng chung ≥ 2 nền tảng mà thiếu TC ở một nền tảng đã khai → coverage của nền tảng đó là ❌, **không** được tính là "đã phủ" nhờ TC của nền tảng khác
- **Cập nhật `docs/testcases/README.md`** (danh mục) sau khi sinh xong: số TC, số part, REQ bao phủ, ngày cập nhật

### 5. task.md — theo dõi tiến độ

Khi tổng TC dự kiến **>30** hoặc có **≥2 module**, agent **BẮT BUỘC** tạo `task.md` (nhất quán với các workflow automation trong repo) và cập nhật sau mỗi batch:

```markdown
# Task: Sinh TC module Customers
- [x] Batch 1 — Validation form (24 TC) → part1
- [x] Batch 2 — Data table & filter (18 TC) → part1
- [ ] Batch 3 — CRUD & phân quyền (đang chạy)
- [ ] Batch 4 — Non-functional
- [ ] Quality Gate + Bảng Đối Soát Coverage
```

> Nếu môi trường có sẵn task list của Claude Code → dùng luôn task list thay cho `task.md` để user thấy tiến độ trực tiếp trên UI.
