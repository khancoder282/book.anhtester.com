import { useEffect } from 'react';

import { translate } from 'src/locales';
import { useAuth } from 'src/store/auth';

import { toast } from 'src/components/toast';

import { useRouter } from './use-router';
import { usePathname } from './use-pathname';

/**
 * Chuyển sang trang Sign in khi chưa đăng nhập.
 * Chờ lần gọi `/me` đầu tiên xong (`checked`) rồi mới quyết định, để mở thẳng URL / F5
 * không bị đẩy về Sign in trong lúc thông tin user còn đang tải.
 */
export const useAuthCheck = () => {
  const { auth, checked } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (checked && !auth) {
      toast.error(translate('user.toast.loginFirst'), { id: 'msg' });
      router.replace(`/sign-in?redirect=${pathname}`);
    }
  }, [auth, checked, pathname, router]);

  return { auth, checked };
};
