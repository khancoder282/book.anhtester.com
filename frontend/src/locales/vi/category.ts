import type { Translation } from '../types';
import type { category as en } from '../en/category';

export const category: Translation<typeof en> = {
  title: 'Quản lý danh mục',
  newCategory: 'Thêm danh mục',
  searchPlaceholder: 'Tìm danh mục...',
  summary: '{count} danh mục · {links} lượt gắn sách',
  columns: {
    name: 'Tên',
    status: 'Trạng thái',
    books: 'Số sách',
  },
  status: {
    active: 'Bật',
    inactive: 'Tắt',
  },
  viewBooks: 'Xem {count} sách thuộc "{name}"',
  statusToggle: 'Bật/tắt trạng thái của "{name}"',
  statusHint: 'Danh mục tắt sẽ ẩn khỏi tab lọc ở trang Sách và khỏi form sách.',
  statusChanged: 'Danh mục "{name}" đã chuyển sang {status}.',
  form: {
    name: 'Tên danh mục',
    newName: 'Tên mới',
    renameTitle: 'Đổi tên danh mục "{name}"',
  },
  validation: {
    required: 'Vui lòng nhập tên danh mục',
    maxLength: 'Tối đa {max} ký tự',
    noSlash: 'Tên danh mục không được chứa "/"',
    noChange: 'Tên mới phải khác tên cũ',
    exists: 'Danh mục đã tồn tại',
  },
  deleteConfirm: 'Xác nhận xoá danh mục "{name}".',
  deleteWarning: '{count} sách sẽ không còn thuộc danh mục này. Bản thân sách không bị xoá.',
};
