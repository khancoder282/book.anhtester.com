import type { nav as en } from '../en/nav';
import type { Translation } from '../types';

export const nav: Translation<typeof en> = {
  dashboard: 'Tổng quan',
  user: 'Người dùng',
  book: 'Sách',
  category: 'Danh mục',
  promotion: 'Khuyến mãi',
  file: 'Tệp',
  database: 'Cơ sở dữ liệu',
  needHelp: 'Cần trợ giúp?',
  signIn: 'Đăng nhập',
  signUp: 'Đăng ký',
  account: {
    home: 'Trang chủ',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
  },
};
