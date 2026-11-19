## Bảng Output Standard (chuẩn hóa đầy đủ Metadata)

```markdown
| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automation | Auto Type | Tags |
```

> **Giải thích Metadata:**
> - **REQ ID:** Mã requirement mà TC này cover (`REQ-LOGIN-01`) — BẮT BUỘC, 1 TC có thể cover nhiều REQ (phân cách `,`). Đây là mắt xích truy vết để đối soát "đủ case" và chạy `/generate-traceability-matrix`
> - **Risk Level:** `High` / `Medium` / `Low` — mức rủi ro của vùng chức năng TC này chạm tới, tương ứng mức `Cao` / `Trung bình` / `Thấp` của mục **Độ sâu theo rủi ro** (ô bảng ghi tiếng Anh vì viewer sort theo giá trị này). **KHÔNG được bỏ cột này**: `scripts/testcases-viewer` có cột Risk và cho sort theo nó, thiếu cột thì toàn bộ cột Risk hiện `—` và sort mất tác dụng
> - **Automation:** `Yes` / `No` / `Partial` — chấm theo [Tiêu chí chấm cột Automation](automation_criteria.md) (**BẮT BUỘC đọc trước batch đầu tiên**): 3 trục kỹ thuật · sẵn sàng · đáng làm, lấy mức thấp nhất. **KHÔNG** gắn `Yes` mặc định — TC chạm OTP, email, CAPTCHA, biểu đồ, SSO… phải tra bảng. Ô chỉ ghi **đúng một từ**; điều kiện của `Partial`, lý do của `No` ghi vào mục `## Đối soát cột Automation` của index — viewer lọc cột này theo giá trị chính xác
> - **Auto Type:** `UI` / `API` / `Unit` / `N/A` (Loại automation phù hợp)
> - **Tags:** `@Smoke`, `@Regression`, `@CriticalPath`, `@Security`, `@Boundary` · tag có nghĩa với workflow khác: `@TechCheck` (cần DevTools — Quy Tắc Ngôn Ngữ Kiểm Chứng) · `@NeedsVerify` (chưa có evidence chống lưng) · `@PersonalOnly` · `@Deprecated` (hai tag dưới)
> - **`@Deprecated`** — TC của chức năng đã gỡ. Bảng TC **không có cột trạng thái** (viewer không đọc cột lạ), nên trạng thái ghi bằng **hai dấu hiệu cùng lúc**: tag `@Deprecated` ở cột `Tags` **và** tiền tố `🗑️ Deprecated (<TICKET-ID>, <DD-MM-YYYY>) —` ở đầu ô `Test Scenario` / `Test Title`. Giữ nguyên dòng và TC ID. TC `@Deprecated`: **bị loại khỏi phạm vi** của `/execute-test-cases` (không tính vào tổng, không tính SKIPPED) · **không tính** vào Bảng Đối Soát Coverage, Bảng 4 vòng, Đối soát cột Automation, RTM · không chấm rubric khi review
> - **`@PersonalOnly`** — QA **tự chạy và tự theo dõi** ngoài workflow (TC chạy quá lâu, cần thao tác tay đặc biệt…) → `/execute-test-cases` **bỏ qua**. Đây là tag **duy nhất** làm `/execute-test-cases` bỏ qua TC. Cột `Automation` (`Yes`/`Partial`/`No`) chỉ nói TC có làm automation hay không — TC `Automation = No` **vẫn** được `/execute-test-cases` chạy
> - **Tag nền tảng** — BẮT BUỘC khi module có ≥ 2 nền tảng (requirements có cột `Nền tảng`, skill `skills-requirements-analyzer` mục 2.2): mỗi TC gắn `@Web` · `@Android` · `@iOS` · `@API` theo nền tảng nó chạy. REQ `Nền tảng` = `Tất cả` mà các bước thao tác khác nhau giữa nền tảng → **mỗi nền tảng một TC**, cùng `REQ ID`, mỗi TC nằm ở file nền tảng của nó. Dùng **tag**, **không** thêm cột `Nền tảng` — viewer map cột theo tên, cột lạ bị bỏ qua. TC nằm ở file của **đúng** nền tảng nó chạy (`web/` · `mobile/` · `api/` — mục 2 của Quy Tắc Xuất File); chung prefix nên **chung dải TC ID** toàn module — ❌ không mở dải TC ID riêng cho mobile/API
>
> ⚠️ **Tên cột là hợp đồng đọc, không phải nhãn trình bày.** `scripts/testcases-viewer` map cột theo **tên**, nên thứ tự cột đổi được nhưng tên thì không: `TC ID`, `REQ ID`, `Module`, `Priority`, `Automation`, `Tags` phải khớp **chính xác** (thêm chữ như `TC ID liên quan` là mất cột), còn `Risk`, `Scenario`/`Test Title`, `Pre-Condition`, `Test Steps`, `Test Data`, `Expected`, `Auto Type` khớp theo chuỗi con. **KHÔNG dịch tên cột sang Tiếng Việt** — nội dung ô viết Tiếng Việt, tên cột giữ nguyên.
>
> **Ở độ hạt GỘP:** cột `Test Data` (Kiểu A) hoặc `Expected Result` (Kiểu B) chứa **Bảng biến thể / Bảng kiểm** — mỗi dòng một mã (`a`, `b`, `c`…), phân cách bằng `<br>`. Số cột của bảng **không đổi**, chỉ nội dung ô dày hơn. Xem mẫu ở mục Độ Hạt Test Case.

## Quy Tắc Trình Bày Test Steps (BẮT BUỘC — áp dụng QUICK, FULL RBT & DELTA)

> Mode CHECKLIST KHÔNG dùng steps đánh số — xem Quy Tắc Viết Mục Checklist ở Mode 3.

- **Mỗi bước 1 hành động, đánh số thứ tự rõ ràng** `1. 2. 3.` — trong cell Markdown dùng `<br>` xuống dòng
- **Expected Result đánh số khớp 1-1** với step tương ứng (step nào có kết quả quan sát được thì có expected cùng số)
- KHÔNG viết steps thành đoạn văn liền, KHÔNG gộp nhiều hành động vào 1 số

```markdown
✅ Đúng:
| Test Steps | Expected Result |
| 1. Mở trang /login<br>2. Nhập email: test_login_01@auto.test<br>3. Nhập password: Test@123<br>4. Click nút "Đăng nhập" | 1. Trang login hiển thị đủ 2 field + nút<br>4. Chuyển đến /dashboard, hiển thị "Xin chào" |

❌ Sai:
| Mở trang login rồi nhập email và password hợp lệ sau đó bấm đăng nhập | Đăng nhập thành công |
```

## Quy tắc Test Data (áp dụng cho cả 4 modes)

```
❌ Sai: "Nhập mã số hợp lệ"
✅ Đúng: "Nhập mã: KH-2026-0012"

❌ Sai: "Nhập email hợp lệ"
✅ Đúng: "Nhập email: test_khachhang_01@domain.com"

❌ Sai: "Nhập giá trị vượt giới hạn"
✅ Đúng: "Nhập 256 ký tự vào trường Name (max: 255)"
```

## Bản Đồ Loại Kiểm Thử — 4 Vòng (BẮT BUỘC — khung sinh TC cho QUICK · FULL RBT · DELTA)

