import type { Translation } from '../types';
import type { home as en } from '../en/home';

export const home: Translation<typeof en> = {
  bannerAlt: 'API miễn phí để thực hành kiểm thử',
  swagger: {
    title: 'Tài liệu API Swagger',
    description:
      'Hệ thống Book Management gồm API RESTful và UI được Anh Tester xây dựng dành cho việc thực hành kiểm thử API và UI. Phù hợp cho người mới học và các tester automation muốn luyện tập, kiểm thử và hoàn toàn miễn phí.',
  },
  welcome: {
    title: 'Xin chào {name}',
    signIn: 'Đăng nhập trang quản lý sách',
    descriptionAuth:
      'Bạn có thể quản lý thêm xóa sửa người dùng, sách, danh mục và khuyến mãi. Cài đặt cá nhân hóa trang quản lý đổi màu và chế độ dark mode, light mode.',
    descriptionGuest:
      'Đăng nhập vào trang quản lý sách, bao gồm tạo, cập nhật và xóa sách, danh mục, khuyến mãi và người dùng.',
  },
  stats: {
    total: 'tổng: {count} {unit}',
    user: 'Quản lý người dùng',
    book: 'Quản lý sách',
    category: 'Quản lý danh mục',
    promotion: 'Quản lý khuyến mãi',
    users: 'người dùng',
    books: 'sách',
    categories: 'danh mục',
    promotions: 'khuyến mãi',
  },
  testMessage: {
    title: 'Kiểm thử thông báo từ server',
    timeout: 'Thời gian chờ',
    statusCode: 'Mã trạng thái',
    statusCodeRequired: 'Vui lòng chọn mã trạng thái',
    loading: 'Đang tải ...',
  },
  notFound: {
    pageTitle: 'Không tìm thấy trang',
    title: 'Xin lỗi, không tìm thấy trang!',
    description:
      'Xin lỗi, chúng tôi không tìm thấy trang bạn cần. Có thể bạn đã gõ sai địa chỉ URL? Hãy kiểm tra lại chính tả.',
    goHome: 'Về trang chủ',
  },
};
