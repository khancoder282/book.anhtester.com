## Độ Hạt Test Case — GỘP / TÁCH (BẮT BUỘC chốt TRƯỚC batch đầu tiên, áp dụng QUICK · FULL RBT · DELTA)

Cùng một module, cùng một mức bao phủ, số TC có thể chênh nhau **gấp đôi** chỉ vì độ hạt. Một module đăng nhập viết ở độ hạt vụn ra 80+ TC, viết ở độ hạt gộp ra ~40 TC — **độ phủ REQ y hệt nhau**. Đây là **lựa chọn trình bày**, không phải lựa chọn chất lượng, và phải được chốt trước khi ghi dòng TC đầu tiên.

> Mode CHECKLIST không có tuỳ chọn này — bản thân nó đã là dạng gộp tối đa.

### Hai độ hạt

| | **GỘP** (consolidated) — ⭐ mặc định | **TÁCH** (granular) |
|---|---|---|
| Nguyên tắc | Các biến thể cùng nhóm nằm chung 1 TC, liệt kê trong **Bảng biến thể** | 1 biến thể = 1 TC |
| Số TC điển hình (module cỡ login) | 35–45 | 75–90 |
| Đọc & review | Nhanh — nhìn 1 TC thấy cả nhóm rủi ro | Chậm — phải lướt hàng chục dòng gần giống nhau |
| Chạy tay | Nhanh — mở form 1 lần, chạy hết biến thể | Chậm — lặp lại setup cho từng TC |
| Báo cáo khi FAIL | Phải ghi rõ **biến thể nào** fail | Tự động chỉ đúng TC fail |
| Sang automation | Map thành **test data-driven** (`@DataProvider` · `test.each` · `parametrize`) | Map thành **1 test method / TC** |
| Đếm pass-rate | Thô hơn — 1 biến thể đỏ là cả TC đỏ | Chi tiết từng biến thể |

**Chọn TÁCH khi có ít nhất một trong các điều kiện sau** — ngoài ra luôn dùng GỘP:

- Khách hàng / quy trình yêu cầu **mỗi TC là một dòng** trong Jira, TestRail, Xray (tính công theo số TC, hoặc gán người thực hiện theo từng TC)
- Cần **pass-rate theo từng biến thể** để báo cáo chất lượng
- Module thuộc diện **kiểm định / audit** cần vết thực thi rời cho từng case
- User yêu cầu rõ

### Hai kiểu gộp được phép

**Kiểu A — Gộp biến thể dữ liệu** (dùng cho validation, đây là kiểu chiếm phần lớn số TC cắt được):

Điều kiện: các case **cùng chuỗi thao tác** và **cùng loại phản hồi**, chỉ khác **giá trị đầu vào** (và có thể khác precondition, miễn ghi rõ trong bảng).

```markdown
| TC ID | ... | Test Steps | Bảng biến thể | Priority | ... |
| CRM_LOGIN_TC_012 | ... | 1. Mở /admin/authentication<br>2. Nhập Email theo biến thể<br>3. Nhập Password `Abc12345`<br>4. Bấm `Login`<br>5. Quan sát ô Email và trạng thái trang | **Mọi biến thể cho cùng kết quả:** trình duyệt hiện cảnh báo ngay cạnh ô Email · trang **không** nạp lại, vẫn ở trang đăng nhập · dữ liệu đã nhập ở cả hai ô còn nguyên<br><br>`a` Thiếu `@` → `abc`<br>`b` Thiếu tên miền → `abc@`<br>`c` Thiếu phần trước `@` → `@example.com`<br>`d` Nhiều `@` → `a@b@example.com`<br>`e` Chuỗi tiêm SQL → `admin@example.com' OR '1'='1` | High | ... |
```

**Kiểu B — Gộp kiểm tra tĩnh cùng màn hình** (dùng cho TC cấu trúc / hiển thị):

Điều kiện: cùng precondition, **mọi mục đều là quan sát không làm thay đổi trạng thái** (nhìn màn hình). Mỗi mục là một dòng trong **Bảng kiểm**, có đánh số và ghi REQ tương ứng.

```markdown
| CRM_LOGIN_TC_002 | REQ-LOGIN-02, REQ-LOGIN-03 | ... | 1. Mở /admin/authentication, KHÔNG nhập gì<br>2. Đối chiếu từng mục trong Bảng kiểm | **Bảng kiểm — mọi mục phải đạt:**<br>`1` (REQ-02) Thấy đủ ô `Email Address`, ô `Password`, ô tích `Remember me`, nút `Login`, liên kết `Forgot Password?`<br>`2` (REQ-02) Gõ vào ô Password thì hiện dấu chấm che, không hiện chữ<br>`3` (REQ-03) Con trỏ nhấp nháy sẵn trong ô Email — gõ được ngay, không cần bấm chuột | ... |
```

