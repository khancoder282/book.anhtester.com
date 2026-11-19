import type { Translation } from '../types';
import type { help as en } from '../en/help';

export const help: Translation<typeof en> = {
  title: 'Cần trợ giúp?',
  description:
    'Liên hệ trực tiếp Anh Tester qua email hoặc Zalo. Mọi câu hỏi về ứng dụng Quản lý sách, kiểm thử API hay automation testing đều được giải đáp.',
  contact: {
    title: 'Liên hệ',
    phone: 'Điện thoại',
    email: 'Email',
    zalo: 'Zalo',
    website: 'Website',
  },
  social: {
    title: 'Theo dõi Anh Tester',
  },
  community: {
    title: 'Nhóm cộng đồng',
    automation: 'Automation Testing',
    manual: 'Manual Testing',
    playwright: 'Playwright Việt Nam',
    jobs: 'Tuyển dụng Tester',
  },
  backToSignIn: 'Quay lại đăng nhập',
};
