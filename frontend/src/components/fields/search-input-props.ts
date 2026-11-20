/**
 * Thuộc tính cho thẻ <input> của mọi ô tìm kiếm (2026-11-21).
 *
 * Chrome / trình quản lý mật khẩu từng tự điền email đã lưu (VD admin@example.com) vào ô tìm ở trang
 * User ngay khi mở trang, làm danh sách bị lọc sẵn. `type="search"` + `autocomplete="off"` khiến
 * trình duyệt không coi đây là ô tên đăng nhập; các data-* để LastPass / 1Password bỏ qua.
 * Dấu × mặc định của ô search được ẩn trong global.css (đã có nút xoá riêng).
 */
export const searchInputProps = {
  type: 'search',
  autoComplete: 'off',
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-form-type': 'other',
} as const;
