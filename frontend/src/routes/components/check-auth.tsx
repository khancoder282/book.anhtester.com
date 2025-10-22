import { useEffect } from 'react';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';

import { useRouter } from '../hooks';

export function CheckAuth({
  children,
  fallback,
}: React.PropsWithChildren & {
  fallback: React.ReactNode;
}) {
  const { setAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    axios.get('/me').then((res) => {
      setAuth(res.data);
    });
    // .catch(() => {
    //   router.replace('/sign-in');
    // });
  }, [router, setAuth]);

  // return auth ? children : fallback;
  return children;
}
