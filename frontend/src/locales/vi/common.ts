import type { Translation } from '../types';
import type { common as en } from '../en/common';

export const common: Translation<typeof en> = {
  appName: 'Book UI for api-book.anhtester.com',
  language: 'Ngôn ngữ',
  actions: {
    add: 'Thêm',
    create: 'Tạo',
    edit: 'Sửa',
    save: 'Lưu',
    update: 'Cập nhật',
    delete: 'Xoá',
    cancel: 'Huỷ',
    confirm: 'Xác nhận',
    close: 'Đóng',
    back: 'Quay lại',
    reload: 'Tải lại',
    search: 'Tìm kiếm',
    rename: 'Đổi tên',
    submit: 'Gửi',
    upload: 'Tải lên',
    download: 'Tải xuống',
  },
  status: {
    active: 'Hoạt động',
    inactive: 'Đã khoá',
    yes: 'Có',
    no: 'Không',
  },
  fields: {
    name: 'Tên',
    email: 'Email',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    description: 'Mô tả',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
  },
  noData: 'Không có dữ liệu',
  somethingWrong: 'Đã có lỗi xảy ra.',
};
