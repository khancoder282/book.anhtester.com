import type { db as en } from '../en/db';
import type { Translation } from '../types';

export const db: Translation<typeof en> = {
  title: 'Quản lý cơ sở dữ liệu',
  summary: '{tables} bảng · {rows} dòng. Chỉ hiện cấu trúc, không hiện dữ liệu từng dòng.',
  tables: 'Danh sách bảng',
  noTable: 'Không có bảng nào.',
  loadError: 'Không tải được cấu trúc cơ sở dữ liệu.',
  columnCount: '{count} cột',
  columnCountOne: '1 cột',
  rowCount: '{count} dòng',
  rowCountOne: '1 dòng',
  columns: {
    column: 'Cột',
    type: 'Kiểu',
    nullable: 'Cho phép rỗng',
    key: 'Khoá',
    default: 'Mặc định',
    references: 'Tham chiếu',
  },
};
