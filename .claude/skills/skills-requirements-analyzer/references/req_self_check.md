## 4.3. Cổng Tự Soát REQ (BẮT BUỘC — chạy trước khi ghi file)

> **Vì sao có mục này.** Ambiguity (4.1) bắt cái **tài liệu/hệ thống không nói rõ**. Mục này bắt cái **chính agent vừa viết sai** — loại lỗi nguy hiểm hơn vì nó *trông như* đã kiểm chứng, có số liệu DOM hẳn hoi, và không workflow nào phía sau phát hiện được. Test case sinh ra từ một AC sai sẽ đỏ mà không ai biết lỗi nằm ở tài liệu.
>
> Rà **từng REQ** qua 9 câu hỏi dưới. Câu nào trả lời "không" → sửa REQ, không phải mở AMB.

### 4.3.1. Tên REQ và AC phải là **cùng một mệnh đề**

Tên REQ là thứ người viết test case đọc trước tiên — và nhiều người chỉ đọc tên. Tên hứa một đằng, AC đo một nẻo là lỗi nặng nhất của tài liệu requirements.

| ❌ Sai | Vì sao | ✅ Sửa |
|---|---|---|
| Tên: *"Không giữ lại email sau khi đăng nhập lỗi"* · AC: *"HTML trả về không có thuộc tính `value`"* | Người dùng **vẫn thấy** email vì trình duyệt tự điền. Tên mô tả hành vi người dùng, AC đo tầng HTML — hai thứ khác nhau | Đổi tên thành *"Máy chủ không trả lại giá trị email…"* và ghi rõ **cấm** assert ô rỗng trên màn hình |
| Tên: *"Hai lối đăng xuất"* · AC: *"tồn tại 2 phần tử `li.header-logout`"* | Đếm node DOM ≠ người dùng dùng được 2 lối | Kiểm khả dụng thật (4.3.5) rồi đặt tên theo kết quả |

**Luật:** đọc tên REQ, tự hỏi *"AC này có chứng minh đúng câu vừa đọc không?"* Không → sửa **tên** hoặc sửa **AC**, không để lệch.

### 4.3.2. Khẳng định phủ định phải kiểm bằng **trạng thái sạch**

Mệnh đề dạng *"không sinh X"* · *"không gửi Y"* · *"không lưu Z"* **không** chứng minh được bằng cách quan sát "giá trị không đổi".

```
❌ SAI:  Đăng nhập lần 2 → giá trị cookie không đổi → kết luận "không cấp cookie mới"
         (không phân biệt được: không cấp · cấp lại trùng giá trị · không đụng tới cái cũ)

✅ ĐÚNG: (1) xoá sạch tác tạo → (2) xác nhận đã sạch → (3) thực hiện hành động
         → (4) kiểm tác tạo có xuất hiện không
```

AC phải ghi **đủ 4 bước theo thứ tự**, để người khác chạy lại được. Thiếu bước (2) là phép thử vô hiệu — trạng thái sót từ lần chạy trước sẽ làm nhiễu.

### 4.3.3. AC không được chứa giá trị **biến thiên theo phiên**

Token · session id · CSRF token · id bản ghi vừa tạo · timestamp · số thứ tự tự tăng — chép giá trị cụ thể vào AC gây **hai** hậu quả:

1. Test case sinh ra hardcode giá trị đó → hỏng ngay lần chạy sau
2. Nếu là giá trị bí mật → **phát tán credential** (xem 7.1)

**Luật:** ghi **hình thái**, không ghi giá trị. `<16 ký tự hex>` · `a:2:{s:7:"user_id";s:1:"<id>";…}` · `độ dài = 32`. Cần khẳng định tính duy nhất thì mô tả **quan hệ** (*"khác giá trị trước đó"*), không chép cả hai giá trị.

### 4.3.4. Một REQ = **một** rule kiểm được độc lập