> Hai bảng checklist ngay bên dưới (Field-Level 15 loại · Component-Level) trả lời *"trường này / thành phần này phải test gì"*. Bảng này trả lời câu **khác hẳn**: ***"bộ TC đã đi qua đủ các LOẠI kiểm thử chưa, và theo thứ tự nào"*** — chống bỏ sót nguyên một lớp test. Lớp hay bị mất nhất: **giao diện ở Vòng 1**, vì phần validation vẫn đủ nên nhìn qua tưởng bộ TC đã kín.
>
> **Phân biệt với bảng ISO/IEC 25010 ở cuối skill:** 4 vòng là **khung tác nghiệp lúc sinh** — chia batch, đặt thứ tự, chấm thiếu-đủ theo nhánh. ISO 25010 là **khung rà soát lúc xuất** — đặc tính nào ngoài phạm vi, ai chịu trách nhiệm, nuôi mục 2.2 của Master Test Plan. Chạy **cả hai**, không cái nào thay được cái nào.

### Thứ tự bắt buộc

```
VÒNG 1 – SMOKE            → màn hình dựng được, luồng sống còn không vỡ
VÒNG 2 – FUNCTIONAL       → phần thân của mọi bộ TC (~60–70% số TC)
VÒNG 3 – TECHNICAL        → phần lớn cần DevTools/DB → tag @TechCheck
VÒNG 4 – NON-FUNCTIONAL   → phần lớn chấm ➖ ở app nghiệp vụ thường
```

Sinh **tuần tự V1 → V4**, không nhảy cóc. Lý do không phải hình thức: Vòng 1 fail thì **mọi TC Vòng 2 đều BLOCKED** — biết trong 10 phút đầu để dừng, thay vì chạy hết 40 TC rồi mới phát hiện form không mở được.

---

### VÒNG 1 — SMOKE

| Nhánh | Kích hoạt khi | TC phải có | Trỏ về |
|---|---|---|---|
| **UI cơ bản** | **Luôn luôn** | Màn hình hiển thị **đủ** thành phần theo evidence: nhãn nguyên văn, thứ tự field, nút, liên kết, tiêu đề. Trạng thái mặc định từng ô (rỗng / tick sẵn / option đang chọn / con trỏ đang ở đâu) | Gộp **Kiểu B** · 4 nhóm evidence bắt buộc |
| **Open form** | Có form / modal / trang con | Mở được bằng **mọi lối vào** (nút, menu, URL trực tiếp) · đóng được bằng X / Cancel / ESC / click ra ngoài | Component-Level → Modal/Dialog |
| **Display** | Có dữ liệu hiển thị | Định dạng hiển thị đúng (tiền tệ, ngày, giờ, badge, avatar) · trạng thái rỗng · trạng thái đang tải | 4 nhóm evidence bắt buộc |
| **Input valid data** | Có form nhập | Bộ dữ liệu hợp lệ **tối thiểu** (chỉ field bắt buộc) và bộ **đầy đủ** (mọi field) | Quy tắc Test Data |
| **Save** | Có hành động lưu | Lưu thành công → thông báo đúng → điều hướng đúng | Component-Level → CRUD |
| **Verify data** | Có lưu | Dữ liệu vừa lưu hiện đúng ở **danh sách** *và* ở **màn hình chi tiết** | Component-Level → CRUD |

> 🚨 **Nhánh `UI cơ bản` là chỗ bị bỏ sót nhiều nhất.** Bộ TC không có TC nào kiểm nhãn / thứ tự / trạng thái mặc định của màn hình là **thiếu hẳn một lớp**, dù phần validation đầy đủ đến đâu. Nhánh này **KHÔNG BAO GIỜ** được chấm `➖`.

---

### VÒNG 2 — FUNCTIONAL

| Nhánh | Kích hoạt khi | TC phải có | Trỏ về |
|---|---|---|---|
| **UI Behavior** | Có tương tác làm đổi giao diện | Field bật/tắt theo lựa chọn khác · nút khoá đến khi đủ điều kiện · bộ đếm ký tự · gợi ý autocomplete · nút hiện/ẩn mật khẩu | Quy Tắc Đối Chiếu Evidence mục 6 (disabled ≠ không tick) |
| **Required** | Có field bắt buộc | Bỏ trống **TỪNG** field bắt buộc → thông báo trỏ đúng field đó · bỏ trống tất cả | Bảng Field-Level |
| **Validation** | Mọi field có ràng buộc | Đối soát **đủ từng mục** của loại field tương ứng trong bảng 15 loại — mục bỏ qua phải ghi lý do | Bảng Field-Level |
| **Equivalence Partitioning** | Field có miền giá trị phân nhóm được | Mỗi partition ≥1 TC | Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật |
| **Boundary Value Analysis** | Field có min/max | `min-1` · `min` · `max` · `max+1` | nt |
| **Business Rule** | Có quy tắc nghiệp vụ | Mỗi rule ≥1 TC tuân thủ + ≥1 TC vi phạm (verify bị chặn) | nt |
| **Decision Table** | ≥3 điều kiện kết hợp → 1 output | Mỗi rule (cột) = 1 TC | nt |
| **State Transition** | Entity có ≥3 trạng thái | Mọi transition hợp lệ + mọi transition **bị chặn** | nt · Component-Level → Status Flow |
| **Dependency** | Field / màn hình phụ thuộc nhau | Đổi A → B đổi theo · xoá A đang được B tham chiếu · A rỗng thì B khoá | Component-Level → CRUD (khoá ngoại) |
| **Use Case / Scenario** | Có luồng nghiệp vụ nhiều bước | Chuỗi end-to-end **trong phạm vi module** (tạo → sửa → đổi trạng thái → tìm lại) | — |
| **Save / Edit / Delete** | Có CRUD | Toàn bộ CRUD Lifecycle, gồm huỷ giữa chừng và xoá bản ghi đang được liên kết | Component-Level → CRUD |
| **Error Guessing** | **Luôn luôn** | Bấm Lưu hai lần liên tiếp · dán dữ liệu lạ · bấm Back sau khi lưu · nạp lại trang giữa chừng · mở 2 tab cùng sửa | Scenarios Chuyên Sâu |

