# Thang điểm Quality Insights

> Nguồn sự thật của mọi ngưỡng và trọng số mà `scripts/quality-insights/qi.py` dùng. Đổi ở đây thì **đổi cả hằng số trong script** (`SEV_WEIGHT`, `LEVEL_PTS`, `PRIO_PTS`, `DEFAULT_MIN_PER_TC`, `LOW_SAMPLE` và các lệnh `band(...)`), rồi ghi một dòng Nhật ký ở cuối file.
>
> Dự án có quy định riêng (Master Test Plan ghi thang rủi ro khác) → dùng quy định đó, ghi vào mục *Phương pháp* của báo cáo.

---

## 1. Trọng số severity — điểm lỗi mở

| Severity | Trọng số | Lý do |
|---|---|---|
| Critical | 5 | Chặn luồng chính / bảo mật — một lỗi đủ đẩy đơn vị lên rủi ro cao |
| Major | 3 | Hỏng chức năng có đường vòng |
| Minor | 1 | Sai nhưng không chặn |
| Trivial | 0,5 | Hình thức |

Chỉ tính lỗi **chưa đóng**: 🔴 Đang mở · 🟡 Đã fix chờ retest · ⚠️ Cần rà lại. ⚪ *Không phải lỗi* không tính ở đâu cả (vẫn hiện ở bảng để biết tỉ lệ báo nhầm).

---

## 2. Rủi ro release — năm yếu tố, mỗi yếu tố 0–3

| Yếu tố | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **C** Thay đổi (REQ thêm/sửa/bỏ áp lên nền tảng này) | 0 REQ | 1–2 | 3–5 | > 5, **hoặc** có REQ bị bỏ |
| **D** Lỗi mở (điểm trọng số) | 0 | ≤ 2 | ≤ 6 | > 6, **hoặc** có lỗi Critical mở |
| **I** Bất ổn (kết quả gần nhất của từng TC) | 0 % fail | ≤ 5 % | ≤ 20 % | ≥ 20 %, **hoặc** có TC 🆕 mới fail / 🎲 lật. **Chưa có lần chạy → 2 ⬛** |
| **G** Khoảng trống thực thi (% TC còn hiệu lực đã chạy ≥ 1 lần) | > 90 % | 60–90 % | 30–60 % | < 30 %, **hoặc** chưa có TC. Có REQ đổi chưa có TC → **ít nhất 2** |
| **B** Tầm ảnh hưởng (% TC chấm Risk Level High/Critical) | < 25 % | 25–50 % | 50–75 % | ≥ 75 %. **Chưa có TC → 2 ⬛** |

REQ đổi "áp lên nền tảng này" = REQ đó có TC ở nền tảng này; REQ chưa có TC ở đâu thì tính cho mọi nền tảng của module.

```
Khả năng  = 1 + (C + D + I + G) / 12 × 4      → 1..5
Tác động  = 1 + B / 3 × 4                    → 1..5
Điểm      = Khả năng × Tác động              → 1..25
🔴 Cao ≥ 15 · 🟠 Trung bình 8 – 14,9 · 🟢 Thấp < 8
Còn lỗi Critical mở → ít nhất 🔴 (ghi chú ¹)
Chưa có TC nào   → ít nhất 🔴 (ghi chú ¹) — đơn vị trong phạm vi mà không có bằng chứng kiểm thử
```

**Vì sao B lấy từ `Risk Level` của TC:** đó là mức tác động nghiệp vụ QA đã chấm có căn cứ ở bước RBT (`skills-rbt-manual-testing` mục *Độ sâu theo rủi ro*). Dùng lại để không chấm tác động hai lần theo hai cách khác nhau.

**Vì sao thiếu dữ liệu tính 2 chứ không phải 3:** 3 dành cho bằng chứng xấu thật. Thiếu dữ liệu đặt đơn vị ở mức *đáng nghi* — đủ để không bị xếp 🟢, nhưng không vượt mặt đơn vị có lỗi Critical thật.

---

## 3. Chọn test — điểm từng TC

| Thành phần | Điểm |
|---|---|
| Trỏ thẳng REQ đổi | **+40** (và vào nhóm *Bắt buộc*) |
| Cùng module có thay đổi, không trỏ REQ đổi | +10 |
| Risk Level | Critical +20 · High +15 · Medium +8 · Low +3 |
| Priority | Critical +15 · High +10 · Medium +5 · Low +2 |
| `@Smoke` | +10 (và vào nhóm *Smoke* nếu chưa *Bắt buộc*) |
| `@CriticalPath` | +10 |
| Chưa chạy lần nào | +10 |
| 🆕 Mới fail ở lần chạy gần nhất | +20 (và *Bắt buộc*) |
| 🎲 Lật PASS↔FAIL ≥ 2 lần | +10 |
| Lần gần nhất BLOCKED | +8 |
| Bug liên quan **đã fix, chờ retest** | +25 (và *Bắt buộc*) |
| Bug liên quan **còn mở, chưa fix** và lần trước FAIL | −15 (và hạ về *Theo điểm*) |

Loại hẳn: `@Deprecated`. Tách riêng: `@PersonalOnly` (QA tự chạy).

**Thứ tự:** nhóm *Bắt buộc* → *Smoke* → *Theo điểm*; trong nhóm xếp điểm giảm dần, hoà thì theo TC ID.

**Thời lượng:** phút/TC = trung bình (thời lượng ÷ số TC đã chạy) các lần chạy trước của cùng module × nền tảng. Thời lượng lấy từ ô `Bắt đầu → Kết thúc` (ưu tiên `~N phút`). Chưa có lần chạy → **4 phút/TC**. Lần chạy có chờ người dùng gõ mật khẩu làm số phình lên — chấp nhận, vì lần chạy sau cũng sẽ chờ.

---

## 4. Xu hướng TC qua các lần chạy

Chỉ so **cùng TC ID**, **cùng nền tảng**, **chỉ lần chạy bộ TC** (checklist tách riêng). Biến thể `-a` / `-b` gộp về TC gốc, lấy kết quả xấu nhất.

| Nhóm | Điều kiện (bỏ SKIPPED) |
|---|---|
| 🎲 Lật | Đổi PASS↔FAIL ≥ 2 lần — xét trước mọi nhóm khác |
| 🆕 Mới fail | Lần cuối FAIL, lần ngay trước PASS |
| 🔁 Fail liên tục | ≥ 2 lần cuối liên tiếp FAIL |
| ❌ Fail 1 lần | Lần cuối FAIL, chỉ có 1 kết quả |
| ✅ Vừa hết fail | Lần cuối PASS, lần ngay trước FAIL |
| ⚠️ Chuyển sang BLOCKED | Lần cuối BLOCKED, từng PASS |

---

## 5. Ngưỡng cỡ mẫu

| Ngưỡng | Giá trị | Dưới ngưỡng thì |
|---|---|---|
| Lỗi thật tối thiểu để gọi "xu hướng" | 5 | Gọi là *quan sát* |
| Mốc thời gian tối thiểu (tháng có lỗi) | 3 | Không vẽ / không nói tăng giảm |

---

## Nhật ký

| Ngày | Thay đổi |
|---|---|
| 26-10-2026 | Khởi tạo |
