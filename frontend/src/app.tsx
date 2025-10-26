import 'src/global.css';
import 'dayjs/locale/vi';

import dayjs from 'dayjs';

dayjs.locale('vi');

import { Toaster } from 'sonner';
import { lazy, useEffect } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { usePathname } from 'src/routes/hooks';

const ThemeProvider = lazy(() => import('src/theme/theme-provider'));

const ConfigDialog = lazy(() => import('./components/dialog-confirm/confirm-dialog'));

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        {children}
      </LocalizationProvider>
      <ConfigDialog />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
