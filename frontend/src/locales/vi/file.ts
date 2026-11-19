import type { Translation } from '../types';
import type { file as en } from '../en/file';

export const file: Translation<typeof en> = {
  pageTitle: 'Quản lý tệp',
  title: 'Quản lý tệp',
  uploadFile: 'Tải tệp lên',
  searchPlaceholder: 'Tìm kiếm tệp...',
  preview: 'Xem trước',
  small: 'Thu gọn',
  used: 'Đã dùng',
  maximum: 'Tối đa',
  unselectAll: 'Bỏ chọn tất cả ({count})',
  copiedToClipboard: 'Đã sao chép vào bộ nhớ tạm',
  columns: {
    name: 'Tên',
    size: 'Kích thước',
    type: 'Loại',
    modified: 'Ngày sửa',
  },
  previewDialog: {
    title: 'Xem trước tệp',
    properties: 'Thuộc tính',
    linkPath: 'Đường dẫn',
  },
  actions: {
    copy: 'Sao chép',
    move: 'Di chuyển',
  },
  nameInvalid:
    'Tên không được chứa ký tự đặc biệt ? / \\ : * " < > | $ # @ ! % ^ & ( ) [ ] { } + = ; , ~',
  rename: {
    title: 'Đổi tên tệp hoặc thư mục',
    newName: 'Tên mới',
    newNameRequired: 'Vui lòng nhập tên mới',
    nameExists: 'Tên đã tồn tại',
    nameMustDiffer: 'Tên mới phải khác tên cũ',
  },
  destination: {
    copyTitle: 'Sao chép tệp',
    moveTitle: 'Di chuyển tệp',
    currentPath: 'Đường dẫn hiện tại',
    folder: 'Thư mục đích',
    folderPlaceholder: 'Chọn thư mục',
    folderRequired: 'Vui lòng chọn thư mục đích',
    folderNotExist: 'Thư mục đích không tồn tại',
    name: 'Tên',
    nameRequired: 'Vui lòng nhập tên',
    pathMustDiffer: 'Đường dẫn mới phải khác đường dẫn cũ',
    folderExists: 'Đã có thư mục trùng tên này',
  },
  delete: {
    confirmFile: 'Bạn có muốn xoá tệp "{name}" không?',
    confirmFolder: 'Bạn có muốn xoá thư mục "{name}" không?',
  },
  upload: {
    title: 'Tải tệp lên',
    folder: 'Thư mục tải lên',
    folderPlaceholder: 'Nhập tên thư mục hoặc dùng thư mục hiện tại',
    pathInvalid: 'Đường dẫn chỉ được chứa ký tự a-z, A-Z, 0-9, _, - và /, không bắt đầu bằng /',
    uploadIn: 'Tải lên vào: {path}',
    fileRequired: 'Vui lòng chọn tệp',
    maxFileSize: 'Mỗi tệp phải nhỏ hơn 5MB',
    maxFiles: 'Chỉ được tải lên tối đa 30 tệp',
    removeAll: 'Xoá tất cả',
  },
};
