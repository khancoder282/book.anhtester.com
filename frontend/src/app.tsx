import 'src/global.css';

import { Toaster } from 'sonner';
import { lazy, useEffect, useLayoutEffect } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { type TKey, useTranslate } from 'src/locales';
import { navData } from 'src/layouts/nav-config-dashboard';

const ThemeProvider = lazy(() => import('src/theme/theme-provider'));

const ConfigDialog = lazy(() => import('./components/dialog-confirm/confirm-dialog'));

import { createPaletteChannel } from 'minimal-shared/utils';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useThemeData, generateColorPalette } from './hooks/use-theme-data';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
  useRouteTitle();
  const { lang } = useTranslate();
  const { primary = '#42BC40' } = useThemeData();

  return (
    <ThemeProvider
      themeOverrides={{
        colorSchemes: {
          dark: {
            palette: {
              primary: createPaletteChannel(generateColorPalette(primary)),
            },
          },
          light: {
            palette: {
              primary: createPaletteChannel(generateColorPalette(primary)),
            },
          },
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
        {children}
      </LocalizationProvider>
      <ConfigDialog />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

const EXTRA_TITLES: { path: string; title: TKey }[] = [
  { path: '/sign-in', title: 'nav.signIn' },
  { path: '/sign-up', title: 'nav.signUp' },
  { path: '/help', title: 'help.title' },
];

/**
 * Đặt tiêu đề tab theo route ngay khi đổi trang, trước khi trang (lazy) tải xong.
 * Dùng layout effect nên chạy trước `useEffect` của <Title> trong trang: trang nào có
 * tiêu đề riêng thì vẫn ghi đè được.
 */
function useRouteTitle() {
  const pathname = usePathname();
  const { t } = useTranslate();

  useLayoutEffect(() => {
    const match = [...EXTRA_TITLES, ...navData]
      .filter((item) =>
        item.path === '/'
          ? pathname === '/'
          : pathname === item.path || pathname.startsWith(`${item.path}/`)
      )
      .sort((a, b) => b.path.length - a.path.length)[0];
    document.title = match ? `${t(match.title)} - ${CONFIG.appName}` : CONFIG.appName;
  }, [pathname, t]);
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