> `Positive` / `Negative` **KHÔNG phải nhánh riêng** — chúng là thuộc tính của mọi nhánh bên trên. Chấm ở mức bộ TC (Gate #4), **không** tạo batch riêng, **không** tạo dòng riêng trong bảng đối soát.

---

### VÒNG 3 — TECHNICAL

> ⚠️ Đa số nhánh vòng này **không kiểm được bằng mắt** → nội dung phải nằm dưới `🔧 Ghi chú kỹ thuật (cần DevTools):` và TC mang tag `@TechCheck` theo **Quy Tắc Ngôn Ngữ Kiểm Chứng**. Viết mã HTTP / câu SQL / tên bảng vào phần TC chính là **vi phạm Gate #8**.

> 🔑 **Bốn nhánh `API` · `Database` · `Integration` · `Logging/Audit` là thuộc tính CẤP DỰ ÁN, không phải cấp module.** QA có quyền gọi API hay không thì mọi module đều giống nhau — hỏi lại ở từng module là bắt user trả lời cùng một câu hàng chục lần.
>
> **Thứ tự bắt buộc:**
> 1. **Đọc `docs/requirements/README.md`** → bảng thuộc tính ở đầu file, dòng **`Năng lực kiểm thử của QA`**. Có sẵn thì **dùng luôn, KHÔNG hỏi lại** — chép nguyên lý do và người chịu trách nhiệm vào bảng đối soát 4 vòng
> 2. Chưa có dòng đó (dự án cũ, hoặc `/discover-system` chạy trước khi có luật này) → hỏi user **đúng một lần**, rồi **ghi ngay vào `docs/requirements/README.md`** trước khi sinh dòng TC đầu tiên
> 3. Trả lời của user **có thể kiểm chứng được** thì kiểm luôn thay vì tin lời: mở đúng trang nhật ký hoạt động của hệ thống, thử gọi một API đọc. Ghi **kết quả đo** kèm ngày vào README — nó chính xác hơn câu trả lời từ trí nhớ
>
> Mẫu dòng ghi vào bảng thuộc tính của `docs/requirements/README.md`:
>
> ```markdown
> | **Năng lực kiểm thử của QA** | Chốt <ngày> — dùng cho nhánh Vòng 3 của **mọi** bộ TC:<br>• Gọi API: ❌/✅ + ai chịu nếu ❌<br>• Truy vấn CSDL: ❌/✅ + ai chịu<br>• Kiểm tầng tích hợp: ❌/✅ + ai chịu<br>• Xem nhật ký hoạt động: ❌/✅ + đường dẫn đã thử + kết quả đo<br>• DevTools trình duyệt: ❌/✅ |
> ```
>
> Dòng này đổi khi **quyền của QA đổi** (được cấp tài khoản mới, mở quyền DB), không đổi theo module. Đổi thì cập nhật README và ghi vào Nhật ký danh mục — các bộ TC đã sinh có nhánh `➖` vì lý do cũ cần rà lại.

| Nhánh | Kích hoạt khi | TC phải có | Mặc định nếu không áp dụng |
|---|---|---|---|
| **Permission** | Có ≥2 role | Ma trận Phân quyền: mỗi role × mỗi hành động · truy cập URL trực tiếp khi không đủ quyền · phần tử ẩn/khoá đúng theo role | 🚫 **Không được `➖`** khi hệ thống có ≥2 role |
| **Security** | Luôn (mức cơ bản) | Truy cập khi chưa đăng nhập · dữ liệu người này có lộ sang người kia không · XSS/SQLi ở field text · phiên sau khi đăng xuất · nút Back sau đăng xuất | `➖` chỉ khi có đội security riêng — **bắt buộc ghi tên đội** |
| **API** | QA được phép gọi API | Mã trạng thái theo từng thao tác · gọi thẳng API bỏ qua UI · gọi thiếu/sai token | `➖` ghi *"QA không có quyền gọi API"* |
| **Database** | QA được phép truy vấn DB | Dữ liệu lưu đúng bảng/đúng kiểu · xoá mềm hay xoá cứng · dữ liệu rác còn lại sau khi huỷ giữa chừng | `➖` ghi *"không có quyền truy cập DB — đội Dev xác minh"* |
| **Integration** | Có tích hợp bên thứ ba | Bên thứ ba trả lỗi / quá hạn chờ / không phản hồi → app xử lý ra sao | `➖` ghi rõ hệ thống nào không kiểm |
| **Logging / Audit** | Có yêu cầu nhật ký thao tác | Thao tác quan trọng có ghi nhật ký (ai · lúc nào · đổi gì) · nhật ký không lộ dữ liệu nhạy cảm | `➖` ghi *"requirements không có yêu cầu audit"* |

---

### VÒNG 4 — NON-FUNCTIONAL & REGRESSION

> Ở app nghiệp vụ thông thường, **phần lớn vòng này chấm `➖` là kết quả ĐÚNG** — không phải thiếu sót. Nhưng `➖` phải **ghi ai chịu trách nhiệm**; ô `➖` ở đây chính là nguồn cho mục **2.2 Ngoài phạm vi** của `/generate-master-test-plan`. Đó là khác biệt giữa *"QA quên test"* và *"đã xem xét và thống nhất không test"*.

| Nhánh | Kích hoạt khi | TC phải có | Ghi chú |
|---|---|---|---|
| **Compatibility** | Có cam kết đa trình duyệt | Danh sách trình duyệt/phiên bản **đã chốt** × luồng chính | Ghi rõ trình duyệt nào **không** kiểm |
| **Responsive / UI Stability** | App có bản web đáp ứng | Các breakpoint **đã chốt** (VD 1920 · 1366 · 768 · 375) · không tràn ngang · không đè chữ · phóng to 125% | Phải chốt danh sách breakpoint — cấm ghi *"mọi kích thước màn hình"* |
| **Accessibility** | Luôn (mức cơ bản) | Tab theo thứ tự hợp lý · Enter/Space kích hoạt · viền focus nhìn thấy được · ảnh có văn bản thay thế | WCAG đầy đủ cần công cụ riêng → phần đó `➖` |
| **Performance** | Có ngưỡng thời gian đã cam kết | Chỉ mức quan sát thô: trang tải quá lâu · danh sách lớn bị treo | Đo tải thật → `➖`, ghi đội hiệu năng |
| **Regression** | Module đã từng có bug được đóng | Mỗi bug đã đóng = 1 TC chống tái phát, **trỏ về mã bug** | Nguồn: `docs/bugs/<module>/` |
| **E2E** | Luồng đi qua ≥2 module | Kịch bản xuyên module, dữ liệu chảy từ module này sang module kia | Luồng phức tạp → chuyển sang `/generate-cross-module-test-plan` |

---

### Độ sâu theo rủi ro — không phải chức năng nào cũng chạy đủ 4 vòng

Bảng 4 vòng ở trên chống **bỏ sót**. Mục này chống **thừa** — bơm 50 TC cho một trang "Giới thiệu" tĩnh cũng tai hại ngang bỏ quên lớp giao diện của màn thanh toán: nó ngốn công viết, công chạy, công bảo trì, và làm loãng bộ TC thật.

Cơ chế phân xử **không phải là cái mới** — đó chính là `Risk Level` vốn đã có ở cột bảng TC và ở Bước 5 của Mode FULL RBT. Mục này nối nó vào khung 4 vòng.

#### Chấm mức rủi ro — agent tự chấm, KHÔNG hỏi user

| Mức | Điều kiện | Cách chấm |
|---|---|---|
| **Cao** | Chỉ cần **MỘT** dấu hiệu: đụng tiền hoặc số liệu tài chính · đụng xác thực/phân quyền · đụng dữ liệu cá nhân khách hàng · có thao tác **không hồi lại được** (xoá cứng, gửi mail ra ngoài, chốt sổ) · là **cổng vào** module khác (hỏng thì chặn cả đợt kiểm thử) | Đủ 1 dấu hiệu là Cao, không cần cân nhắc thêm |
| **Thấp** | Phải đủ **CẢ BỐN**: chỉ hiển thị, không ghi dữ liệu · không có field nhập (hoặc chỉ có ô tìm kiếm) · hỏng thì không ai mất dữ liệu và không chặn việc gì · sửa lại được trong vài phút, không cần triển khai lại | Thiếu một điều kiện là **không** được chấm Thấp |
| **Trung bình** | Phần còn lại | Mặc định khi lưỡng lự |

> 🚨 **Lưỡng lự thì chấm mức CAO HƠN.** Chấm nhầm Cao chỉ tốn công viết thừa vài TC; chấm nhầm Thấp là bỏ lọt lỗi ra production. Hai sai lầm này **không cùng giá**.
>
> Agent **tự chấm và ghi căn cứ** — không thêm câu hỏi cho user. User phủ quyết ở **checkpoint Bước 4** (FULL RBT) hoặc ở dòng kế hoạch batch (QUICK); đó là lúc nhìn một bảng là chặn được, rẻ hơn nhiều so với chặn sau khi đã sinh xong.

#### Ba mức độ sâu

| | **Đầy đủ** (rủi ro Cao) | **Tiêu chuẩn** (Trung bình) | **Tối giản** (Thấp) |
|---|---|---|---|
| **V1 Smoke** | Đủ 6 nhánh | Đủ 6 nhánh | **Đủ 6 nhánh — KHÔNG rút** |
| **V2 Functional** | Đủ mọi nhánh có điều kiện kích hoạt | Đủ mọi nhánh có điều kiện kích hoạt | Chỉ `Required` · `Validation` của field **có ràng buộc thật**; phần còn lại `⏭️` |
| **V3 Technical** | Đủ 6 nhánh | `Permission` + `Security`; còn lại theo Năng lực kiểm thử của QA | `Permission` (nếu ≥2 role); còn lại `⏭️` |
| **V4 Non-functional** | Đủ 6 nhánh | `Responsive` + `Accessibility`; còn lại `⏭️` | Toàn bộ `⏭️` |
| **Số TC điển hình** (độ hạt GỘP, module cỡ Login) | 40–60 | 20–30 | 8–12 |

#### Bốn thứ KHÔNG BAO GIỜ rút, bất kể rủi ro thấp đến đâu

| Không rút | Vì sao |
|---|---|
| **Toàn bộ V1** | Bỏ V1 thì không biết chức năng **có chạy được không**. Sáu TC là cái giá rẻ nhất để biết điều đó |
| `V2 · Required` + `V2 · Validation` khi **có field nhập** | Có ô nhập là có người nhập sai. Trang "chỉ hiển thị" mà có ô nhập thì nó không còn là "chỉ hiển thị" — chấm lại mức rủi ro |
| `V3 · Permission` khi hệ thống có **≥2 vai trò** | Lỗi phân quyền không tỷ lệ với độ quan trọng của chức năng: một trang xem báo cáo tưởng vô hại vẫn có thể lộ dữ liệu cả công ty |
| `V3 · Security` khi chức năng chạm **dữ liệu của người dùng khác** | Cùng lý do trên |

#### Trạng thái thứ tư: `⏭️` — phân biệt với `➖`

Bảng đối soát 4 vòng có **bốn** trạng thái, không phải ba:

| Ký hiệu | Nghĩa | Bắt buộc ghi kèm |
|---|---|---|
| `✅` | Có TC | TC ID (kèm số biến thể nếu GỘP) |
| `➖` | **Không áp dụng** — không có thứ đó để kiểm (module không có CRUD, không có dropdown, không có tích hợp) | Lý do kỹ thuật |
| `⏭️` | **Cố ý bỏ** — có thứ đó, kiểm được, nhưng **quyết định không kiểm** vì rủi ro thấp | **Lý do + ai quyết định + điều kiện rà lại** |
| `🔴` | Thiếu — phải bổ sung trước khi xuất | — |

> 🚨 **`➖` và `⏭️` KHÔNG được dùng lẫn.** `➖` là **sự thật kỹ thuật** ("hệ thống không có cái đó"). `⏭️` là **một quyết định có người chịu trách nhiệm** ("có, nhưng chúng tôi chấp nhận rủi ro không kiểm"). Khi có sự cố production, hai câu đó dẫn tới hai cuộc họp hoàn toàn khác nhau. Ghi `➖` cho thứ thật ra là `⏭️` là **giấu quyết định** — nguy hiểm hơn cả bỏ trống ô.

Mẫu dòng `⏭️` đạt yêu cầu:

```markdown
| 4 | Compatibility | ⏭️ Cố ý bỏ | Trang tĩnh, rủi ro Thấp — chỉ kiểm Chrome. **Quyết định: QA lead, 11-09-2026.** Rà lại khi trang có thêm field nhập hoặc khi hệ thống cam kết hỗ trợ trình duyệt mới |
```

```markdown
❌ Không đạt: | 4 | Compatibility | ⏭️ | Không cần thiết |
```

#### Ghi mức độ sâu vào tài liệu TC

Ngay dưới tiêu đề bộ TC, thêm một dòng để người đọc biết bộ này **cố tình** dừng ở đâu:

```markdown
| **Mức rủi ro · độ sâu** | `Thấp` → **Tối giản** — V1 đủ 6 nhánh, V2 chỉ nhánh có ràng buộc, V3/V4 phần lớn `⏭️`.<br>Căn cứ chấm Thấp: chỉ hiển thị · không ghi dữ liệu · không có field nhập · hỏng không chặn việc gì.<br>**Nâng lên Tiêu chuẩn khi:** thêm bất kỳ field nhập nào, hoặc chức năng bắt đầu ghi dữ liệu |
```

> Dòng **"Nâng lên khi…"** là phần quan trọng nhất — nó biến quyết định rút gọn hôm nay thành thứ **tự hết hạn** khi chức năng lớn lên, thay vì một lựa chọn bị quên vĩnh viễn.

---

### Cách dùng — 5 quy tắc

1. **Chia batch theo VÒNG**, không chia tự do theo nhóm chức năng. Vòng 2 đông TC thì chia con **bên trong vòng đó** theo nhóm chức năng.
2. **Chấm từng nhánh, không bỏ trống ô nào** — **bốn** trạng thái: `✅ Có TC` (dẫn TC ID) · `➖ Không áp dụng` (không có thứ đó để kiểm — ghi lý do kỹ thuật) · `⏭️ Cố ý bỏ` (có nhưng rủi ro thấp — ghi **lý do + ai quyết định + điều kiện rà lại**) · `🔴 Thiếu` (phải bổ sung **trước khi xuất**). Xem mục **Độ sâu theo rủi ro** ở trên để biết khi nào được dùng `⏭️`.
3. 🚫 **KHÔNG sinh TC để lấp ô, cũng KHÔNG chạy đủ 4 vòng cho chức năng rủi ro Thấp.** Nhánh không có gì để kiểm thì `➖`; nhánh có mà không đáng đầu tư thì `⏭️`. TC sinh ra chỉ cho bảng đẹp là TC rác — cùng một luật với bảng ISO 25010.
4. **Ba nhánh KHÔNG BAO GIỜ được `➖`:** `UI cơ bản` (V1) · `Validation` (V2, khi có field nhập) · `Permission` (V3, khi có ≥2 role). Chấm `➖` ở ba chỗ này là dấu hiệu agent đang né việc.
5. **Độ hạt GỘP thì cột dẫn chứng ghi cả số biến thể** — `TC_001–TC_003 (3 TC · 11 biến thể)`. Gộp làm số TC giảm, nhưng **số biến thể không được giảm**; không ghi số biến thể thì không ai phát hiện được việc rụng case.

### Bảng xuất kèm output (đặt cuối tài liệu TC, **trước** bảng ISO 25010)

```markdown
## Đối soát loại kiểm thử (4 vòng)

| Vòng | Nhánh | Trạng thái | TC ID / Lý do |
|---|---|---|---|
| 1 | UI cơ bản | ✅ | TC_001–TC_003 (3 TC · 11 biến thể) |
| 1 | Open form · Display | ✅ | TC_004–TC_006 |
| 1 | Input valid · Save · Verify | ✅ | TC_007–TC_009 |
| 2 | Required | ✅ | TC_010–TC_012 |
| 2 | Validation | ✅ | TC_013–TC_028 (16 TC · 61 biến thể · đủ 7/7 mục bảng Password) |
| 2 | Error Guessing | 🔴 Thiếu | Chưa có TC bấm Lưu hai lần liên tiếp → **bổ sung trước khi xuất** |
| 3 | Permission | ✅ | TC_040–TC_047 (3 role × 3 hành động) |
| 3 | Database | ➖ | QA không có quyền truy cập DB — đội Dev xác minh |
| 4 | Responsive | ✅ | TC_050–TC_052 (1920 · 1366 · 768) |
| 4 | Performance | ➖ | Không có công cụ tải — đội Hạ tầng, đợt sau |
| 4 | Regression | ➖ | Module mới, chưa có bug nào được đóng |
```

---

## Bảng Field-Level Validation Checklist (15 Field Types)

Khi form/UI có các input fields, agent **BẮT BUỘC** phải liệt kê từng trường và sinh validation TCs riêng theo loại:

| Loại Field | Validation cần test |
|---|---|
| **Text (Name, Address...)** | Required/Optional · Min/Max length · Whitespace-only · Ký tự đặc biệt (`<>&"'`) · XSS injection (`<script>alert(1)</script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email** | Format hợp lệ (`user@domain.com`) · Thiếu `@` · Thiếu domain · Domain không hợp lệ · Nhiều `@` · Ký tự đặc biệt trước `@` · Max length · Case sensitivity · Email đã tồn tại (nếu unique) |
| **Phone** | Chỉ số · Prefix hợp lệ (ví dụ: `+84`, `0`) · Min/Max length · Chữ cái xen lẫn · Dấu `-`, `.`, khoảng trắng · Mã vùng không hợp lệ |
| **Date / DateTime** | Format đúng (dd/MM/yyyy, ISO...) · Ngày không tồn tại (`31/02`, `30/02`) · Năm nhuận (`29/02/2024`) · Quá khứ / tương lai · Min/max date · Timezone |
| **Number / Currency** | Min/Max value · Số âm · Số 0 · Số thập phân · Ký tự không phải số · Overflow · Leading zeros · Định dạng currency |
| **Dropdown / Select** | Giá trị mặc định · Tất cả options hợp lệ · Option disabled · Thay đổi selection · Required validation |
| **Checkbox / Radio** | Trạng thái mặc định · Check/Uncheck · Required validation · Nhóm radio (chỉ chọn 1) |
| **File Upload** | File type hợp lệ/không hợp lệ · Max size · File rỗng (0 KB) · Tên file ký tự đặc biệt · Multiple files · Kéo thả vs nút chọn |
| **Password** | Min/Max length · Yêu cầu ký tự đặc biệt · Yêu cầu chữ hoa/thường · Yêu cầu số · Copy-paste bị chặn? · Hiện/ẩn password · Confirm password khớp/không khớp |
| **Textarea** | Max length · Line breaks · HTML tags · Resize (nếu UI cho phép) · Character counter (nếu có) |
| **OTP / MFA Code** | Auto-focus ô tiếp theo · Paste chuỗi OTP · Hết hạn timeout · Vượt số lần nhập sai (retry limit/lockout) · Re-send OTP rate limit |
| **Date Range / Time Picker** | Ngày kết thúc < Ngày bắt đầu · Khung giờ trùng lặp (time conflict) · Giới hạn khoảng ngày (VD: max 30 ngày) · Quá khứ/Tương lai restriction |
| **Rich Text Editor (WYSIWYG)** | Sanitize HTML tags nguy hiểm (`<script>`, `<iframe>`) · Paste văn bản kèm format/ảnh · Character counter tính theo text thô vs HTML markup |
| **Multi-Select / Tag Input** | Giới hạn số lượng tag · Tag trùng lặp · Xóa tag bằng Backspace/nút X · Tag có ký tự đặc biệt |
| **Range Slider / Stepper** | Giới hạn min/max · Bước nhảy (step increment violation) · Nhập tay trực tiếp so với kéo slider |

## Bảng Component-Level Checklist (Ngoài form input — BẮT BUỘC rà soát)

Form input chỉ là một phần của app. Khi module có các thành phần sau, agent **BẮT BUỘC** sinh TCs theo checklist tương ứng:

| Component | Checklist cần test |
|---|---|
| **Giao diện tĩnh của màn hình** | Đủ thành phần theo evidence (nhãn nguyên văn, thứ tự field, nút, liên kết, tiêu đề) · trạng thái mặc định từng ô (rỗng / tick sẵn / option đang chọn) · con trỏ đang ở ô nào khi vừa mở · định dạng hiển thị (tiền tệ, ngày, giờ, badge) · trạng thái rỗng · trạng thái đang tải · văn bản gợi ý trong ô (placeholder) · tooltip |
| **Data Table / List** | Sort từng cột (asc/desc) · Filter đơn + kết hợp nhiều filter · Search (khớp một phần, không dấu/có dấu, không có kết quả) · Pagination (trang đầu/cuối, đổi page size, nhảy trang) · Empty state (chưa có data) · Danh sách lớn (100+ bản ghi) · Bulk action (chọn tất cả, chọn một phần, thao tác hàng loạt) · Refresh giữ/mất filter đang áp |
| **CRUD Lifecycle** | Create → hiển thị đúng trong list · View detail khớp data đã tạo · Edit → lưu → verify data cập nhật (cả trong list và detail) · Delete → confirm dialog (Cancel giữ nguyên / OK xóa) · Xóa bản ghi đang được liên kết (foreign key) · Tạo trùng unique field · Edit đồng thời 2 người (concurrent) |
| **Permission / Role** | Đối chiếu **Ma trận Phân quyền** trong requirements: mỗi role × mỗi hành động = 1 TC · Truy cập URL trực tiếp khi không có quyền (bypass UI) · Element ẩn/disable đúng theo role · API trả 403 khi gọi trái quyền |
| **Modal / Dialog** | Mở/đóng bằng nút X, nút Cancel, phím ESC, click ra ngoài · Data trong modal reset hay giữ khi mở lại · Submit trong modal lỗi → modal không đóng, hiện lỗi · Nhiều modal chồng nhau (nếu có) |
| **Notification / Toast** | Nội dung đúng theo từng hành động · Tự đóng sau timeout / đóng tay · Nhiều notification liên tiếp · Toast lỗi khác toast thành công (màu/icon) |
| **Trạng thái (Status Flow)** | Đối chiếu **Ma trận Trạng thái** trong requirements: mỗi transition hợp lệ = 1 TC · Mỗi transition KHÔNG hợp lệ = 1 TC (verify bị chặn) · Hành động cho phép/khóa theo từng trạng thái |

> Component nào không có trong module → ghi chú "Không áp dụng" trong phần tổng kết coverage, KHÔNG lặng lẽ bỏ qua.

---

## Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật Thiết Kế (Khi nào PHẢI dùng)

Agent không được chỉ "nhắc tên" kỹ thuật — phải áp dụng theo điều kiện kích hoạt:

| Kỹ thuật | Điều kiện BẮT BUỘC áp dụng | Cách làm |
|---|---|---|
| **EP + BVA** | Mọi field có ràng buộc min/max/format | Mỗi partition ≥1 TC; biên test tại `min-1, min, max, max+1` |
| **Decision Table** | Có **≥3 điều kiện kết hợp** ảnh hưởng đến 1 output (VD: loại KH × hạn mức × trạng thái → được duyệt?) | Lập bảng đầy đủ tổ hợp → mỗi rule (cột) = 1 TC. Nếu >20 tổ hợp → dùng pairwise và ghi chú lý do rút gọn |
| **State Transition** | Entity có **≥3 trạng thái** hoặc có status flow (Draft → Pending → Approved...) | Vẽ bảng transition → TC cho mọi transition hợp lệ + TC verify mọi transition không hợp lệ bị chặn |

**Ví dụ Decision Table (3 điều kiện → 1 output):**

```markdown
| Rule | Loại KH = VIP | Đơn > 10 triệu | Có mã giảm giá | → Giảm giá |
|---|---|---|---|---|
| R1 | Yes | Yes | Yes | 20% |
| R2 | Yes | Yes | No  | 15% |
| R3 | Yes | No  | -   | 10% |
| R4 | No  | Yes | Yes | 10% |
| R5 | No  | No  | No  | 0%  |
→ Mỗi rule R1-R5 = 1 TC với test data cụ thể
```

**Ví dụ State Transition (đơn hàng):**

```markdown
| Từ \ Đến | Pending | Confirmed | Shipped | Cancelled |
|---|---|---|---|---|
| Draft     | ✅ TC_x | ❌ TC_y (verify chặn) | ❌ | ✅ |
| Pending   | -       | ✅ | ❌ | ✅ |
| Confirmed | ❌      | -  | ✅ | ❌ (verify chặn) |
→ Mỗi ô ✅ và ❌ đều là 1 TC
```

---

## Rà Soát Đặc Tính Chất Lượng — ISO/IEC 25010:2023 (chống bỏ sót loại test)

> **Mục đích:** trả lời câu hỏi *"bộ TC này có bỏ sót loại kiểm thử nào không"* bằng một khung có tên gọi chung, thay vì cảm tính. Chạy **một lượt ở cuối**, sau khi đã sinh xong TC — **không** dùng làm khung sinh TC.

ISO/IEC 25010:2023 (Product quality model) có **9 đặc tính**. So với bản 2011 quen thuộc: `Usability` → **Interaction Capability**, `Portability` → **Flexibility**, và thêm mới **Safety**.

| # | Đặc tính | Đặc tính con chính | QA chức năng làm được gì bằng manual TC | Nếu ngoài phạm vi |
|---|---|---|---|---|
| 1 | **Functional Suitability**<br>Phù hợp chức năng | Completeness · Correctness · Appropriateness | ⭐ **Phần chính của mọi bộ TC** — đã phủ qua Positive/Negative/Boundary | Không bao giờ ngoài phạm vi |
| 2 | **Performance Efficiency**<br>Hiệu quả hiệu năng | Time behaviour · Resource utilization · Capacity | Chỉ quan sát được mức thô: trang tải quá lâu, danh sách 1000 dòng bị treo | Đội hiệu năng / công cụ tải — ghi vào mục 2.2 Master Test Plan |
| 3 | **Compatibility**<br>Tương thích | Co-existence · Interoperability | Đa trình duyệt · đa độ phân giải · import/export đúng định dạng · tích hợp bên thứ ba | Ghi rõ trình duyệt/thiết bị nào **không** kiểm |
| 4 | **Interaction Capability**<br>Khả năng tương tác (bản 2011: Usability) | Learnability · Operability · **User error protection** · Inclusivity · User assistance | ⭐ Làm được nhiều: thông báo lỗi có dễ hiểu không · chặn thao tác sai · điều hướng bàn phím · nhãn/tooltip · trạng thái rỗng | A11y chuyên sâu (WCAG đầy đủ) cần công cụ riêng |
| 5 | **Reliability**<br>Tin cậy | Faultlessness · Availability · Fault tolerance · **Recoverability** | Mất mạng giữa chừng · session hết hạn · submit lại sau lỗi · dữ liệu có mất không sau khi khôi phục | Đo uptime/MTBF thuộc vận hành |
| 6 | **Security**<br>An toàn thông tin | Confidentiality · Integrity · Authenticity · **Accountability** · Resistance | Phân quyền theo role · truy cập URL trực tiếp khi chưa đăng nhập · dữ liệu người này có lộ sang người kia không · nhật ký thao tác | Pentest, quét lỗ hổng — **luôn** ghi rõ ai làm |
| 7 | **Maintainability**<br>Bảo trì | Modularity · Reusability · Analysability · Modifiability · Testability | 🚫 **Không kiểm được bằng manual TC** — đây là đặc tính của mã nguồn | Code review / static analysis — không thuộc QA chức năng |
| 8 | **Flexibility**<br>Linh hoạt (bản 2011: Portability) | Adaptability · **Scalability** · Installability · Replaceability | Responsive trên nhiều kích thước màn hình · cài đặt/nâng cấp · đổi ngôn ngữ, múi giờ, đơn vị tiền | Scalability hạ tầng thuộc đội vận hành |
| 9 | **Safety**<br>An toàn (mới ở bản 2023) | Operational constraint · Fail safe · **Hazard warning** | Chỉ áp dụng cho hệ thống mà lỗi gây thiệt hại thật (y tế, tài chính, thiết bị): có cảnh báo trước thao tác không hồi lại được không · có xác nhận trước khi xoá/chuyển tiền không | ➖ Không áp dụng với đa số app nghiệp vụ thông thường |

### Cách dùng — 3 quy tắc

1. **Chấm từng đặc tính, không bỏ trống ô nào:** `✅ Có TC` (dẫn TC ID) · `➖ Ngoài phạm vi` (**phải ghi ai chịu trách nhiệm**) · `🔴 Thiếu` (phải bổ sung trước khi xuất).
2. 🚫 **KHÔNG sinh TC cho đủ 9 ô.** Đặc tính không áp dụng với module này thì chấm `➖` kèm lý do — TC sinh ra chỉ để lấp bảng là TC rác, và nó làm loãng bộ TC thật.
3. **Ô `➖` là dữ liệu đầu vào cho `/generate-master-test-plan` mục 2.2 (Ngoài phạm vi).** Đây là giá trị lớn nhất của bảng này: biến "QA quên test" thành "đã xem xét và thống nhất không test" — hai chuyện hoàn toàn khác nhau khi có sự cố production.

### Bảng xuất kèm output (đặt cuối tài liệu TC)

```markdown
## Rà soát đặc tính chất lượng (ISO/IEC 25010:2023)

| Đặc tính | Trạng thái | TC ID / Lý do |
|---|---|---|
| Functional Suitability | ✅ Có TC | TC_001–TC_048 |
| Performance Efficiency | ➖ Ngoài phạm vi | Không có công cụ tải — đội Hạ tầng, đợt sau |
| Compatibility | ✅ Có TC | TC_049–TC_052 (Chrome, Edge, 1366×768) |
| Interaction Capability | ✅ Có TC | TC_053–TC_060 (thông báo lỗi, điều hướng bàn phím, trạng thái rỗng) |
| Reliability | 🔴 Thiếu | Chưa có TC session hết hạn giữa chừng khi điền form → **bổ sung trước khi xuất** |
| Security | ✅ Có TC | TC_061–TC_070 (phân quyền 3 role, truy cập URL trực tiếp) |
| Maintainability | ➖ Không áp dụng | Đặc tính của mã nguồn, không kiểm bằng manual TC |
| Flexibility | ✅ Có TC | TC_071–TC_074 (responsive 1366/1920, đổi ngôn ngữ) |
| Safety | ➖ Không áp dụng | App nghiệp vụ, lỗi không gây thiệt hại vật lý |
```

> ⚠️ Ghi **tên đặc tính** theo chuẩn, **KHÔNG ghi số điều khoản**. Và **không** tuyên bố *"tuân thủ ISO/IEC 25010"* — câu đúng là *"rà soát theo mô hình chất lượng ISO/IEC 25010:2023"*.

---

## Scenarios Chuyên Sâu & Non-Functional Checklist (Áp dụng nâng cao)

> Đây là phần **chi tiết hoá** của bảng đặc tính bên trên — 5 nhóm dưới đây map lần lượt vào Functional Suitability (1), Reliability (5), Interaction Capability (4) và Flexibility (8).

Agent phải tích hợp thêm các tình huống kiểm thử nâng cao khi phân tích module:

1. **Race Condition & Double Submit:**
   - Double click liên tiếp nút Save/Submit (ngăn tạo 2 bản ghi trùng)
   - Concurrent editing: 2 tabs/users cùng sửa 1 bản ghi đồng thời
2. **Session & Network Resilience:**
   - Session timeout / Token hết hạn giữa chừng khi đang điền form
   - Network interruption (mất mạng khi submit payload, slow 3G timeout, retry logic)
3. **Localization & UTF-8 / Emoji:**
   - Nhập tiếng Việt đầy đủ dấu (`Tiếng Việt có dấu phức tạp ỨỜÁ...`)
   - Nhập emoji (`😀🎉🚀`) và ký tự đa ngôn ngữ (RTL, tiếng Trung, Nhật, Ả Rập)
4. **Keyboard Accessibility (A11y):**
   - Điều hướng bằng phím `Tab` theo thứ tự hợp lý, kích hoạt bằng `Enter`/`Space`
   - Hiển thị viền focus state rõ ràng
5. **HTTP Status Codes (Cho API Test Cases):**
   - Assert đầy đủ các status codes tiêu chuẩn: `200/201 Success`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Rate Limit`, `500/503 Server Error`.

---

## 🛡️ AI Self-Quality Gate (Quy trình Tự Kiểm Định Chất Lượng)

Trước khi xuất kết quả cuối cùng cho user, Agent **BẮT BUỘC** tự rà soát qua 11 tiêu chí (0–10):
- [ ] **0. Độ hạt nhất quán:** Đã chốt GỘP hay TÁCH **trước** batch đầu và nêu ra chat. Toàn bộ bộ TC theo **một** độ hạt, không nửa gộp nửa tách. Nếu GỘP: mọi biến thể có mã riêng (`a`, `b`…), không TC nào quá 6 biến thể, không TC nào vi phạm bảng CẤM gộp.
- [ ] **1. Unique TC ID:** Đảm bảo không trùng mã TC ID và đúng quy tắc dự án (`PROJECT_MODULE_TC_001`).
- [ ] **2. 1-to-1 Step-Expected Matching:** Các bước `Test Steps` đánh số rõ ràng (1,2,3 — mỗi bước 1 hành động) và khớp 1-1 với `Expected Result` đánh số tương ứng.
- [ ] **3. Concrete Test Data:** 100% test data chứa giá trị cụ thể, không còn từ ngữ mơ hồ ("hợp lệ", "dữ liệu đúng").
- [ ] **4. Field Validation Coverage (đối soát theo BẢNG, không đếm theo số):** với **TỪNG** input field, mở đúng dòng loại field trong **Bảng Field-Level Validation Checklist (15 loại)** và đối soát **đủ từng mục** của dòng đó. Mục nào không áp dụng phải **ghi lý do một dòng**, không được im lặng bỏ qua.
  > 🚨 `≥1 Positive + 2 Negative` là **sàn tối thiểu, KHÔNG phải mức đạt**. Trường Password có 7 mục trong bảng — sinh 3 TC rồi dừng là **trượt tiêu chí này**, dù về số lượng vẫn qua sàn. Đây chính là chỗ bộ TC bị nông mà vẫn xanh hết bảng.
  > Xuất kèm cột đối soát trong **Bảng Đối soát loại kiểm thử** dòng `V2 · Validation`: `đủ N/N mục bảng <loại field>`.
- [ ] **5. Automation Metadata Ready:** 100% test cases được gắn đầy đủ `Automation`, `Auto Type`, và `@Tag`. Cột `Automation` chấm theo [Tiêu chí chấm cột Automation](automation_criteria.md), **không** gắn `Yes` hàng loạt: TC chạm một tính năng ở bảng 3A mà vẫn `Yes` thì cách làm phải nằm trong bảng đó. Index có mục `## Đối soát cột Automation` — mọi TC `Partial` có điều kiện, mọi TC `No` có lý do, điều kiện đã gom thành danh sách cần chuẩn bị, TC vướng tạm thời ghi `⏸️ Hoãn` chứ không hạ cột.
  > Với **DELTA**: chỉ chấm lại TC đã sửa / thêm, cập nhật đúng các dòng đó trong mục đối soát.
- [ ] **6. Requirement Coverage (đối soát "đủ case"):** 100% REQ ID có **≥1 TC** trỏ về; REQ mức High Risk có đủ Positive + Negative + Boundary. Xuất **Bảng Đối Soát Coverage** kèm output:

```markdown
| REQ ID | Mô tả ngắn | Số TC | TC IDs | Đủ Positive/Negative/Boundary? |
|---|---|---|---|---|
| REQ-LOGIN-01 | Đăng nhập email | 5 | TC_001..TC_005 | ✅ |
| REQ-LOGIN-02 | Khóa sau 5 lần sai | 0 | — | 🔴 THIẾU — phải bổ sung trước khi xuất |
| REQ-LOGIN-27 · 40 | Gửi mail đặt lại · tự đăng nhập bằng cookie | 0 | — | ⚪ Ngoài phạm vi — `AMB-LOGIN-04` · `AMB-LOGIN-15` ⏭️, quyết định PO 18-08-2026 |
```
> Nếu có REQ nào 0 TC → agent PHẢI quay lại sinh bổ sung, KHÔNG được xuất kết quả có dòng 🔴.
>
> **Ngoại lệ — requirements đã loại khỏi phạm vi viết TC:** REQ ghi *ngoài phạm vi viết TC / kiểm thử*, REQ 🔴 Deprecated, phần thuộc mục `Ngoài phạm vi` của requirements, hoặc AMB `⏭️` quyết định *"bỏ qua, không viết TC"* / *"chuyển sang module X"* → **không** sinh TC (kể cả TC "cho đủ bảng" hay biến thể lén phủ phần đó), **không** tính 🔴. Ghi dòng `⚪ Ngoài phạm vi` kèm **mã quyết định** ở Bảng Đối Soát Coverage, và dòng *Phạm vi REQ* ở đầu index liệt kê các mã bị loại. Nhánh 4 vòng chỉ vắng vì phần đã loại → `⏭️` dẫn mã quyết định. Đây là nguồn mà `/review-testcases` đọc để **không** báo lại các phần đó thành gap.

  **6b. Phép thử chiều ngược — TC gánh nhiều REQ (BẮT BUỘC chạy, áp cả QUICK · FULL RBT · DELTA · `/generate-testcases-api`):**
  Bảng trên chỉ trả lời *"REQ nào chưa có TC"* — nó **không** bắt được TC gánh quá nhiều REQ. Với **mỗi TC có ≥ 2 REQ ID**, đếm số TC **của cùng nền tảng** trỏ về từng REQ đó:

  | Kết quả đếm trong một TC | Xử lý |
  |---|---|
  | Mọi REQ đều có TC khác chống lưng | ✅ Được giữ |
  | Đúng **1** REQ chỉ có mỗi TC này, các REQ còn lại có TC khác | ✅ Được giữ — FAIL của TC vẫn quy được về REQ đó. Ghi chú ở cột Ghi chú của Bảng Đối Soát Coverage |
  | **≥ 2** REQ chỉ có mỗi TC này | 🔴 **Vi phạm** bảng CẤM gộp (dòng *"Khác REQ ID mà mỗi REQ chỉ có đúng TC đó"*) → **tách**: TC gốc giữ 1 REQ, mỗi REQ còn lại một TC mới **cấp số nối tiếp dải** (không chèn giữa, không đánh lại) |

  > ⚠️ **Hay vi phạm nhất ở TC API**: một request chứng minh được nhiều REQ cùng lúc (VD `POST /api/login` không gửi token → `200` vừa là *"đăng nhập thành công"* vừa là *"đăng nhập không cần token"*). Gộp nghe hợp lý, nhưng khi FAIL không biết REQ nào hỏng, và RTM báo mỗi REQ "đã phủ" dù không TC nào **chỉ** kiểm nó. Mỗi REQ phải có một TC mà **Expected cốt lõi** của nó là đúng REQ đó.
  >
  > **Số TC ít hơn số REQ không phải là lỗi** (1 TC gộp nhiều biến thể, 1 REQ có nhiều TC) — nhưng khi thấy tỉ lệ này, **bắt buộc** chạy phép thử 6b trước khi trả lời user.

  Mẫu kiểm tự động (chạy trên file nền tảng / `parts/` của **từng** nền tảng):

  ```python
  import glob, re, collections
  R = []
  for f in glob.glob('docs/testcases/<module>/<nền-tảng>/**/*.md', recursive=True):
      for line in open(f, encoding='utf-8'):
          if line.startswith('| <HỆ_THỐNG>_<MODULE>_TC_'):
              c = line.split(' | ')
              R.append((c[0][2:], re.findall(r'REQ-[\w-]+?-(\d+)', c[1])))
  cnt = collections.Counter(q for _, reqs in R for q in reqs)
  print([tc for tc, reqs in R if sum(cnt[q] == 1 for q in reqs) >= 2] or 'không vi phạm')
  ```

- [ ] **7. Evidence-verified:** đã mở **100%** ảnh trong `docs/requirements/<module>/<nền-tảng>/evidence/`; mọi TC thuộc 4 nhóm bắt buộc (bố cục/thứ tự · nhãn nguyên văn · giá trị mặc định · định dạng hiển thị) đều truy được về một tấm ảnh cụ thể **hoặc một lần đọc DOM cụ thể**. TC không truy được → gắn `@NeedsVerify` và liệt kê ở mục "Vùng chưa có evidence". Xuất kèm **Bảng Đối Soát Evidence**:

```markdown
| Ảnh evidence | Màn hình / trạng thái | TC dựa vào | Đầy đủ? |
|---|---|---|---|
| project_new_form_default_fullpage.png | Form tạo — mặc định | TC_041→050 | ✅ full-page |
| project_new_form_1920x1080.png | Form tạo — mặc định | TC_092→095 | 🔴 CẮT CỤT tại "Description" — thiếu editor, checkbox email, nút Save |
| (không có) | Form tạo — dropdown Customer đang mở | TC_060→063 | 🔴 THIẾU — TC gắn @NeedsVerify |
```
> Có dòng 🔴 → **vẫn xuất được** bộ TC, nhưng phải nêu rõ ở tóm tắt cuối và đề xuất recon bổ sung. KHÔNG được im lặng bỏ qua.

- [ ] **8. Ngôn ngữ kiểm chứng (theo [Quy Tắc Ngôn Ngữ Kiểm Chứng](#quy-tắc-ngôn-ngữ-kiểm-chứng-bắt-buộc--áp-dụng-cả-4-modes)):** grep toàn file, phần TC chính **không còn** `document.`, `querySelector`, `checkValidity`, `offsetParent`, `className`, `getAttribute`, `$(`, `input#`, `[type=`, mã HTTP, tên header, selector CSS/XPath (trừ TC có `Auto Type` = `API`). Mọi nội dung cấp kỹ thuật còn lại nằm dưới `🔧 Ghi chú kỹ thuật (cần DevTools):` và TC đó mang tag `@TechCheck`. **Phép thử cuối:** che hết dòng `🔧 Ghi chú kỹ thuật` → mọi TC vẫn chạy và chấm PASS/FAIL được.

- [ ] **9. Rà soát đặc tính chất lượng (ISO/IEC 25010:2023)** — áp dụng **QUICK · FULL RBT · DELTA**, KHÔNG áp dụng CHECKLIST: đã chấm đủ **9/9 đặc tính**, không ô nào trống. Ô `➖` có ghi **ai chịu trách nhiệm** (không chỉ ghi "ngoài phạm vi" trơn). Ô 🔴 phải bổ sung TC **trước khi xuất**. Bảng rà soát đặt ở cuối tài liệu TC.
  > Với **DELTA**: chỉ chấm lại đặc tính bị ticket chạm tới, giữ nguyên phần còn lại của bảng — không rà lại cả module.

- [ ] **10. Đối soát loại kiểm thử 4 vòng** (theo [Bản Đồ Loại Kiểm Thử — 4 Vòng](#bản-đồ-loại-kiểm-thử--4-vòng-bắt-buộc--khung-sinh-tc-cho-quick--full-rbt--delta)) — áp dụng **QUICK · FULL RBT · DELTA**, KHÔNG áp dụng CHECKLIST:
  - Đã chấm **mọi nhánh** của cả 4 vòng, không ô nào trống. Xuất **Bảng Đối soát loại kiểm thử** đặt cuối tài liệu TC, **trước** bảng ISO 25010
  - Ô `➖` ghi **lý do kỹ thuật**; ô `⏭️` ghi **lý do + ai quyết định + điều kiện rà lại**; ô 🔴 phải bổ sung TC **trước khi xuất**
  - **`➖` và `⏭️` không được dùng lẫn** — `➖` là sự thật kỹ thuật (hệ thống không có cái đó), `⏭️` là quyết định chấp nhận rủi ro. Ghi `➖` cho thứ thật ra là `⏭️` là **giấu quyết định**
  - Mức rủi ro đã chấm và **độ sâu tương ứng** (Đầy đủ / Tiêu chuẩn / Tối giản) phải ghi ở đầu tài liệu TC, kèm dòng **"Nâng lên khi…"**
  - **Ba nhánh không bao giờ được `➖`:** `UI cơ bản` (V1) · `Validation` (V2, khi có field nhập) · `Permission` (V3, khi có ≥2 role)
  - Độ hạt **GỘP** → cột dẫn chứng ghi **cả số TC và số biến thể**: `TC_001–TC_003 (3 TC · 11 biến thể)`. Thiếu số biến thể = không kiểm chứng được gộp có làm rụng case hay không
  > Với **DELTA**: chỉ chấm lại nhánh bị ticket chạm tới, giữ nguyên phần còn lại của bảng.