Dấu hiệu nhận biết REQ đang gộp: tên chứa **"và"**, **"hoặc"**, dấu phẩy nối hai mệnh đề; hoặc AC dùng **một** input để kiểm **nhiều** rule cùng lúc.

```
❌ "Email không phân biệt hoa thường VÀ bỏ qua khoảng trắng"
   AC: nhập "  ADMIN@Example.COM  " → đăng nhập được
   → fail thì không biết rule nào hỏng

✅ REQ-a: không phân biệt hoa thường  → input "ADMIN@Example.COM"
   REQ-b: bỏ qua khoảng trắng đầu/cuối → input "  admin@example.com  "
```

Tách ra thì **giữ nguyên mã cũ** cho rule ở lại, cấp mã mới cho phần tách (mục 2.1) — không đánh lại cả cụm.

### 4.3.5. Tồn tại trong DOM ≠ **người dùng dùng được**

Đây là cái bẫy lớn nhất khi recon bằng `browser_evaluate`. `querySelectorAll(...).length === 2` **không** có nghĩa người dùng có 2 lựa chọn: phần tử có thể bị ẩn theo responsive, bị `display:none` ở tổ tiên, nằm ngoài luồng bố cục, hoặc bị phần tử khác che.

**Trước khi khai một phần tử là "người dùng thao tác được", BẮT BUỘC đọc thêm:**

| Kiểm | Cách đọc | Ý nghĩa khi sai |
|---|---|---|
| Có được render không | `el.offsetParent === null` | `null` → **không** render (hoặc `position:fixed`) |
| Kích thước thật | `getBoundingClientRect()` | `0×0` → không bấm được |
| Tổ tiên nào ẩn | Duyệt ngược `parentElement`, đọc `getComputedStyle().display` | Chỉ ra **lý do** ẩn: responsive · quyền · trạng thái |
| Viewport đang đo | `innerWidth × innerHeight` | Kết luận chỉ đúng với **viewport đó** — phải ghi vào AC |

Phần tử chỉ hiện ở viewport khác → **không** kết luận thay cho viewport đó. Mở một `AMB-<MODULE>-XX` yêu cầu recon riêng, đừng suy diễn.

**Nhánh Mobile (3.5) — cùng cái bẫy, khác thuộc tính:** có node trong hierarchy ≠ người dùng bấm được. Đọc `displayed` · `enabled` · `bounds` (kích thước `0×0`, hoặc nằm ngoài màn hình) · có bị **bàn phím** hay dialog che không. Kết luận chỉ đúng với **thiết bị + hướng màn hình** đang đo — ghi vào AC.

**Kèm theo — bẫy locator do cấu trúc lồng:** trước khi ghi *"mục cuối cùng của X"*, đếm phần tử **lồng bên trong**. `X li:last-child` bắt cả `<li>` lồng ở submenu; `X > li:last-child` mới là con trực tiếp. Ghi rõ dấu `>` vào AC, kèm số phần tử lồng đếm được.

### 4.3.6. Chuỗi do **trình duyệt / hệ điều hành** sinh không phải hành vi ứng dụng

Thông báo validation mặc định của HTML5, tiêu đề trang lỗi mặc định, hộp thoại `alert/confirm` gốc, định dạng ngày theo locale — tất cả **đổi theo trình duyệt, phiên bản và ngôn ngữ hệ điều hành**.

**Luật:** được phép ghi lại nguyên văn để tham khảo, nhưng **phải** kèm tên + phiên bản trình duyệt đã quan sát, và **ghi rõ cấm dùng làm assertion**. AC chỉ được assert phần ứng dụng kiểm soát (`checkValidity() === false`, request có được gửi đi không).

Bảng metadata của tài liệu (6.1) **phải** có dòng **Trình duyệt khảo sát** ghi rõ tên + viewport.

