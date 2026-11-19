import { useEffect } from 'react';

import { useColorScheme } from '@mui/material';

import { useThemeData } from 'src/hooks/use-theme-data';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';

import { useRouter } from '../hooks';

export function CheckAuth({
  children,
  fallback,
}: React.PropsWithChildren & {
  fallback: React.ReactNode;
}) {
  const { setAuth, setChecked } = useAuth();
  const router = useRouter();
  const { setMode } = useColorScheme();
  const { setPrimary } = useThemeData();

  useEffect(() => {
    axios
      .get('/me')
      .then((res) => {
        setAuth(res.data);
        setMode(res.data.config?.theme || 'system');
        setPrimary(res.data.config?.mainColor || '#42BC40');
      })
      .catch((err) => {
        // Mất mạng (không có response) thì giữ nguyên trạng thái đăng nhập hiện tại
        if (err?.response) setAuth(null);
      })
      .finally(() => setChecked(true));
  }, [router, setAuth, setChecked, setMode, setPrimary]);

  return children;
}
