## Output Format

### Mode QUICK

| Output | Mô tả |
|--------|--------|
| Mục Assumptions | Các giả định đã áp dụng khi requirement mơ hồ (ASM-XX) — gồm cả xung đột tài liệu ↔ evidence |
| Bảng TC Markdown | Test Cases đầy đủ (có cột REQ ID), sẵn sàng copy sang Excel/Jira |
| Bảng Đối Soát Coverage | Mỗi REQ ID × số TC × đủ Positive/Negative/Boundary (tiêu chí 6) |
| **Bảng Đối Soát Evidence** | Mỗi ảnh × màn hình/trạng thái × TC dựa vào × đầy đủ hay cắt cụt (tiêu chí 7) |
| **Vùng chưa có evidence** | Danh sách màn hình/trạng thái không có ảnh chống lưng + TC bị gắn `@NeedsVerify` |
| **Bảng Đối soát loại kiểm thử (4 vòng)** | Mọi nhánh của V1–V4 × ✅/➖/⏭️/🔴 × TC ID (kèm số biến thể nếu GỘP) hoặc lý do (➖) · lý do + ai quyết + điều kiện rà lại (⏭️) (tiêu chí 10) |
| **Bảng rà soát đặc tính chất lượng** | 9 đặc tính ISO/IEC 25010:2023 × ✅/➖/🔴 × TC ID hoặc lý do (tiêu chí 9) |
| **Đối soát cột Automation** | Đếm Yes/Partial/No/⏸️ Hoãn theo nền tảng + điều kiện cần chuẩn bị + TC Partial/No/Hoãn kèm lý do (tiêu chí 5) |

### Mode FULL RBT

| Bước | Output |
|------|--------|
| 1 | Xác nhận bối cảnh + **Danh mục Evidence đã mở** |
| 2 | Luồng + Ambiguities + Câu hỏi Q&A (gồm xung đột tài liệu ↔ evidence) |
| 3 | Module Decomposition + Dependencies |
| 4 | Traceability Matrix + High-Level Scenarios **xếp theo 4 vòng** (mỗi nhánh chấm sơ bộ ✅/➖/⏭️) + **mức rủi ro · độ sâu** từng Module |
| 5 | Test Cases chi tiết (REQ ID + Risk Level + Test Data), sinh **tuần tự V1 → V4** |
| 6 | Bảng Markdown chuẩn (Jira/Excel ready) + Bảng Đối Soát Coverage + **Bảng Đối Soát Evidence** + **Bảng Đối soát loại kiểm thử (4 vòng)** + **Bảng rà soát đặc tính chất lượng (ISO/IEC 25010:2023)** + **Đối soát cột Automation** |

### Mode CHECKLIST

| Output | Mô tả |
|--------|--------|
| Header checklist | Loại checklist + module + số mục + thời gian chạy ước tính + **Mã checklist** + dòng **Trạng thái lấy từ** |
| Bảng Checklist | Nhóm theo Module → Nhóm chức năng, có cột `Trạng thái` (`☐` hoặc kết quả đã chạy), Priority, REQ ID, TC ID liên quan, `Execution ID` — Release-readiness thêm cột `Module` |
| Ghi chú "Không áp dụng" | Component có trong bảng chuẩn nhưng module không có → nêu rõ, không bỏ im lặng |
| Bảng ký nhận | Môi trường · Build/Version · Người thực hiện · Ngày · Kết quả |

> **Nơi ghi file — nhánh `docs/checklists/`, có tầng nền tảng như `testcases/`:**
>
> | Loại | Đường dẫn |
> |---|---|
> | Smoke · Regression (module) | `docs/checklists/<module>/<nền-tảng>/checklist_<loại>_<YYYYMMDD>.md` |
> | Post-hotfix | `docs/checklists/<module>/<nền-tảng>/checklist_post-hotfix_<TICKET-ID>.md` — gắn với bản vá, hai hotfix cùng ngày không đè nhau |
> | Release-readiness (cắt ngang nhiều module) | `docs/checklists/_release/<nền-tảng>/checklist_release_<mốc>.md` — `<mốc>` cùng slug với `docs/test-plans/test_plan_<mốc>.md`. Đợt release có nhiều nền tảng → **mỗi nền tảng một file**, vì mỗi lần chạy thuộc đúng một nền tảng |
>
> `_release/` đóng vai **module giả** cho mọi nhánh phía sau (`executions/_release/<nền-tảng>/`) — dấu `_` đầu = không phải module, workflow quét module bỏ qua. `<loại>` viết thường: `smoke` · `regression` · `post-hotfix` · `release`. Checklist là **ảnh chụp tại một thời điểm**, không sửa tại chỗ như bộ TC: lần rà mới sinh file mới theo ngày/ticket/mốc. Cùng ngày chạy lại đúng loại đó → ghi đè file của ngày đó (chưa ai tick). Nguồn TC-based **bỏ qua TC `@Deprecated`**.
>
> 📄 **Checklist là tài liệu đọc/in trực tiếp, KHÔNG nạp vào `scripts/testcases-viewer`.** Viewer đó chỉ đọc bảng test case chi tiết (`test_cases_*.md`); checklist cố tình không có `Test Steps` / `Test Data` / `Risk Level` nên nạp vào chỉ ra bảng rỗng. Vì vậy header checklist **được phép** đặt Tiếng Việt cho người tick tay (`Hạng mục kiểm tra`, `Kết quả kỳ vọng`, `TC ID liên quan`) — nó không chịu hợp đồng đọc của viewer như bảng TC.

### Mode DELTA

| Output | Mô tả |
|--------|--------|
| `impact/impact_plan_<TICKET-ID>.md` | Bảng ánh xạ REQ → TC (✅ chắc chắn / ⚠️ suy luận / ❓ chưa có TC) + kế hoạch sửa từng TC + tác động lan toả |
| File nền tảng đã sửa (+ index cập nhật) | Sửa **tại chỗ**, tên file không đổi, TC ID giữ nguyên |
| Mốc git trước khi sửa | Hash commit của từng file nền tảng — ghi ở Nhật ký và `delta_tc_` để đối chiếu |
| **Bảng Đối soát loại kiểm thử (4 vòng)** | Cập nhật **chỉ nhánh ticket chạm tới** ở cuối index — phần còn lại giữ nguyên |
| **Đối soát cột Automation** | Chấm lại cột `Automation` của TC đã sửa / thêm, cập nhật đúng các dòng đó trong mục đối soát của index |
| Nhật ký thay đổi | Bảng ở cuối file TC: ngày · ticket · TC bị ảnh hưởng · **vòng · nhánh** · thay đổi · mốc git |
| **`impact/delta_tc_<TICKET-ID>.md`** | Delta TC List — **chỉ ghi ở APPLY**, cột **Nền tảng** + **Vòng · Nhánh** + hành động `✏️` / `➕` / `🗑️` / `⏸️`, ghi mốc git từng nền tảng. Input **bắt buộc** của `/update-automation-from-impact`; chat chỉ hiện tóm tắt + đường dẫn. Mẫu đầy đủ ở workflow `/update-testcases-from-impact` Bước 6 |
| Danh sách ngoài phạm vi | REQ 🟢 chưa có TC + workflow tiếp theo |

Tất cả output phải bằng **Tiếng Việt**, format **Markdown**, và tuân thủ **Quy Tắc Xuất File & Theo Dõi Tiến Độ**: ghi thẳng vào file (`docs/testcases/` hoặc `docs/checklists/`), chat chỉ hiện tiến độ + Bảng Đối Soát Coverage + tóm tắt đường dẫn file.