> Kiểu B **KHÔNG** áp dụng cho hành vi (bấm, gửi, điều hướng) — chỉ cho quan sát tĩnh. Một mục làm đổi trạng thái là phải tách thành TC riêng.

### CẤM gộp — bất kể độ hạt nào đang dùng

| Trường hợp | Vì sao |
|---|---|
| **Khác trường nhập liệu** (Email với Password, Ngày với Số tiền) | FAIL không chỉ ra được trường nào hỏng — mất luôn giá trị chẩn đoán. *Ngoại lệ duy nhất:* TC mục đích là **độ bền** (hệ thống không sập với dữ liệu bất thường), không phải validate trường — khi đó dấu hiệu FAIL là HTTP 500 và bảng biến thể chỉ ngay ra input gây lỗi |
| **Khác LOẠI phản hồi** (một biến thể bị trình duyệt chặn, một biến thể tới máy chủ rồi báo lỗi; một cái lỗi, một cái thành công) | Hai cơ chế khác nhau, gộp lại thì expected result không còn phát biểu được thành một câu |
| Gộp TC `@Smoke` / `Critical` với TC thuộc **nhóm hành vi khác** | Bộ smoke cần vết thực thi rời cho từng luồng sống còn — đây là thứ chạy đầu tiên khi có sự cố. *Được phép:* gộp các **biến thể của cùng một hành vi** (VD cùng phép chặn URL, khác URL) — khi đó bảng biến thể phải ghi rõ biến thể nào thuộc bộ smoke |
| **TC được thiết kế để FAIL** (bám REQ ghi kỳ vọng đúng trong khi hệ thống đang lỗi) | Mỗi TC loại này gắn với **một** bug riêng; gộp là mất ánh xạ TC ↔ bug |
| **Khác REQ ID mà mỗi REQ chỉ có đúng TC đó** | Gộp xong REQ vẫn "có TC" nhưng không còn TC nào **chỉ** kiểm nó → Bảng Đối Soát Coverage mất ý nghĩa. Được gộp khi REQ liên quan còn TC khác chống lưng, và Bảng kiểm ghi rõ REQ ở từng dòng |
| **Khác nhóm chức năng / khác màn hình** | Gộp xuyên nhóm làm hỏng ranh giới tách `parts/` và ranh giới giao việc |

### Ràng buộc bắt buộc khi dùng GỘP

- **Mỗi biến thể có mã riêng** (`a`, `b`, `c`…) — báo cáo FAIL phải ghi được `CRM_LOGIN_TC_012-c`, nếu không thì gộp là mất truy vết
- **Cột `REQ ID` liệt kê đủ mọi REQ** mà TC chạm tới, phân cách `,`
- **Trần 6 biến thể / TC.** Vượt thì tách theo nhóm rủi ro — 12 dòng biến thể trong một ô bảng là không ai đọc nổi
- **Bảng Đối Soát Coverage vẫn tính theo REQ**, không tính theo TC — mọi REQ trong phạm vi vẫn phải có ≥1 TC
- Số TC giảm **không được** kéo theo giảm số **case** kiểm. Gộp là đổi cách trình bày; biến thể bị bỏ đi là **giảm độ phủ** — vi phạm Quality Gate
- **Đếm và công bố số biến thể.** Bảng Đối soát loại kiểm thử ghi `<số TC> TC · <số biến thể>` ở mọi dòng ✅, và dòng tóm tắt cuối chat ghi tổng `<N> TC · <M> biến thể`. Không có con số này thì gộp trở thành cái cớ để rụng case mà không ai phát hiện — Bảng Đối Soát Coverage đếm theo REQ nên **không bắt được**

### Đổi độ hạt của bộ TC đã có

Đổi độ hạt là **đánh lại toàn bộ TC ID**. Vì vậy:

| Tình huống | Cách làm |
|---|---|
| Bộ TC vừa sinh, **chưa** có automation / execution report / RTM nào trỏ vào | Sinh lại ở độ hạt mới, TC ID đánh lại từ `001`, ghi **mốc git** của bản cũ. Ghi lý do vào Nhật ký thay đổi |
| Đã có script `allure.label('testId', ...)`, execution report hoặc RTM trỏ vào | 🚫 **KHÔNG đổi độ hạt.** Đổi là cắt cả ba mối nối cùng lúc và không có cách phát hiện tự động. Muốn gọn hơn thì sinh **checklist** (Mode CHECKLIST) để chạy tay, giữ nguyên bộ TC làm nguồn cho automation |

> 📌 Vì vậy **chốt độ hạt ở lượt sinh đầu tiên** là rẻ nhất. Agent phải nêu rõ độ hạt đang dùng ngay ở dòng kế hoạch batch đầu ra chat.
