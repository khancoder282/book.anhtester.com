import type { Translation } from '../types';
import type { category as en } from '../en/category';

export const category: Translation<typeof en> = {
  title: 'Quản lý danh mục',
  newCategory: 'Thêm danh mục',
  searchPlaceholder: 'Tìm danh mục...',
  summary: '{count} danh mục · {links} lượt gắn sách',
  columns: {
    name: 'Tên',
    books: 'Số sách',
  },
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
