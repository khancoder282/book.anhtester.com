import type { Translation } from '../types';
import type { auth as en } from '../en/auth';

export const auth: Translation<typeof en> = {
  signIn: {
    title: 'Đăng nhập',
    noAccount: 'Chưa có tài khoản?',
    getStarted: 'Đăng ký ngay',
    emailLabel: 'Địa chỉ email',
    passwordLabel: 'Mật khẩu',
    submit: 'Đăng nhập',
  },
  signUp: {
    title: 'Đăng ký',
    haveAccount: 'Đã có tài khoản?',
    signInLink: 'Đăng nhập',
    submit: 'Đăng ký',
  },
  validation: {
    emailInvalid: 'Địa chỉ email không hợp lệ',
    emailRequired: 'Vui lòng nhập email.',
    emailMaxLength: 'Email dài tối đa 191 ký tự.',
    passwordRequired: 'Vui lòng nhập mật khẩu.',
    passwordMaxLength: 'Mật khẩu dài tối đa 250 ký tự.',
  },
  toast: {
    networkError: 'Không kết nối được máy chủ. Vui lòng thử lại.',
  },
};