**Nhánh Mobile (3.5):** hộp thoại xin quyền, date/time picker hệ thống, bàn phím, thông báo "App không phản hồi", chuỗi của share sheet — đều do **hệ điều hành** sinh, đổi theo phiên bản OS, hãng máy và ngôn ngữ máy. Cùng luật: được ghi tham khảo kèm **OS + phiên bản + hãng máy**, cấm dùng làm assertion; dòng **Thiết bị khảo sát** thay cho Trình duyệt khảo sát.

### 4.3.7. Không assert khớp tuyệt đối lên giá trị có **phần động**

`document.title` mang tiền tố đếm thông báo · `body.className` mang token theo trình duyệt hoặc theo cấu hình · id sinh động · text có chèn số đếm.

**Luật:** đọc **giá trị đầy đủ** rồi tự hỏi *"phần nào có thể đổi giữa hai lần chạy hoặc hai môi trường?"* AC ghi `**chứa** <phần bất biến>` kèm ghi chú phần nào là động và vì sao. Ghi `= "<giá trị hôm nay>"` là bẫy cho lượt sinh TC.

### 4.3.8. Tính năng sinh ra **tác tạo** phải kiểm chứng tác tạo **có tác dụng**

Cookie ghi nhớ · email gửi đi · tệp xuất ra · bản ghi lịch sử · thông báo đẩy — recon rất dễ dừng ở *"đã được tạo ra"* rồi coi là xong. Nhưng **giá trị nghiệp vụ nằm ở chỗ nó dùng được**, và đó mới là thứ có thể hỏng âm thầm.

**Luật:** mỗi tác tạo cần **tối thiểu 2 REQ** — một cho *được tạo đúng hình thái*, một cho *dùng được đúng mục đích*. Không kiểm chứng được vế thứ hai thì vẫn **phải** cấp REQ ở trạng thái ⚪ kèm `AMB-<MODULE>-XX`, tuyệt đối không im lặng bỏ qua. Im lặng bỏ qua khiến cả tính năng không có test case nào mà bảng độ phủ vẫn báo xanh.

### 4.3.9. Mã trạng thái / hành vi kỹ thuật bất thường phải **nghi ngờ nhất quán**

Mã HTTP lệch quy ước (chuyển hướng xác thực trả `307` thay vì `302/303`; body ghi `419` nhưng header trả `403`), phản hồi rỗng, `500` ở luồng người dùng chạm tới — đều là dấu hiệu.

**Luật:** đã mở AMB cho một bất thường thì **mọi** bất thường cùng loại trong tài liệu cũng phải được đối xử như vậy. Nghi ngờ chỗ này mà chép nguyên chỗ kia là mâu thuẫn nội tại. Chưa loại trừ được khả năng do **công cụ đo** ghi nhận sai thì AC không được assert giá trị đó — assert cái quan sát được chắc chắn (điểm dừng, nội dung hiển thị).

### 4.3.10. Bảng kiểm nhanh trước khi ghi file

- [ ] Mỗi REQ: tên và AC **cùng một mệnh đề** (4.3.1)
- [ ] Mọi khẳng định phủ định có **phép thử trạng thái sạch đủ 4 bước** (4.3.2)
- [ ] Không AC nào chứa token / id / timestamp **cụ thể** (4.3.3)
- [ ] Không REQ nào có "và"/"hoặc" nối hai rule trong tên (4.3.4)
- [ ] Mọi phần tử khai là "dùng được" đã đọc `offsetParent` + kích thước + viewport (4.3.5)
- [ ] Mọi chuỗi của trình duyệt đã ghi tên trình duyệt + đánh dấu cấm assert (4.3.6)
- [ ] Mọi giá trị có phần động dùng `chứa`, không dùng `=` (4.3.7)
- [ ] Mọi tác tạo có đủ REQ *tạo ra* **và** REQ *dùng được* (4.3.8)
- [ ] Bất thường kỹ thuật được nghi ngờ nhất quán trong toàn tài liệu (4.3.9)
