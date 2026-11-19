# Trang Cần trợ giúp (`/help`)

Thêm 2026-11-20. Code: `frontend/src/pages/help/page.tsx`. Chỉ có frontend, không có API.

- Route công khai `/help` (không cần đăng nhập), khai ở `routes/sections.tsx` cạnh `/sign-in`, `/sign-up`. Dùng `AuthLayout` (logo, nút ngôn ngữ, link "Need help?" ở header), thẻ rộng `560px`.
- Link "Need help?" / "Cần trợ giúp?" ở header của `layouts/auth/layout.tsx` trỏ tới `/help` (trước đây `href="#"`).
- Nội dung là thông tin liên hệ của Anh Tester, chép từ https://anhtester.com/contact ngày 2026-11-20. Đổi thông tin thì sửa các mảng `CONTACTS`, `SOCIALS`, `COMMUNITIES` đầu file trang. Không có địa chỉ, giờ làm việc trên trang gốc nên không đưa vào.
  - Liên hệ: điện thoại (`tel:`), email (`mailto:`), Zalo, website.
  - Mạng xã hội: Facebook, YouTube, Telegram, LinkedIn, GitHub, Discord.
  - Nhóm cộng đồng: Zalo (Automation, Manual), Facebook (Automation, Manual, Playwright Việt Nam, Tuyển dụng Tester), Telegram (Automation, Manual).
- Link `http(s)` mở tab mới (`target="_blank" rel="noopener noreferrer"`); `tel:` / `mailto:` thì không.
- Chữ qua namespace i18n `help` (`locales/{en,vi}/help.ts`). Tên nền tảng (Facebook, Zalo…) và tên nhóm tiếng Anh không dịch. Tiêu đề tab: `Need help? - …` / `Cần trợ giúp? - …` (thêm vào `EXTRA_TITLES` trong `app.tsx`).
- Icon mới đăng ký offline trong `components/iconify/icon-sets.ts`: `solar:phone-bold`, `solar:letter-bold`, `solar:global-bold`, `solar:users-group-rounded-bold`, `solar:arrow-left-linear`, `ri:{facebook-circle-fill,youtube-fill,telegram-fill,linkedin-box-fill,github-fill,discord-fill}`, `simple-icons:zalo`. Icon không có trong file này thì `Iconify` không hiện gì, nên thêm icon mới phải lấy SVG từ `api.iconify.design` rồi chép vào.

## Locator

| Phần tử | Locator |
|---|---|
| Link ở header trang sign-in / sign-up | `[data-testid="need-help-link"]` |
| Thẻ liên hệ | `[data-testid="help-contact-{phone,email,zalo,website}"]` |
| Nút mạng xã hội (có `aria-label` = tên nền tảng) | `[data-testid="help-social-{facebook,youtube,telegram,linkedin,github,discord}"]` |
| Link nhóm | `[data-testid="help-community-<nền-tảng>-<nhóm>"]`, vd `help-community-zalo-automation`, `help-community-facebook-playwright` |
| Nút quay lại đăng nhập | `[data-testid="help-back-to-sign-in"]` |
| Ba khối | `section` có `aria-label` theo ngôn ngữ (Contact / Liên hệ …) |
