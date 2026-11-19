import { useEffect } from 'react';

import { translate } from 'src/locales';
import { useAuth } from 'src/store/auth';

import { toast } from 'src/components/toast';

import { useRouter } from './use-router';
import { usePathname } from './use-pathname';

export const useAuthCheck = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      toast.error(translate('user.toast.loginFirst'));
      router.replace(`/sign-in?redirect=${pathname}`);
    }
  }, [auth, pathname, router]);
};
