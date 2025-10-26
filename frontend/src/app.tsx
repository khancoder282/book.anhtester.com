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

import { createPaletteChannel } from 'minimal-shared/utils';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useThemeData, generateColorPalette } from './hooks/use-theme-data';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
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
